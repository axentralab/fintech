const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [wallets, monthlyTx, lastMonthTx, investments] = await Promise.all([
      Wallet.find({ user: userId, isActive: true }),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startLastMonth, $lte: endLastMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Investment.find({ user: userId })
    ]);

    const totalBalance = wallets.reduce((sum, w) => sum + w.balanceUSD, 0);
    const monthlyIncome = monthlyTx.find(t => t._id === 'income')?.total || 0;
    const monthlyExpenses = monthlyTx.find(t => t._id === 'expense')?.total || 0;
    const lastMonthIncome = lastMonthTx.find(t => t._id === 'income')?.total || 0;
    const lastMonthExpenses = lastMonthTx.find(t => t._id === 'expense')?.total || 0;
    const portfolioValue = investments.reduce((s, i) => s + i.quantity * i.currentPrice, 0);
    const portfolioCost = investments.reduce((s, i) => s + i.quantity * i.avgBuyPrice, 0);
    const roi = portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 : 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const netProfit = monthlyIncome - monthlyExpenses;

    res.json({
      success: true,
      data: {
        totalBalance,
        wallets: wallets.length,
        monthlyIncome,
        monthlyExpenses,
        lastMonthIncome,
        lastMonthExpenses,
        netProfit,
        portfolioValue,
        roi,
        savingsRate,
        incomeChange: lastMonthIncome > 0 ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0,
        expenseChange: lastMonthExpenses > 0 ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlyCashflow = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate }, type: { $in: ['income', 'expense'] } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const start = new Date();
    if (period === 'month') start.setMonth(start.getMonth() - 1);
    else if (period === 'quarter') start.setMonth(start.getMonth() - 3);
    else if (period === 'year') start.setFullYear(start.getFullYear() - 1);

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: start } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSpendingHeatmap = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const data = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getKPIs = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startYear = new Date(now.getFullYear(), 0, 1);

    const [monthlyData, yearlyData, investments] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startYear } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Investment.find({ user: userId })
    ]);

    const mIncome = monthlyData.find(t => t._id === 'income')?.total || 0;
    const mExpense = monthlyData.find(t => t._id === 'expense')?.total || 0;
    const yIncome = yearlyData.find(t => t._id === 'income')?.total || 0;
    const yExpense = yearlyData.find(t => t._id === 'expense')?.total || 0;
    const portfolioValue = investments.reduce((s, i) => s + i.quantity * i.currentPrice, 0);
    const portfolioCost = investments.reduce((s, i) => s + i.quantity * i.avgBuyPrice, 0);

    res.json({
      success: true,
      data: {
        monthlyROI: portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 : 0,
        monthlyNetProfit: mIncome - mExpense,
        monthlySavingsRate: mIncome > 0 ? ((mIncome - mExpense) / mIncome) * 100 : 0,
        yearlyNetProfit: yIncome - yExpense,
        yearlyROI: portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 : 0,
        portfolioGain: portfolioValue - portfolioCost,
        portfolioGainPercent: portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
