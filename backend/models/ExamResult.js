const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: String,
    default: ''
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  marksObtained: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // Time in seconds
    default: 0
  }
});

const examResultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  answers: [answerSchema],
  totalMarks: {
    type: Number,
    required: true
  },
  marksObtained: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    default: 'F'
  },
  status: {
    type: String,
    enum: ['started', 'submitted', 'auto-submitted', 'pending-review'],
    default: 'started'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  submitTime: {
    type: Date
  },
  timeTaken: {
    type: Number, // Total time in minutes
    default: 0
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: {
    type: Date
  },
  remarks: {
    type: String,
    default: ''
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  }
}, {
  timestamps: true
});

// Ensure one result per student per exam
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

// Calculate grade based on percentage
examResultSchema.pre('save', function(next) {
  const percentage = this.percentage;
  
  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C';
  else if (percentage >= 40) this.grade = 'D';
  else this.grade = 'F';
  
  next();
});

module.exports = mongoose.model('ExamResult', examResultSchema);
