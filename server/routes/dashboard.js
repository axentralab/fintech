const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', async (req, res) => {
  try {
    const userId = req.user._id;
    const [recentTx, investments, pendingPayments] = await Promise.all([
      Transaction.find({ userId }).sort({ date: -1 }).limit(5),
      Investment.find({ userId }),
      Payment.find({ userId, status: { $in: ['pending', 'scheduled'] } }).limit(5)
    ]);
    const income = await Transaction.aggregate([{ $match: { userId, type: 'income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const expense = await Transaction.aggregate([{ $match: { userId, type: 'expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const portfolioValue = investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0);
    const totalBalance = (income[0]?.total || 0) - (expense[0]?.total || 0);
    const alerts = investments.filter(i => i.priceAlerts.some(a => a.active && !a.triggered)).map(i => ({ symbol: i.symbol, alerts: i.priceAlerts.filter(a => a.active) }));
    res.json({ totalBalance, portfolioValue, recentTransactions: recentTx, pendingPayments, alerts, investmentCount: investments.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
