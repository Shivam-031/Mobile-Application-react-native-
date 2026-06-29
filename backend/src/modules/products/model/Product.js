const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['small', 'medium', 'large', 'decorative', 'custom'], required: true },
  description: { type: String },
  images: [{ url: String, publicId: String }],
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  carbonSaved: { type: Number, default: 0 },  // kg CO2 saved per unit
  ecoRating: { type: Number, min: 1, max: 5, default: 3 },
  location: { type: String, required: true },
  state: { type: String, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String },
  soldCount: { type: Number, default: 0 },
  tags: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ state: 1, category: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
