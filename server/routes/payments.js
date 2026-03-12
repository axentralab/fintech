const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;
    const payments = await Payment.find(query).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/send', async (req, res) => {
  try {
    const ref = 'AX' + Date.now().toString(36).toUpperCase();
    const payment = await Payment.create({ ...req.body, userId: req.user._id, type: 'send', status: 'completed', reference: ref });
    res.status(201).json({ payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/schedule', async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, userId: req.user._id, type: 'scheduled', status: 'scheduled' });
    res.status(201).json({ payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/qr', async (req, res) => {
  try {
    const qrcode = require('qrcode');
    const data = JSON.stringify({ userId: req.user._id, amount: req.body.amount, currency: req.body.currency || 'USD' });
    const qrDataUrl = await qrcode.toDataURL(data);
    res.json({ qrCode: qrDataUrl, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Payment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Payment cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
