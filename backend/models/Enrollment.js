const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // NEW
  courseName: { type: String, required: true },
  doj: { type: Date, required: true },
  scheme: { type: String, enum: ['MONTHLY', 'FULL', 'INSTALLMENT'], required: true },
  registrationFee: { type: Number, default: 500 },
  customizedTotalFee: { type: Number }, // optional override
  monthlyFee: { type: Number },         // for MONTHLY
  durationMonths: { type: Number },     // for MONTHLY
  totalCourseFee: { type: Number, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
