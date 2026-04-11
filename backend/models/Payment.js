const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true, index: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeSchedule', required: true, index: true },
  amount: { type: Number, required: true },
  mode: { type: String, enum: ['CASH', 'UPI', 'CARD', 'BANK', 'OTHER'], default: 'CASH' },
  transactionId: { type: String }, // NEW
  discount: { type: Number, default: 0 }, // NEW
  paidOn: { type: Date, default: Date.now },
  notes: { type: String },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
