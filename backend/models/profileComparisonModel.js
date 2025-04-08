const mongoose = require('mongoose');

const profileComparisonSchema = mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  analysis: {
    commonSkills: [{
      name: String,
      proficiency: String
    }],
    uniqueSkills: [{
      user: String,
      skills: [{
        name: String,
        proficiency: String
      }]
    }],
    certificationComparison: {
      common: [{
        title: String,
        issuer: String
      }],
      unique: [{
        user: String,
        certifications: [{
          title: String,
          issuer: String
        }]
      }]
    },
    recommendations: {
      skillGaps: [{
        skill: String,
        suggestedCertifications: [String]
      }],
      careerPaths: [{
        path: String,
        requiredSkills: [String],
        suggestedCertifications: [String]
      }]
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProfileComparison', profileComparisonSchema); 