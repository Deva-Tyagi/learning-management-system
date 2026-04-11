const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'descriptive', 'short-answer'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }], // For MCQ questions
  correctAnswer: {
    type: String // For MCQ: option index, for others: sample answer
  },
  marks: {
    type: Number,
    required: true,
    default: 1
  },
  order: {
    type: Number,
    default: 0
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  course: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: false
  },
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: []
  }],
  examDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "HH:MM"
  },
  endTime: {
    type: String,
    required: true // Format: "HH:MM"
  },
  duration: {
    type: Number,
    required: true // Duration in minutes
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passingMarks: {
    type: Number,
    required: true
  },
  questions: [questionSchema],
  instructions: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  showResultsImmediately: {
    type: Boolean,
    default: false
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  automaticSerialization: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  }
}, {
  timestamps: true
});

// Indexes for better performance
examSchema.index({ course: 1, batch: 1 });
examSchema.index({ examDate: 1 });
examSchema.index({ isActive: 1 });

module.exports = mongoose.model('Exam', examSchema);
