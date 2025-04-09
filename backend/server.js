// Load environment variables first
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const skillRoutes = require('./routes/skillRoutes');
const profileComparisonRoutes = require('./routes/profileComparisonRoutes');
const fs = require('fs');

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create certificates directory if it doesn't exist
const certificatesDir = path.join(uploadsDir, 'certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/profiles', profileComparisonRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(err.errors).map(error => error.message).join(', ')
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'This email is already registered'
    });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server'
  });
});

const PORT = process.env.PORT || 3001;
console.log('Server configuration:', {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI?.split('?')[0], // Log URI without credentials
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 