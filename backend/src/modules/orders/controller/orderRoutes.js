const express = require('express');
const router = express.Router();
const Order = require('../model/Order');
const Product = require('../../products/model/Product');
const { protect, authorize } = require('../../../middleware/authMiddleware');

// POST /orders - place order
router.post('/', protect, async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body;
    let totalAmount = 0;
    let totalCarbonSaved = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'approved') throw new Error(`Product not available: ${item.productId}`);
      if (product.stock < item.qty) throw new Error(`Insufficient stock for: ${product.name}`);

      totalAmount += product.price * item.qty;
      totalCarbonSaved += product.carbonSaved * item.qty;
      enrichedItems.push({ productId: product._id, name: product.name, price: product.price, qty: item.qty, carbonSaved: product.carbonSaved });

      product.stock -= item.qty;
      product.soldCount += item.qty;
      await product.save();
    }

    const order = await Order.create({
      userId: req.user._id, items: enrichedItems, totalAmount,
      totalCarbonSaved, address, paymentMethod,
    });

    res.status(201).json({ success: true, message: 'Order placed successfully 🌿', data: order });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// GET /orders/my - user's own orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId', 'name images');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.userId.toString() !== req.user._id.toString() && req.user.role === 'USER') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /orders/:id/status - employee / admin
router.patch('/:id/status', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const { status, trackingId } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, trackingId }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// GET /orders/branch/all - employee sees their state's orders
router.get('/branch/all', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const orders = await Order.find(query).populate('userId', 'name email phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit);
    res.json({ success: true, data: orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
