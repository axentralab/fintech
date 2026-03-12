const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, startDate, endDate, search, tags, status } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) query.$or = [{ description: new RegExp(search, 'i') }, { merchant: new RegExp(search, 'i') }];
    if (tags) query.tags = { $in: tags.split(',') };

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('wallet', 'name type currency')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true, runValidators: true }
    );
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true, data: tx });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exportTransactions = async (req, res) => {
  try {
    const { format = 'csv', ...filters } = req.query;
    const query = { user: req.user._id };
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }
    const transactions = await Transaction.find(query).sort({ date: -1 }).limit(5000);

    if (format === 'csv') {
      const headers = 'Date,Type,Category,Amount,Currency,Description,Merchant,Status,Tags\n';
      const rows = transactions.map(t =>
        `"${t.date.toISOString()}","${t.type}","${t.category}","${t.amount}","${t.currency}","${t.description || ''}","${t.merchant || ''}","${t.status}","${(t.tags || []).join(';')}"`
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      return res.send(headers + rows);
    }

    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactionStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);

    const [daily, weekly, categoryBreakdown] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfDay } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfWeek } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, type: 'expense', date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
      ])
    ]);

    res.json({ success: true, data: { daily, weekly, categoryBreakdown } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
