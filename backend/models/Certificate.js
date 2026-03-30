const mongoose = require('mongoose');
const certificateSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: String, required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  issueDate: { type: Date, default: Date.now },
  certificateNumber: { type: String, unique: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'CardTemplate' }, // reference to design template
  grade: { type: String, default: '' },
  remarks: { type: String, default: '' },
  fileUrl: { type: String, default: '' }, // path to generated PDF/image
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  }
}, { timestamps: true });

certificateSchema.index({ studentId: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
