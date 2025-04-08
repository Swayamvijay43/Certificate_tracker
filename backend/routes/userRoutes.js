const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getPublicProfile,
  uploadProfileImage,
  searchUsers,
  getUserById,
  changePassword
} = require('../controllers/userController');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/public/:profileUrl', getPublicProfile);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/upload', protect, upload.single('image'), uploadProfileImage);
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserById);

module.exports = router; 