const mongoose = require('mongoose');

const admitCardSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }, // NEW
  course: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'CardTemplate' },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', index: true }, // Added for isolation
  serialNumber: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('AdmitCard', admitCardSchema);
