const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  scientificName: { type: String, required: true },
  description: String,
  image: { url: String, publicId: String },
  category: { type: String, enum: ['native', 'protected', 'exotic', 'medicinal'], required: true },
  speciesCount: { type: Number, default: 0 },
  carbonAbsorption: { type: String, enum: ['Low', 'Medium', 'High', 'Very High'], required: true },
  benefits: String,
  states: [String],
  districts: [String],
  region: String,
  isEndangered: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

plantSchema.index({ name: 'text', scientificName: 'text' });
module.exports = mongoose.model('Plant', plantSchema);
