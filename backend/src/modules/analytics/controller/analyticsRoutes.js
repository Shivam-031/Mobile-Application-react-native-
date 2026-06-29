const express = require('express');
const router = express.Router();
const Product = require('../../products/model/Product');
const Order = require('../../orders/model/Order');
const Plant = require('../../plants/model/Plant');
const User = require('../../users/model/User');
const { protect, authorize } = require('../../../middleware/authMiddleware');

// GET /analytics/dashboard - admin
router.get('/dashboard', protect, authorize('MASTER_ADMIN'), async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalPlants] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Plant.countDocuments({ isActive: true }),
    ]);

    const carbonData = await Order.aggregate([
      { $group: { _id: null, totalCarbonSaved: { $sum: '$totalCarbonSaved' }, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    const topProducts = await Product.find({ status: 'approved' }).sort({ soldCount: -1 }).limit(5).select('name soldCount state carbonSaved');
    const stateStats = await Product.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$state', products: { $sum: 1 }, totalCarbonSaved: { $sum: '$carbonSaved' } } },
      { $sort: { products: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalUsers, totalProducts, totalOrders, totalPlants, ...carbonData[0] },
        topProducts,
        stateStats,
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /analytics/branch - employee
router.get('/branch', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const products = await Product.find({ branchId: req.user._id }).select('name soldCount carbonSaved stock status');
    const totalRevenue = products.reduce((acc, p) => acc + p.soldCount * (p.price || 0), 0);
    const totalCarbon = products.reduce((acc, p) => acc + p.carbonSaved * p.soldCount, 0);

    res.json({
      success: true,
      data: {
        products,
        summary: { totalProducts: products.length, totalCarbon: totalCarbon.toFixed(2) },
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
