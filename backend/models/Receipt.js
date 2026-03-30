const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
  receiptNumber: { type: String, required: true, unique: true, index: true },
  pdfUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
