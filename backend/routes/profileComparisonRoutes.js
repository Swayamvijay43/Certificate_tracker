const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { searchProfiles, compareProfiles } = require('../controllers/profileComparisonController');

router.get('/search', searchProfiles);
router.post('/compare', protect, compareProfiles);

module.exports = router; 