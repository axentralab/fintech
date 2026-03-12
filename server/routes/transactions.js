const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all transactions with filters
router.get('/', async (req, res) => {
  try {
    const { type, category, status, startDate, endDate, search, tags, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(',') };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) query.$or = [{ description: { $regex: search, $options: 'i' } }, { merchant: { $regex: search, $options: 'i' } }];

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ transactions, total, pages: Math.ceil(total / limit), page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export CSV (returns data for frontend to download)
router.get('/export/csv', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    const csv = ['Date,Type,Category,Amount,Currency,Description,Status,Tags']
      .concat(transactions.map(t =>
        `${t.date.toISOString()},${t.type},${t.category},${t.amount},${t.currency},"${t.description}",${t.status},"${t.tags.join(';')}"`
      )).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
