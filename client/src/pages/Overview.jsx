import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import Icon from '../ui/Icon';
import { useStore } from '../../store';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

const pct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

// Mock data
const MOCK_STATS = {
  totalBalance: 284750,
  monthlyIncome: 42300,
  monthlyExpenses: 18640,
  netProfit: 23660,
  portfolioValue: 96200,
  roi: 14.7,
  savingsRate: 55.9,
  incomeChange: 8.3,
  expenseChange: -3.1,
};

const MOCK_WALLETS = [
  { _id: '1', name: 'Primary Checking', type: 'bank', balance: 124500, currency: 'USD', color: '#2563eb', institution: 'Chase Bank' },
  { _id: '2', name: 'Crypto Portfolio', type: 'crypto', balance: 96200, currency: 'USD', color: '#f59e0b', institution: 'Coinbase' },
  { _id: '3', name: 'EUR Savings', type: 'savings', balance: 38400, currency: 'EUR', color: '#10b981', institution: 'N26' },
  { _id: '4', name: 'Investment Account', type: 'investment', balance: 25650, currency: 'USD', color: '#8b5cf6', institution: 'Fidelity' },
];

const MOCK_RECENT_TX = [
  { id: '1', description: 'Netflix Subscription', amount: -15.99, category: 'entertainment', date: '2024-01-15', status: 'completed', merchant: 'Netflix' },
  { id: '2', description: 'Salary Deposit', amount: 8500, category: 'salary', date: '2024-01-14', status: 'completed', merchant: 'Employer Inc' },
  { id: '3', description: 'AWS Services', amount: -234.50, category: 'utilities', date: '2024-01-13', status: 'completed', merchant: 'Amazon Web Services' },
  { id: '4', description: 'BTC Purchase', amount: -2000, category: 'investment', date: '2024-01-12', status: 'completed', merchant: 'Coinbase' },
  { id: '5', description: 'Freelance Payment', amount: 3200, category: 'freelance', date: '2024-01-11', status: 'completed', merchant: 'Client XYZ' },
];

const cashflowData = {
  labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
  datasets: [
    {
      label: 'Income',
      data: [38000, 41000, 39500, 44000, 42300, 46800],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
    },
    {
      label: 'Expenses',
      data: [21000, 19800, 22000, 18500, 20100, 18640],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.06)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
    },
  ],
};

const portfolioData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Portfolio Value',
    data: [88000, 91000, 89500, 94000, 92800, 96200, 96200],
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37,99,235,0.08)',
    fill: true,
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 6,
    borderWidth: 2,
  }],
};

const chartOpts = (isDark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: isDark ? '#131c2b' : '#fff', borderColor: 'rgba(56,189,248,0.2)', borderWidth: 1, titleColor: isDark ? '#e8f0fe' : '#0d1424', bodyColor: isDark ? '#7a90b0' : '#3d5070', padding: 10 } },
  scales: {
    x: { grid: { color: 'rgba(56,189,248,0.04)', drawBorder: false }, ticks: { color: isDark ? '#3d5070' : '#8aa0be', font: { size: 11, family: "'DM Mono', monospace" } } },
    y: { grid: { color: 'rgba(56,189,248,0.04)', drawBorder: false }, ticks: { color: isDark ? '#3d5070' : '#8aa0be', font: { size: 11, family: "'DM Mono', monospace" }, callback: v => `$${(v/1000).toFixed(0)}k` } },
  },
  interaction: { mode: 'index', intersect: false },
});

function StatCard({ title, value, sub, change, icon, color = 'var(--brand-secondary)', prefix = '$' }) {
  const isPositive = change >= 0;
  return (
    <div className="card" style={{ '--card-accent': color }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={15} color={color} />
        </div>
      </div>
      <div className="card-value" style={{ fontSize: '1.6rem', letterSpacing: '-0.03em' }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="flex-between mt-8">
        <span className="card-sub">{sub}</span>
        {change !== undefined && (
          <span className={isPositive ? 'stat-up' : 'stat-down'}>
            <Icon name={isPositive ? 'arrowUp' : 'arrowDown'} size={11} />
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

function WalletCard({ wallet }) {
  const icons = { bank: 'wallet', crypto: 'bitcoin', savings: 'coin', investment: 'briefcase', forex: 'globe' };
  return (
    <div className="wallet-card" style={{ background: `linear-gradient(135deg, ${wallet.color}cc, ${wallet.color}88)` }}>
      <div className="flex-between mb-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name={icons[wallet.type] || 'wallet'} size={16} color="rgba(255,255,255,0.9)" />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{wallet.name}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.2)', padding: '2px 7px', borderRadius: 12 }}>{wallet.type}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em', color: '#fff', marginTop: 12 }}>
        {fmt(wallet.balance, wallet.currency)}
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.6)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
        {wallet.institution}
      </div>
    </div>
  );
}

export default function Overview() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const stats = MOCK_STATS;

  return (
    <div className="section-gap page-enter">
      {/* KPI Row */}
      <div className="grid-4">
        <StatCard title="Total Balance" value={stats.totalBalance} sub="Across all accounts" change={6.2} icon="wallet" color="var(--brand-secondary)" />
        <StatCard title="Net Profit" value={stats.netProfit} sub="This month" change={stats.incomeChange} icon="trending" color="var(--success)" />
        <StatCard title="Portfolio Value" value={stats.portfolioValue} sub="Investments" change={stats.roi} icon="investments" color="var(--warning)" />
        <StatCard title="Savings Rate" value={`${stats.savingsRate.toFixed(1)}%`} sub="Monthly income saved" change={2.1} icon="percent" color="var(--info)" prefix="" />
      </div>

      {/* Wallets */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Wallets</span>
          <div className="flex gap-8">
            <span className="badge badge-neutral">{MOCK_WALLETS.length} accounts</span>
            <button className="btn btn-sm btn-secondary"><Icon name="plus" size={13} /> Add Wallet</button>
          </div>
        </div>
        <div className="grid-4">
          {MOCK_WALLETS.map(w => <WalletCard key={w._id} wallet={w} />)}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Cashflow — Last 6 Months</span>
            <div className="flex gap-8">
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}><span style={{ width: 8, height: 2, background: 'var(--success)', borderRadius: 2, display: 'inline-block' }} /> Income</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--font-size-xs)', color: 'var(--danger)' }}><span style={{ width: 8, height: 2, background: 'var(--danger)', borderRadius: 2, display: 'inline-block' }} /> Expenses</span>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <Line data={cashflowData} options={chartOpts(isDark)} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Portfolio Performance — 7D</span>
            <span className="stat-up"><Icon name="arrowUp" size={11} />+9.3% this week</span>
          </div>
          <div style={{ height: 200 }}>
            <Line data={portfolioData} options={{
              ...chartOpts(isDark),
              scales: { ...chartOpts(isDark).scales, y: { ...chartOpts(isDark).scales.y, ticks: { ...chartOpts(isDark).scales.y.ticks, callback: v => `$${(v/1000).toFixed(0)}k` } } }
            }} />
          </div>
        </div>
      </div>

      {/* Recent Transactions + Alerts */}
      <div className="grid-2-1">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Transactions</span>
            <button className="btn btn-xs btn-ghost">View all →</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RECENT_TX.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{tx.description}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{tx.merchant}</div>
                    </td>
                    <td><span className="badge badge-neutral">{tx.category}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{tx.date}</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: tx.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Alerts</span>
            <span className="badge badge-danger">3 active</span>
          </div>
          <div className="section-gap" style={{ gap: 10 }}>
            {[
              { type: 'warning', title: 'High Spending', msg: 'Entertainment budget 80% used', icon: 'alert' },
              { type: 'info', title: 'Price Alert', msg: 'ETH nearing $2,400 target', icon: 'zap' },
              { type: 'success', title: 'Goal Achieved', msg: 'Monthly savings target met!', icon: 'check' },
              { type: 'danger', title: 'Unusual Login', msg: 'New device in Berlin, DE', icon: 'shield' },
            ].map((alert, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `var(--${alert.type === 'success' ? 'success' : alert.type === 'warning' ? 'warning' : alert.type === 'danger' ? 'danger' : 'info'})18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={alert.icon} size={13} color={`var(--${alert.type === 'success' ? 'success' : alert.type === 'warning' ? 'warning' : alert.type === 'danger' ? 'danger' : 'info'})`} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{alert.title}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{alert.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
