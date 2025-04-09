const Certification = require('../models/certificationModel');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const User = require('../models/userModel');
const fs = require('fs');
const { analyzeCertificate, validateCertificateAuthenticity } = require('../utils/certificateAnalyzer');
const { extractSkillsFromCertificate, addExtractedSkillsToUser } = require('../utils/skillExtractor');

// Load environment variables
const CERTIFICATE_AUTHENTICITY_THRESHOLD = parseFloat(process.env.CERTIFICATE_AUTHENTICITY_THRESHOLD || '0.5');

// Configure multer for file upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @desc    Get all certifications
// @route   GET /api/certifications
// @access  Private
const getCertifications = asyncHandler(async (req, res) => {
  const certifications = await Certification.find({ user: req.user._id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(certifications);
});

// @desc    Get single certification
// @route   GET /api/certifications/:id
// @access  Private
const getCertification = asyncHandler(async (req, res) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    res.status(404);
    throw new Error('Certification not found');
  }

  // Check if the certification belongs to the user
  if (certification.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.json(certification);
});

// @desc    Add a new certification
// @route   POST /api/certifications
// @access  Private
const addCertification = asyncHandler(async (req, res) => {
  try {
    const { title, issuer, issueDate, credentialId, credentialUrl, description } = req.body;
    
    // Validate required fields
    if (!title || !issuer || !issueDate) {
      return res.status(400).json({ message: 'Title, issuer, and issue date are required' });
    }

    let aiAnalysis = null;
    let authenticity = null;
    let extractedSkills = [];

    // Check if confirmedSkills are provided from the frontend
    if (req.body.confirmedSkills) {
      try {
        extractedSkills = JSON.parse(req.body.confirmedSkills);
        console.log('Using confirmed skills from frontend:', extractedSkills);
      } catch (error) {
        console.error('Error parsing confirmedSkills:', error);
      }
    }

    // If a certificate file is uploaded, analyze it
    if (req.file) {
      try {
        // Determine file type
        const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';
        
        // Analyze certificate
        aiAnalysis = await analyzeCertificate(
          req.file.buffer,
          fileType,
          { title, issuer, issueDate, credentialId }
        );

        // Validate authenticity
        authenticity = await validateCertificateAuthenticity(aiAnalysis);

        // If there are major discrepancies, flag them
        if (authenticity.authenticity_score < CERTIFICATE_AUTHENTICITY_THRESHOLD) {
          return res.status(400).json({
            message: 'Certificate validation failed',
            analysis: aiAnalysis,
            authenticity: authenticity
          });
        }
      } catch (error) {
        console.error('AI Analysis Error:', error);
        // Continue with certification creation even if AI analysis fails
      }
    }

    // Extract skills from certificate information if not provided from frontend
    if (extractedSkills.length === 0) {
      try {
        extractedSkills = await extractSkillsFromCertificate({
          title,
          issuer,
          description,
          aiAnalysis
        });
      } catch (error) {
        console.error('Skill Extraction Error:', error);
        // Continue with certification creation even if skill extraction fails
      }
    }

    const certification = new Certification({
      user: req.user.id,
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,
      description,
      certificateFile: req.file ? `${Date.now()}-${req.file.originalname}` : undefined,
      aiAnalysis: aiAnalysis ? {
        extractedInfo: aiAnalysis.extracted_info,
        validation: aiAnalysis.validation,
        suggestedSkills: aiAnalysis.suggested_skills,
        category: aiAnalysis.category,
        authenticity: authenticity
      } : undefined
    });

    await certification.save();

    // Save the file to disk after successful analysis
    if (req.file) {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      await fs.promises.writeFile(
        path.join(uploadDir, certification.certificateFile),
        req.file.buffer
      );
    }

    // Add certification to user's certifications array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { certifications: certification._id } }
    );

    // Add extracted skills to user's profile
    let addedSkills = [];
    if (extractedSkills.length > 0) {
      try {
        addedSkills = await addExtractedSkillsToUser(req.user.id, extractedSkills);
      } catch (error) {
        console.error('Error adding skills:', error);
      }
    }

    // Prepare response
    const response = {
      certification,
      message: 'Certification added successfully'
    };

    if (addedSkills.length > 0) {
      response.addedSkills = addedSkills;
      response.message += ` with ${addedSkills.length} new skills extracted`;
    }

    if (aiAnalysis?.suggested_skills) {
      response.suggestedSkills = aiAnalysis.suggested_skills;
    }

    if (authenticity) {
      response.authenticity = authenticity;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating certification:', error);
    res.status(500).json({ message: 'Error creating certification' });
  }
});

// @desc    Update certification
// @route   PUT /api/certifications/:id
// @access  Private
const updateCertification = asyncHandler(async (req, res) => {
  const certification = await Certification.findById(req.params.id);

  if (!certification) {
    res.status(404);
    throw new Error('Certification not found');
  }

  // Check if the certification belongs to the user
  if (certification.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedCertification = await Certification.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedCertification);
});

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
// @access  Private
const deleteCertification = asyncHandler(async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Check if the certification belongs to the user
    if (certification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this certification'
      });
    }

    // Delete the certification file if it exists
    if (certification.certificateFile) {
      try {
        const filePath = path.join(__dirname, '../uploads', certification.certificateFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      } catch (fileError) {
        console.error('Error deleting certificate file:', fileError);
        // Continue with deletion even if file removal fails
      }
    }

    // Remove the certification from the user's certifications array
    const user = await User.findById(req.user._id);
    if (user) {
      user.certifications = user.certifications.filter(
        cert => cert.toString() !== certification._id.toString()
      );
      await user.save();
    }

    // Use findByIdAndDelete instead of remove()
    await Certification.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({ 
      success: true,
      message: 'Certification successfully removed',
      certificationId: req.params.id
    });
  } catch (error) {
    console.error('Error in deleteCertification:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting certification',
      error: error.message
    });
  }
});

// @desc    Analyze certificate file
// @route   POST /api/certifications/analyze
// @access  Private
const analyzeCertificationFile = asyncHandler(async (req, res) => {
  try {
    console.log('Starting certificate analysis...');
    console.log('Request headers:', req.headers);
    
    // Check if file was uploaded
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log file details
    console.log('File details:', {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer,
      bufferLength: req.file.buffer ? req.file.buffer.length : 0
    });

    // Validate file type
    if (!req.file.mimetype.startsWith('image/') && req.file.mimetype !== 'application/pdf') {
      console.error('Invalid file type:', req.file.mimetype);
      return res.status(400).json({ 
        message: 'Invalid file type. Please upload a PDF or image file (JPEG, PNG)' 
      });
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      console.error('File too large:', req.file.size);
      return res.status(400).json({ 
        message: `File size (${(req.file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum limit of 5MB` 
      });
    }

    // Get user input from request body
    const { title, issuer, issueDate, credentialId } = req.body;
    console.log('User input:', { title, issuer, issueDate, credentialId });

    // Determine file type
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';
    console.log('File type determined:', fileType);

    try {
      // Analyze certificate
      console.log('Starting certificate analysis...');
      const aiAnalysis = await analyzeCertificate(
        req.file.buffer,
        fileType,
        { title, issuer, issueDate, credentialId }
      );
      console.log('AI Analysis completed:', JSON.stringify(aiAnalysis, null, 2));

      // Validate authenticity
      console.log('Starting authenticity validation...');
      const authenticity = await validateCertificateAuthenticity(aiAnalysis);
      console.log('Authenticity validation completed:', JSON.stringify(authenticity, null, 2));

      // Extract skills
      console.log('Starting skill extraction...');
      const extractedSkills = await extractSkillsFromCertificate({
        title: title || aiAnalysis.extracted_info.title,
        issuer: issuer || aiAnalysis.extracted_info.issuer,
        description: req.body.description,
        aiAnalysis
      });
      console.log('Skills extracted:', JSON.stringify(extractedSkills, null, 2));

      res.json({
        analysis: aiAnalysis,
        authenticity,
        extractedSkills,
        message: 'Certificate analyzed successfully'
      });
    } catch (analysisError) {
      console.error('Error during analysis process:', analysisError);
      console.error('Analysis error stack:', analysisError.stack);
      return res.status(500).json({ 
        message: 'Error analyzing certificate',
        error: analysisError.message,
        stack: process.env.NODE_ENV === 'development' ? analysisError.stack : undefined
      });
    }
  } catch (error) {
    console.error('Error in analyzeCertificationFile:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error analyzing certificate',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = {
  getCertifications,
  getCertification,
  addCertification,
  updateCertification,
  deleteCertification,
  analyzeCertificationFile,
  upload
}; 