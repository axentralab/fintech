const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['bank', 'crypto', 'forex', 'savings', 'investment'], required: true },
  currency: { type: String, default: 'USD' },
  balance: { type: Number, default: 0 },
  balanceUSD: { type: Number, default: 0 },
  accountNumber: { type: String },
  color: { type: String, default: '#3b82f6' },
  icon: { type: String, default: 'wallet' },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  institution: String,
  lastSynced: Date
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
