const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'CardTemplate' },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  marks: [{ subject: String, score: Number, max: Number }]
}, { timestamps: true });

module.exports = mongoose.model('Marksheet', marksheetSchema);
