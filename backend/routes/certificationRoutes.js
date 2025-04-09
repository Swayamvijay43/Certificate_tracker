const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addCertification,
  getCertifications,
  getCertification,
  updateCertification,
  deleteCertification,
  analyzeCertificationFile,
  upload
} = require('../controllers/certificationController');
const { textModel, testGeminiConnection } = require('../config/geminiConfig');

// Test route for Gemini AI - no auth required for testing
router.get('/test-gemini', async (req, res) => {
  try {
    console.log('Testing Gemini AI configuration...');
    
    // Test the connection
    await testGeminiConnection();
    
    // If we get here, the test was successful
    res.json({ 
      success: true, 
      message: 'Gemini AI connection test successful'
    });
  } catch (error) {
    console.error('Gemini AI test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// All routes below this are protected
router.use(protect);

// Get all certifications
router.get('/', getCertifications);

// Get single certification
router.get('/:id', getCertification);

// Add new certification
router.post('/', upload.single('certificateFile'), addCertification);

// Analyze certificate
router.post('/analyze', upload.single('certificateFile'), analyzeCertificationFile);

// Update certification
router.put('/:id', updateCertification);

// Delete certification
router.delete('/:id', deleteCertification);

module.exports = router; 