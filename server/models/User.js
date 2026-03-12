const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'manager', 'viewer'], default: 'viewer' },
  avatar: { type: String, default: '' },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    pinnedMetrics: [String],
    widgetOrder: [String]
  },
  apiKeys: [{ name: String, key: String, permissions: [String], createdAt: { type: Date, default: Date.now }, lastUsed: Date }],
  activityLog: [{ action: String, ip: String, userAgent: String, timestamp: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await require('bcryptjs').hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(password) {
  return require('bcryptjs').compare(password, this.password);
};
module.exports = mongoose.model('User', userSchema);
