const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  public_id: { type: String },
  uploadDate: { type: Date, default: Date.now },
  assignedTo: { 
    type: String, 
    enum: ['all', 'course', 'batch', 'student'], 
    default: 'all' 
  },
  course: { type: String, default: '' },
  batch: { type: String, default: '' },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    }
  }, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);