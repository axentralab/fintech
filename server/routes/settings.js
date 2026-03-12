const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');

router.use(protect);

// Get preferences
router.get('/preferences', async (req, res) => {
  const user = await User.findById(req.user._id).select('preferences');
  res.json({ preferences: user.preferences });
});

// Update preferences
router.put('/preferences', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { preferences: { ...req.user.preferences, ...req.body } }, { new: true });
    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create API key (admin only)
router.post('/api-keys', authorize('admin'), async (req, res) => {
  try {
    const key = 'axn_' + crypto.randomBytes(32).toString('hex');
    const user = await User.findById(req.user._id);
    user.apiKeys.push({ name: req.body.name, key, permissions: req.body.permissions || [] });
    await user.save();
    res.json({ key, message: 'Store this key securely - it will not be shown again' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete API key
router.delete('/api-keys/:keyId', authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { apiKeys: { _id: req.params.keyId } } });
    res.json({ message: 'API key deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (admin)
router.get('/users', authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password -twoFactorSecret -apiKeys');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user role (admin)
router.put('/users/:id/role', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
