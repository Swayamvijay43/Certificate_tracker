# Skill Certification Tracker

A full-stack web application for tracking and managing professional certifications and skills. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User authentication and authorization
- Certificate upload and analysis using Gemini AI
- Skill tracking and management
- Profile management
- Certificate verification
- Public profile sharing
- Profile comparison

## Tech Stack

### Frontend
- React.js
- Material-UI
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Google's Gemini AI API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud Platform account (for Gemini AI API)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd skill-certification-tracker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a .env file in the backend directory with the following variables:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/skill_tracker
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at http://localhost:3000

## API Documentation

### Authentication Endpoints
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/me - Get current user profile

### Certification Endpoints
- POST /api/certifications - Add new certification
- GET /api/certifications - Get user's certifications
- POST /api/certifications/analyze - Analyze certificate

### Profile Endpoints
- PUT /api/users/profile - Update user profile
- PUT /api/users/password - Change password
- POST /api/users/upload - Upload profile image

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for powering the certificate analysis
- Material-UI for the frontend components
- All contributors who have helped shape this project 