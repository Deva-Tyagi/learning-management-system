const mongoose = require('mongoose');

const demoInquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  instituteName: {
    type: String,
  },
  plan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise', 'trial'],
  },
  message: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Converted', 'Ignored'],
    default: 'Pending',
  }
}, { timestamps: true });

module.exports = mongoose.model('DemoInquiry', demoInquirySchema);
