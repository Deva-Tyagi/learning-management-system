const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  ip: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
