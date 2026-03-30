const mongoose = require('mongoose');

const cardTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['id-card', 'certificate', 'admit-card', 'marksheet'],
    required: true,
  },
  orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
  fontSize: { type: Number, default: 14 },
  fontColor: { type: String, default: '#000000' },
  fontFamily: { type: String, default: 'Arial' },
  templateText: { type: String, default: '' },
  backgroundImage: { type: String, default: '' },
  elements: [{
    token: { type: String },
    label: { type: String },
    x: { type: Number, default: 30 },
    y: { type: Number, default: 30 },
    fontSize: { type: Number },
    fontColor: { type: String },
    fontWeight: { type: String },
    width: { type: Number },
    height: { type: Number }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('CardTemplate', cardTemplateSchema);
