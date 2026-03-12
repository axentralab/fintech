const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
});

router.put('/preferences', protect, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { preferences: { ...req.user.preferences, ...req.body } }, { new: true });
  res.json({ success: true, data: user.preferences });
});

router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, data: user });
});

module.exports = router;
