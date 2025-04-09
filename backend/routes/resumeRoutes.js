const express = require('express');
const router = express.Router();
const { generateResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateResume);

module.exports = router; 