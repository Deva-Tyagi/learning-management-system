const mongoose = require('mongoose');

const IdCardSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // Reference to Admin
  issueDate: { type: Date, default: Date.now },
  validThrough: { type: Date }, // Optionally set expiry/validity
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'CardTemplate' }
});

module.exports = mongoose.model('IdCard', IdCardSchema);
