const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const QRCode = require('qrcode');

exports.sendPayment = async (req, res) => {
  try {
    const { fromWallet, recipient, amount, currency, note, type } = req.body;
    const wallet = await Wallet.findOne({ _id: fromWallet, user: req.user._id });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    if (wallet.balance < amount) return res.status(400).json({ error: 'Insufficient funds' });

    const payment = await Payment.create({
      user: req.user._id, fromWallet, recipient, amount, currency: currency || wallet.currency,
      amountUSD: amount, note, type: type || 'instant',
      reference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'completed'
    });

    wallet.balance -= amount;
    wallet.balanceUSD -= amount;
    await wallet.save();

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.schedulePayment = async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, user: req.user._id, type: 'scheduled', status: 'pending' });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('fromWallet', 'name currency')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, data: payments, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelPayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'pending' },
      { status: 'cancelled' }, { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Payment not found or cannot be cancelled' });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.generateQR = async (req, res) => {
  try {
    const { amount, currency, wallet, note } = req.body;
    const qrData = JSON.stringify({ userId: req.user._id, amount, currency, wallet, note, ts: Date.now() });
    const qrCode = await QRCode.toDataURL(qrData);
    res.json({ success: true, qrCode, qrData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
