const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/controller/authRoutes');
const userRoutes = require('../modules/users/controller/userRoutes');
const productRoutes = require('../modules/products/controller/productRoutes');
const inventoryRoutes = require('../modules/inventory/controller/inventoryRoutes');
const plantRoutes = require('../modules/plants/controller/plantRoutes');
const carbonRoutes = require('../modules/carbon/controller/carbonRoutes');
const orderRoutes = require('../modules/orders/controller/orderRoutes');
const locationRoutes = require('../modules/locations/controller/locationRoutes');
const analyticsRoutes = require('../modules/analytics/controller/analyticsRoutes');
const branchRoutes = require('../modules/branches/controller/branchRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/plants', plantRoutes);
router.use('/carbon', carbonRoutes);
router.use('/orders', orderRoutes);
router.use('/locations', locationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/branches', branchRoutes);

module.exports = router;
