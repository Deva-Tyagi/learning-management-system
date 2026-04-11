const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "React - 9am"
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  inCharge: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false }, // Teacher
  
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  
  scheduleDays: [{ 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  
  capacity: { type: Number, default: 50 },
  
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Inactive'], 
    default: 'Active' 
  },
  
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

// Ensure unique batch names per admin
batchSchema.index({ name: 1, adminId: 1 }, { unique: true });

module.exports = mongoose.model('Batch', batchSchema);
