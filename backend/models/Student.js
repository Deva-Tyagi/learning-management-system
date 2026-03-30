const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    default: '',
  },
  franchise: {
    type: String,
    default: '',
  },
  registrationNo: {
    type: String,
    default: '',
  },
  rollNumber: {
    type: String,
    default: '',
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: '',
  },
  religion: {
    type: String,
    default: '',
  },
  caste: {
    type: String,
    default: '',
  },
  bloodGroup: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  district: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  pincode: {
    type: String,
    default: '',
  },
  document: {
    type: String,
    default: '',
  },
  signature: {
    type: String,
    default: '',
  },
  fatherName: {
    type: String,
    default: '',
  },
  motherName: {
    type: String,
    default: '',
  },
  guardianPhone: {
    type: String,
    default: '',
  },
  guardianAddress: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  referralCode: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    default: '',
  },
  photo: {
    type: String,            // Store relative path or URL to their photo
    default: '',
  },
  dob: {                     // Date of Birth for ID card
    type: Date,
  },
  admissionDate: {           // Date they joined
    type: Date,
    default: Date.now,
  },
  admissionYear: {           // For ID card
    type: Number,
  },
  feesPaid: {
    type: Number,
    default: 0,
  },
  totalFees: {
    type: Number,
    default: 0,
  },
  feeStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'partial'],
    default: 'unpaid',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  firstLogin: {
    type: Boolean,
    default: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  }
}, {
  timestamps: true
});

// Hash password before saving - ONLY if password is modified
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method for login
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Automatically set fee status based on paid amount
studentSchema.pre('save', function (next) {
  if (this.feesPaid >= this.totalFees && this.totalFees > 0) {
    this.feeStatus = 'paid';
  } else if (this.feesPaid > 0) {
    this.feeStatus = 'partial';
  } else {
    this.feeStatus = 'unpaid';
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
