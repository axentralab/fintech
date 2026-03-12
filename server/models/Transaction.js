const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense', 'transfer', 'investment'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  description: { type: String, required: true },
  tags: [String],
  status: { type: String, enum: ['completed', 'pending', 'failed', 'cancelled'], default: 'completed' },
  walletId: String,
  merchant: String,
  reference: String,
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});
transactionSchema.index({ userId: 1, date: -1 });
module.exports = mongoose.model('Transaction', transactionSchema);
