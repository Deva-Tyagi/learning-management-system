const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  summary: {
    type: String,
    default: '',
  },
  education: [{
    institution: String,
    degree: String,
    startYear: String,
    endYear: String,
    percentage: String,
  }],
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String,
  }],
  skills: [{
    category: String,
    list: String,
  }],
  projects: [{
    title: String,
    link: String,
    description: String,
  }],
  languages: [{
    type: String,
  }],
  templateId: {
    type: String,
    default: 'ats-standard',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
