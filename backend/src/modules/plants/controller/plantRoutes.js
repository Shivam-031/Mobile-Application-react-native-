const express = require('express');
const router = express.Router();
const Plant = require('../model/Plant');
const { protect, authorize } = require('../../../middleware/authMiddleware');

// GET all plants (public)
router.get('/', async (req, res) => {
  try {
    const { category, state, search } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (state) query.states = state;
    if (search) query.$text = { $search: search };
    const plants = await Plant.find(query).sort({ speciesCount: -1 });
    res.json({ success: true, data: plants, total: plants.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET plant by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });
    res.json({ success: true, data: plant });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET dashboard stats (public)
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Plant.countDocuments({ isActive: true });
    const native = await Plant.countDocuments({ category: 'native', isActive: true });
    const protected_ = await Plant.countDocuments({ category: 'protected', isActive: true });
    const statesArr = await Plant.distinct('states', { isActive: true });
    res.json({ success: true, data: { total, native, protected: protected_, statesCovered: statesArr.length } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST add plant (employee / admin)
router.post('/', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const plant = await Plant.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, data: plant });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT update plant
router.put('/:id', protect, authorize('EMPLOYEE', 'MASTER_ADMIN'), async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });
    res.json({ success: true, data: plant });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
