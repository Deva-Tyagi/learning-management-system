const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema({
  centerName: { type: String, required: true, trim: true },
  centerCode: { type: String, required: true, trim: true, unique: true },
  directorName: { type: String, trim: true },
  phone: { type: String, trim: true },
  altPhone: { type: String, trim: true },
  email: { type: String, trim: true },
  address: { type: String, trim: true },
  state: { type: String, trim: true },
  district: { type: String, trim: true },
  city: { type: String, trim: true },
  pincode: { type: String, trim: true },
  noOfComputer: { type: Number, default: 0 },
  noOfTeacher: { type: Number, default: 0 },
  noOfRoom: { type: Number, default: 0 },
  spaceSqFeet: { type: Number, default: 0 },
  regDate: { type: Date },
  fees: { type: Number, default: 0 },
  validity: { type: String, trim: true },
  validityMonthYear: { type: String, trim: true },
  remarks: { type: String, trim: true },
  username: { type: String, trim: true },
  password: { type: String, trim: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  directorPhoto: { type: String, default: '' },
  signature: { type: String, default: '' },
  centerPhoto: { type: String, default: '' },
  otherDocument: { type: String, default: '' },
  aadharCard: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Franchise', franchiseSchema);
