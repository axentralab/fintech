const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['send', 'receive', 'scheduled', 'qr'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'scheduled', 'cancelled'], default: 'pending' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  recipient: { name: String, account: String, email: String, phone: String },
  description: String,
  scheduledDate: Date,
  recurring: { enabled: { type: Boolean, default: false }, frequency: String, endDate: Date },
  exchangeRate: { type: Number, default: 1 },
  fees: { type: Number, default: 0 },
  reference: String,
  qrData: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Payment', paymentSchema);
