const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  batch: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., "10:00 AM"
  duration: { type: Number, required: true }, // in minutes
  meetingLink: { type: String, required: true },
  platform: { type: String, enum: ['Zoom', 'Google Meet', 'Microsoft Teams', 'Other'], default: 'Zoom' },
  status: { type: String, enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'], default: 'Scheduled' },
  recordingLink: { type: String, default: '' },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
