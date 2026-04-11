const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  subjectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  materialType: { type: String, enum: ['Theoretical', 'Practical'], default: 'Theoretical' },
  fileUrl:      { type: String, required: true },   // S3 key or presigned URL key
  fileName:     { type: String, default: '' },       // original filename for display
  fileSize:     { type: Number, default: 0 },        // bytes
  mimeType:     { type: String, default: '' },
  version:      { type: Number, default: 1 },        // auto-incremented on update
  adminId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
