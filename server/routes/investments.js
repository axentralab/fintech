const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;
    const investments = await Investment.find(query).sort({ createdAt: -1 });
    const summary = {
      totalInvested: investments.reduce((s, i) => s + i.avgBuyPrice * i.quantity, 0),
      currentValue: investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0),
      byType: {}
    };
    investments.forEach(i => {
      if (!summary.byType[i.type]) summary.byType[i.type] = { count: 0, value: 0 };
      summary.byType[i.type].count++;
      summary.byType[i.type].value += i.currentPrice * i.quantity;
    });
    res.json({ investments, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const investment = await Investment.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ investment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.json({ investment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Investment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Investment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add price alert
router.post('/:id/alerts', async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    investment.priceAlerts.push(req.body);
    await investment.save();
    res.json({ investment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
