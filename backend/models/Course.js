// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Basic course info
  name:       { type: String, required: true, trim: true, unique: true },
  courseCode: { type: String, trim: true, default: '' },           // NEW — auto or manual
  category: {
    type: String,
    required: true,
    enum: ['computerCourses', 'englishCourses', 'distanceLearning'],
    default: 'computerCourses',
  },
  link: { type: String, default: '#' },

  // Visuals and descriptions
  image: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  fullDescription: { type: String, default: '' },

  // Legacy details
  duration: { type: String, default: '' },
  fees: { type: Number, default: 0 }, // legacy "total fee"

  // New fee fields for scheduling
  monthlyFee: { type: Number, default: 0 },
  durationMonths: { type: Number, default: 0 },
  totalFee: { type: Number, default: 0 },

  level:  { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  feeType: { type: String, enum: ['Monthly', 'Fixed'], default: 'Fixed' }, // NEW — sets default scheme
  defaultInstallments: { type: Number, default: 3 }, // NEW — default split for Fixed courses
  status: { type: String, enum: ['Active', 'Inactive', 'Completed'], default: 'Active' }, // NEW
  // Subjects linked to this course (ref Subject model)
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],  // NEW

  // Arrays
  learningOutcomes: [String],
  curriculum: [{ module: String, topics: [String], duration: String }],
  whyThisCourse: [String],
  prerequisites: [String],
  toolsUsed: [String],
  careerOpportunities: [String],

  // Status and ordering
  certificateProvided: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  }
}, { timestamps: true });

// Normalize fees before save for backward compatibility
courseSchema.pre('save', function(next) {
  // Prefer explicit totalFee if provided
  if (!this.totalFee || this.totalFee <= 0) {
    if (this.fees && this.fees > 0) {
      this.totalFee = this.fees;
    } else if (this.monthlyFee > 0 && this.durationMonths > 0) {
      this.totalFee = Number(this.monthlyFee) * Number(this.durationMonths);
    }
  }
  next();
});

// Create link after first save without recursive save loops
courseSchema.post('save', function(doc, next) {
  if (!doc.link || doc.link === '#') {
    const newLink = `/courses/${doc._id}`;
    doc.model('Course')
      .updateOne({ _id: doc._id }, { $set: { link: newLink } })
      .then(() => next())
      .catch(next);
  } else {
    next();
  }
});

module.exports = mongoose.model('Course', courseSchema);
