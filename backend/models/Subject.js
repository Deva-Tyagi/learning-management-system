const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  code:     { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['computerCourses', 'englishCourses', 'distanceLearning', 'other'],
    default: 'computerCourses',
  },
  adminId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

// unique per admin
subjectSchema.index({ name: 1, adminId: 1 }, { unique: true });
subjectSchema.index({ code: 1, adminId: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
