const express = require('express');
const router = express.Router();
const Product = require('../../products/model/Product');
const { protect, authorize } = require('../../../middleware/authMiddleware');

// GET /inventory/summary - employee inventory overview
router.get('/summary', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const branchId = req.user._id;
    const [available, lowStock, outOfStock, pending] = await Promise.all([
      Product.countDocuments({ branchId, stock: { $gte: 15 }, status: 'approved', isActive: true }),
      Product.countDocuments({ branchId, stock: { $gt: 0, $lt: 15 }, status: 'approved', isActive: true }),
      Product.countDocuments({ branchId, stock: 0, isActive: true }),
      Product.countDocuments({ branchId, status: 'pending', isActive: true }),
    ]);
    res.json({ success: true, data: { available, lowStock, outOfStock, pending } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /inventory/:productId/stock - update stock
router.patch('/:productId/stock', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findOne({ _id: req.params.productId, branchId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found in your inventory' });
    product.stock = stock;
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// GET /inventory/admin - master-admin inventory overview across all branches/states.
// Query params: state, status (pending|approved|rejected), q (name regex), page, limit.
// branchId is populated so the admin can see which employee/branch owns each product.
router.get('/admin', protect, authorize('MASTER_ADMIN'), async (req, res) => {
  try {
    const { state, status, q } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);

    const filter = { isActive: true };
    if (state) filter.state = state;
    if (status && ['pending', 'approved', 'rejected'].includes(status)) filter.status = status;
    if (q) filter.name = { $regex: q, $options: 'i' };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('branchId', 'name email state role')
        .sort({ updatedAt: -1 })
        .skip(page * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, data: { items, total, page, limit } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /inventory/admin/:productId/stock - admin-only stock update.
// Unlike the employee-scoped /:productId/stock route, this does NOT enforce
// branch ownership — admins can adjust stock on any branch's product.
router.patch('/admin/:productId/stock', protect, authorize('MASTER_ADMIN'), async (req, res) => {
  try {
    const stock = Number(req.body.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({ success: false, message: 'stock must be a non-negative number' });
    }
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.stock = stock;
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
