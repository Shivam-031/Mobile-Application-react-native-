const express = require('express');
const router = express.Router();
const User = require('../model/User');
const { protect, authorize } = require('../../../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../../../config/cloudinary');

// GET profile
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// PUT update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, state, district, fcmToken } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, state, district, fcmToken },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// POST upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    const result = await uploadToCloudinary(req.file.buffer, 'green-yatra/avatars');
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { url: result.secure_url, publicId: result.public_id } },
      { new: true }
    );
    res.json({ success: true, data: { avatar: user.avatar } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET all users (admin)
router.get('/', protect, authorize('MASTER_ADMIN'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (role) query.role = role;
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(+limit);
    const total = await User.countDocuments(query);
    res.json({ success: true, data: { users, total } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH promote user to EMPLOYEE (admin)
router.patch('/:id/role', protect, authorize('MASTER_ADMIN'), async (req, res) => {
  try {
    const { role, state } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, state }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User promoted to ${role}`, data: user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

module.exports = router;
