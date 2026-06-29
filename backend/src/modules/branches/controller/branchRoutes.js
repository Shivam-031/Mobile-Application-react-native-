const express = require('express');
const router = express.Router();
const Branch = require('../model/Branch');
const User = require('../../users/model/User');
const { protect, authorize } = require('../../../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).populate('manager','name email phone').sort({ state: 1 });
    res.json({ success: true, data: branches, total: branches.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/state/:state', async (req, res) => {
  try {
    const branch = await Branch.findOne({ state: req.params.state, isActive: true }).populate('manager','name email phone avatar');
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, authorize('MASTER_ADMIN'), async (req, res) => {
  try {
    const { state, managerId, phone, email, address } = req.body;
    const manager = await User.findById(managerId);
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found' });
    if (manager.role !== 'EMPLOYEE') { manager.role = 'EMPLOYEE'; manager.state = state; await manager.save(); }
    const branch = await Branch.create({ state, manager: managerId, managerName: manager.name, phone, email, address, verifiedAt: new Date() });
    res.status(201).json({ success: true, data: branch });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.get('/mine', protect, authorize('EMPLOYEE','MASTER_ADMIN'), async (req, res) => {
  try {
    const branch = await Branch.findOne({ manager: req.user._id }).populate('manager','name email phone');
    if (!branch) return res.status(404).json({ success: false, message: 'No branch assigned' });
    res.json({ success: true, data: branch });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/stats', protect, authorize('EMPLOYEE','MASTER_ADMIN'), async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, { $set: { stats: req.body.stats } }, { new: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
