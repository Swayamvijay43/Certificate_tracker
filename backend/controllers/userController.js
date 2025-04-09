const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    profileUrl: name.toLowerCase().replace(/\s+/g, '-')
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt for email:', email);

  // Find user by email and include password field
  const user = await User.findOne({ email }).select('+password');
  
  console.log('User found:', user ? 'Yes' : 'No');

  if (user) {
    // Compare passwords
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid password');
    }
  } else {
    res.status(401);
    throw new Error('User not found');
  }
});

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate({
      path: 'certifications',
      select: 'title issuer issueDate credentialId credentialUrl description'
    })
    .populate({
      path: 'skills',
      select: 'name category level description'
    });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Log user data for debugging
  console.log('User data:', {
    id: user._id,
    name: user.name,
    skillCount: user.skills?.length || 0,
    certCount: user.certifications?.length || 0,
    skills: user.skills
  });

  res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.publicProfile = req.body.publicProfile ?? user.publicProfile;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      publicProfile: updatedUser.publicProfile,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get public profile
// @route   GET /api/users/public/:profileUrl
// @access  Public
const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ profileUrl: req.params.profileUrl })
    .populate('skills')
    .populate('certifications');

  if (user && user.publicProfile) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('Profile not found or not public');
  }
});

// @desc    Upload profile image
// @route   POST /api/users/upload
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.profileImage = req.file.path;
    await user.save();
    res.json({ message: 'Image uploaded successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }
  
  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ],
    publicProfile: true
  })
  .select('name email bio profileImage')
  .limit(10);
  
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name email bio profileImage publicProfile')
    .populate('skills', 'name category level')
    .populate('certifications', 'title issuer issueDate expiryDate');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (!user.publicProfile && user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('This profile is private');
  }
  
  res.json(user);
});

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide both current and new password');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if current password matches
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getPublicProfile,
  uploadProfileImage,
  searchUsers,
  getUserById,
  changePassword
}; 