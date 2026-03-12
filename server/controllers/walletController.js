const Wallet = require('../models/Wallet');

exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user._id, isActive: true });
    const totalBalance = wallets.reduce((s, w) => s + w.balanceUSD, 0);
    res.json({ success: true, data: wallets, totalBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createWallet = async (req, res) => {
  try {
    const wallet = await Wallet.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: wallet });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json({ success: true, data: wallet });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    await Wallet.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false });
    res.json({ success: true, message: 'Wallet archived' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
