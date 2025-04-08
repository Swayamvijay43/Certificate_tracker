const mongoose = require('mongoose');

const skillSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a skill name'],
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  description: {
    type: String
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  certifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certification'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema); 