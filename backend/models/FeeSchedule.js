const mongoose = require('mongoose');

const feeScheduleSchema = new mongoose.Schema({
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  sequence: { type: Number, required: true }, // 1..N
  type: { type: String, enum: ['MONTHLY', 'INSTALLMENT', 'FULL'], required: true },
  label: { type: String }, // e.g., "Oct 2025", "Installment 1/3"
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true, index: true },
  status: { type: String, enum: ['DUE', 'PAID', 'PARTIAL', 'OVERDUE'], default: 'DUE', index: true },
  paidAt: { type: Date },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true }
}, { timestamps: true });

feeScheduleSchema.index({ adminId: 1, studentId: 1, status: 1 });

module.exports = mongoose.model('FeeSchedule', feeScheduleSchema);
