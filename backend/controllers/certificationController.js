const Certification = require('../models/certificationModel');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const User = require('../models/userModel');
const fs = require('fs');
const Skill = require('../models/skillModel');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/certificates');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and PDF files are allowed!'), false);
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

// @desc    Add new certification
// @route   POST /api/certifications
// @access  Private
const addCertification = asyncHandler(async (req, res) => {
  try {
    console.log('Adding certification - Body:', {
      title: req.body.title,
      issuer: req.body.issuer,
      issueDate: req.body.issueDate
    });
    console.log('File received:', req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file received');
    console.log('Request headers:', req.headers['content-type']);

    const { title, issuer, issueDate } = req.body;

    // Validate required fields
    if (!title || !issuer || !issueDate) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // Create certification data object
    const certificationData = {
      title,
      issuer,
      issueDate: new Date(issueDate),
      user: req.user._id
    };

    // Add optional fields if they exist
    if (req.body.credentialId) certificationData.credentialId = req.body.credentialId;
    if (req.body.credentialUrl) certificationData.credentialUrl = req.body.credentialUrl;
    if (req.body.description) certificationData.description = req.body.description;

    // If file was uploaded, add the URL
    if (req.file) {
      certificationData.certificateUrl = `http://localhost:3001/uploads/certificates/${req.file.filename}`;
      console.log('Certificate URL set to:', certificationData.certificateUrl);
    }

    // Create certification
    const certification = await Certification.create(certificationData);

    // Add certification to user's certifications array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { certifications: certification._id } }
    );

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        _id: certification._id,
        title: certification.title,
        issuer: certification.issuer,
        issueDate: certification.issueDate,
        certificateUrl: certification.certificateUrl
      }
    });
    
    console.log('Certification created successfully:', {
      id: certification._id,
      hasUrl: !!certification.certificateUrl
    });

  } catch (error) {
    console.error('Error in addCertification:', error);
    // Check if it's a multer error
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size limit exceeded (5MB maximum)'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field name'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding certification'
    });
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
  const certification = await Certification.findById(req.params.id).populate('skills');

  if (!certification) {
    res.status(404);
    throw new Error('Certification not found');
  }

  // Check if the certification belongs to the user
  if (certification.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Delete the certification file if it exists
  if (certification.certificateUrl) {
    const filePath = path.join(__dirname, '..', certification.certificateUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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

  // Delete the certification
  await Certification.deleteOne({ _id: certification._id });

  res.json({ 
    success: true,
    message: 'Certification removed successfully'
  });
});

// @desc    List all certificate files
// @route   GET /api/certifications/files
// @access  Private
const listCertificateFiles = asyncHandler(async (req, res) => {
  const uploadDir = path.join(__dirname, '../uploads/certificates');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      res.status(500);
      throw new Error('Error reading certificate files');
    }
    
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        path: `/uploads/certificates/${file}`,
        fullUrl: `http://localhost:3001/uploads/certificates/${file}`,
        createdAt: stats.birthtime
      };
    });
    
    res.json({
      success: true,
      count: files.length,
      files: fileDetails
    });
  });
});

module.exports = {
  getCertifications,
  getCertification,
  addCertification,
  updateCertification,
  deleteCertification,
  listCertificateFiles,
  upload
}; 