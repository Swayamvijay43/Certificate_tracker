const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  credentialId: String,
  credentialUrl: String,
  description: String,
  certificateFile: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  aiAnalysis: {
    extractedInfo: {
      title: String,
      issuer: String,
      issueDate: Date,
      credentialId: String
    },
    validation: {
      matches: [String],
      discrepancies: [String]
    },
    suggestedSkills: [String],
    category: String,
    authenticity: {
      authenticity_score: Number,
      confidence_level: {
        type: String,
        enum: ['high', 'medium', 'low']
      },
      flags: [String],
      recommendations: [String]
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certification', certificationSchema); 