const mongoose = require('mongoose');
const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['crypto', 'stock', 'forex', 'commodity', 'etf'], required: true },
  quantity: { type: Number, required: true },
  avgBuyPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  priceAlerts: [{ price: Number, condition: { type: String, enum: ['above', 'below'] }, active: { type: Boolean, default: true }, triggered: { type: Boolean, default: false } }],
  performance: { daily: { type: Number, default: 0 }, weekly: { type: Number, default: 0 }, monthly: { type: Number, default: 0 } },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Investment', investmentSchema);
