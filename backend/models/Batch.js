const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true
  },
  startTime: {
    type: String, // e.g., "08:00 AM"
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String, // e.g., "09:00 AM"
    required: [true, 'End time is required']
  },
  days: [{
    type: String, // e.g., ["Monday", "Tuesday", ...]
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Ensure unique batch names per admin
batchSchema.index({ name: 1, adminId: 1 }, { unique: true });

module.exports = mongoose.model('Batch', batchSchema);
