const mongoose = require('mongoose');

const staffSalaryPaymentSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  month: { type: String, required: true }, // Format: "YYYY-MM"
  baseSalary: { type: Number, required: true }, 
  extraLeaves: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  amountPaid: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  remarks: { type: String, trim: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('StaffSalaryPayment', staffSalaryPaymentSchema);
