const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const Certification = require('../models/certificationModel');
const {
  getCertifications,
  getCertification,
  addCertification,
  updateCertification,
  deleteCertification,
  listCertificateFiles,
  upload
} = require('../controllers/certificationController');

// Protected routes
router.use(protect);

router.route('/files')
  .get(listCertificateFiles);

// Test route for file uploads
router.post('/test-upload', upload.single('certificate'), (req, res) => {
  console.log('Test upload route called');
  console.log('Request content-type:', req.headers['content-type']);
  console.log('File received:', req.file ? {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'No file received');
  console.log('Body fields:', req.body);
  
  if (req.file) {
    return res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `http://localhost:3001/uploads/certificates/${req.file.filename}`
      }
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
});

router.route('/')
  .get(getCertifications)
  .post(upload.single('certificate'), addCertification);

router.route('/:id')
  .get(getCertification)
  .put(updateCertification)
  .delete(deleteCertification);

// Route for uploading certificate to existing certification
router.post('/:id/upload', upload.single('certificate'), asyncHandler(async (req, res) => {
  try {
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
    
    // If file was uploaded, update the URL
    if (req.file) {
      certification.certificateUrl = `http://localhost:3001/uploads/certificates/${req.file.filename}`;
      await certification.save();
      
      res.json({
        success: true,
        message: 'Certificate uploaded successfully',
        certificateUrl: certification.certificateUrl
      });
    } else {
      res.status(400);
      throw new Error('No file uploaded');
    }
  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading certificate'
    });
  }
}));

module.exports = router; 