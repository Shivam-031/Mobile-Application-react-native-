const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: Number,
    carbonSaved: Number,
  }],
  totalAmount: { type: Number, required: true },
  totalCarbonSaved: { type: Number, default: 0 },
  address: {
    name: String, phone: String, line1: String, line2: String,
    city: String, state: String, pincode: String,
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'placed',
  },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: String,
  trackingId: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
