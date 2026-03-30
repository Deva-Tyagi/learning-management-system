const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', index: true, required: true },
  enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', index: true, required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeSchedule', index: true, required: true },
  kind: { type: String, enum: ['PRE_DUE','ON_DUE','POST_DUE'], required: true },
  scheduledAt: { type: Date, required: true },
  sentAt: { type: Date },
  status: { type: String, enum: ['SCHEDULED','SENT','FAILED'], default: 'SCHEDULED' },
  providerId: { type: String }, // WAMID/message id
  error: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ReminderLog', reminderLogSchema);
