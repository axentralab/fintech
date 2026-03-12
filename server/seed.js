const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Investment = require('./models/Investment');

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/axentralab');
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Transaction.deleteMany(), Investment.deleteMany()]);

  // Create admin user
  const user = await User.create({
    name: 'Alex Morgan',
    email: 'demo@axentralab.com',
    password: 'demo123',
    role: 'admin',
    preferences: { theme: 'dark', currency: 'USD' }
  });
  console.log('Created user:', user.email);

  // Seed transactions
  const categories = ['Revenue', 'Technology', 'Operations', 'Marketing', 'Dividends', 'Crypto', 'Salaries'];
  const types = ['income', 'expense', 'investment'];
  const txs = Array.from({ length: 60 }, (_, i) => ({
    userId: user._id,
    type: types[i % 3],
    category: categories[i % categories.length],
    amount: Math.floor(Math.random() * 10000) + 500,
    description: `Transaction ${i + 1}`,
    tags: ['auto', 'seeded'],
    status: 'completed',
    date: new Date(Date.now() - i * 86400000 * 2)
  }));
  await Transaction.insertMany(txs);
  console.log('Created', txs.length, 'transactions');

  // Seed investments
  const investments = [
    { userId: user._id, symbol: 'BTC', name: 'Bitcoin', type: 'crypto', quantity: 0.84, avgBuyPrice: 38200, currentPrice: 45800, performance: { daily: 2.4, weekly: 8.1, monthly: 19.9 } },
    { userId: user._id, symbol: 'AAPL', name: 'Apple Inc', type: 'stock', quantity: 42, avgBuyPrice: 168, currentPrice: 189, performance: { daily: 0.4, weekly: 1.8, monthly: 12.5 } },
    { userId: user._id, symbol: 'NVDA', name: 'NVIDIA Corp', type: 'stock', quantity: 8, avgBuyPrice: 480, currentPrice: 628, performance: { daily: 1.8, weekly: 6.4, monthly: 30.8 } },
  ];
  await Investment.insertMany(investments);
  console.log('Created', investments.length, 'investments');

  console.log('\nSeed complete! Login: demo@axentralab.com / demo123');
  process.exit(0);
};

seedDB().catch(err => { console.error(err); process.exit(1); });
