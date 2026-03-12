const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const { protect } = require('../middleware/auth');

router.use(protect);

// Overview stats
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0));
    const startOfWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [income, expense, dailyIncome, dailyExpense, weeklyIncome, weeklyExpense] = await Promise.all([
      Transaction.aggregate([{ $match: { userId, type: 'income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { userId, type: 'expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { userId, type: 'income', date: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { userId, type: 'expense', date: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { userId, type: 'income', date: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { userId, type: 'expense', date: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    const totalIncome = income[0]?.total || 0;
    const totalExpense = expense[0]?.total || 0;
    const dailyPnl = (dailyIncome[0]?.total || 0) - (dailyExpense[0]?.total || 0);
    const weeklyPnl = (weeklyIncome[0]?.total || 0) - (weeklyExpense[0]?.total || 0);

    res.json({ totalBalance: totalIncome - totalExpense, totalIncome, totalExpense, dailyPnl, weeklyPnl, savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(2) : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Monthly cashflow
router.get('/cashflow', async (req, res) => {
  try {
    const userId = req.user._id;
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) });
    }
    const data = await Promise.all(months.map(async ({ year, month, label }) => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      const [inc, exp] = await Promise.all([
        Transaction.aggregate([{ $match: { userId, type: 'income', date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Transaction.aggregate([{ $match: { userId, type: 'expense', date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      ]);
      return { label, income: inc[0]?.total || 0, expense: exp[0]?.total || 0, net: (inc[0]?.total || 0) - (exp[0]?.total || 0) };
    }));
    res.json({ cashflow: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Expense distribution by category
router.get('/distribution', async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    res.json({ distribution: data.map(d => ({ category: d._id, amount: d.total })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Spending heatmap (last 90 days)
router.get('/heatmap', async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    const data = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ heatmap: data.map(d => ({ date: d._id, amount: d.total })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// KPIs
router.get('/kpi', async (req, res) => {
  try {
    const userId = req.user._id;
    const investments = await Investment.find({ userId });
    const totalInvested = investments.reduce((s, i) => s + i.avgBuyPrice * i.quantity, 0);
    const currentValue = investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0);
    const roi = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested * 100).toFixed(2) : 0;
    const [income, expense] = await Promise.all([
      Transaction.aggregate([{ $match: { userId, type: 'income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { userId, type: 'expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    const totalIncome = income[0]?.total || 0;
    const totalExpense = expense[0]?.total || 0;
    const netProfit = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0;
    res.json({ roi, netProfit, savingsRate, totalInvested, currentPortfolioValue: currentValue, portfolioGain: currentValue - totalInvested });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
