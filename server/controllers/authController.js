const User = require('../models/User');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwt();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      preferences: user.preferences,
      twoFactorEnabled: user.twoFactorEnabled
    }
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password, role: role || 'viewer' });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) return res.status(200).json({ requiresTwoFactor: true });
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
      });
      if (!verified) return res.status(401).json({ error: 'Invalid 2FA token' });
    }
    user.lastLogin = new Date();
    user.activityLog.push({ action: 'login', ip: req.ip, userAgent: req.headers['user-agent'] });
    if (user.activityLog.length > 100) user.activityLog = user.activityLog.slice(-100);
    await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `Axentralab (${req.user.email})`, length: 20 });
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret.base32 }, { new: true });
    res.json({ success: true, secret: secret.base32, qrCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    const { token } = req.body;
    const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 2 });
    if (!verified) return res.status(400).json({ error: 'Invalid token' });
    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.disable2FA = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: false, twoFactorSecret: undefined });
    res.json({ success: true, message: '2FA disabled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActivityLog = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('activityLog');
    res.json({ success: true, data: user.activityLog.reverse().slice(0, 50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateApiKey = async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const { name, permissions } = req.body;
    const key = `axn_${uuidv4().replace(/-/g, '')}`;
    await User.findByIdAndUpdate(req.user._id, {
      $push: { apiKeys: { name, key, createdAt: new Date(), permissions: permissions || ['read'] } }
    });
    res.json({ success: true, key, message: 'Store this key securely — it won\'t be shown again.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.revokeApiKey = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { apiKeys: { _id: req.params.keyId } } });
    res.json({ success: true, message: 'API key revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
