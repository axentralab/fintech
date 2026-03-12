// wallets.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/walletController');
router.get('/', protect, ctrl.getWallets);
router.post('/', protect, ctrl.createWallet);
router.put('/:id', protect, ctrl.updateWallet);
router.delete('/:id', protect, ctrl.deleteWallet);
module.exports = router;
