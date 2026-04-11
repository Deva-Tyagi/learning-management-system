const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  instituteName: {
    type: String,
    required: true,
  },
  field: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['Basic', 'Premium', 'Enterprise'],
    default: 'Basic',
  },
  planDuration: {
    type: Number, // In days
    default: 30,
  },
  planStartDate: {
    type: Date,
    default: Date.now,
  },
  planExpiryDate: {
    type: Date,
  },
  isTemporaryPassword: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  settings: {
    registrationFee: { type: Number, default: 500 },
    feeTemplates: [{
      name: String,
      scheme: { type: String, enum: ['MONTHLY', 'INSTALLMENT', 'LUMP_SUM'] },
      amount: Number
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
