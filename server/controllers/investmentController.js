const Investment = require('../models/Investment');

exports.getPortfolio = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id });
    const totalValue = investments.reduce((s, i) => s + i.quantity * i.currentPrice, 0);
    const totalCost = investments.reduce((s, i) => s + i.quantity * i.avgBuyPrice, 0);
    const grouped = { crypto: [], stock: [], forex: [], etf: [], bond: [] };
    investments.forEach(inv => { if (grouped[inv.type]) grouped[inv.type].push(inv); });
    res.json({ success: true, data: { investments, totalValue, totalCost, pnl: totalValue - totalCost, pnlPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0, grouped } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addInvestment = async (req, res) => {
  try {
    const inv = await Investment.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: inv });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateInvestment = async (req, res) => {
  try {
    const inv = await Investment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!inv) return res.status(404).json({ error: 'Investment not found' });
    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInvestment = async (req, res) => {
  try {
    const inv = await Investment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!inv) return res.status(404).json({ error: 'Investment not found' });
    res.json({ success: true, message: 'Investment removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setPriceAlert = async (req, res) => {
  try {
    const { targetPrice, condition } = req.body;
    const inv = await Investment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $push: { priceAlerts: { targetPrice, condition } } },
      { new: true }
    );
    if (!inv) return res.status(404).json({ error: 'Investment not found' });
    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePrices = async (req, res) => {
  try {
    const { prices } = req.body; // { symbol: price }
    const updates = Object.entries(prices).map(([symbol, price]) =>
      Investment.updateMany({ user: req.user._id, symbol }, { currentPrice: price })
    );
    await Promise.all(updates);
    res.json({ success: true, message: 'Prices updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
