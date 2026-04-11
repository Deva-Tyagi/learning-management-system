const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Institute Admin', 'Manager', 'Teacher', 'Receptionist'], 
    default: 'Teacher' 
  },
  specialization: { type: String, trim: true, default: '' }, // Mostly for Teachers
  baseSalary: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

// Ensure unique emails platform-wide for login
staffSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Staff', staffSchema);
