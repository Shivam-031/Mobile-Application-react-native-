const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true, trim: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managerName: { type: String, required: true },
  phone: String, email: String,
  address: { line1: String, city: String, pincode: String },
  isActive: { type: Boolean, default: true },
  stats: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalCarbonImpact: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    plantCount: { type: Number, default: 0 },
  },
  verifiedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
