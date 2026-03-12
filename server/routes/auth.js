const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: role || 'viewer' });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, preferences: user.preferences } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    user.activityLog.push({ action: 'login', ip: req.ip, userAgent: req.headers['user-agent'] });
    await user.save();
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, preferences: user.preferences, twoFactorEnabled: user.twoFactorEnabled } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// Enable 2FA
router.post('/2fa/setup', protect, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `Axentralab (${req.user.email})` });
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret.base32 });
    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ secret: secret.base32, qrCode: qrDataUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify 2FA
router.post('/2fa/verify', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: req.body.token });
    if (!verified) return res.status(400).json({ message: 'Invalid 2FA token' });
    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });
    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Activity log
router.get('/activity', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('activityLog');
  res.json({ activityLog: user.activityLog.slice(-50).reverse() });
});

module.exports = router;
