const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

holidaySchema.index({ date: 1, adminId: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
