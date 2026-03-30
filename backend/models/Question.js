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
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionGroup',
    required: false // Can be assigned later
  },
  course: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
