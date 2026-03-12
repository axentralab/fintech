import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatPercent, getPnLColor } from '../../utils/format';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const WALLETS = [
  { name: 'Main Account', icon: '🏦', currency: 'USD', color: '#3b82f6' },
  { name: 'Crypto Wallet', icon: '₿', currency: 'BTC', color: '#f59e0b' },
  { name: 'Savings', icon: '💰', currency: 'EUR', color: '#10b981' },
  { name: 'Trading', icon: '📈', currency: 'USD', color: '#8b5cf6' },
];

// Mock data for demo (replace with api calls when backend connected)
const MOCK = {
  totalBalance: 248390.50,
  dailyPnl: 1240.30,
  weeklyPnl: 8920.10,
  savingsRate: 32.4,
  incoming: 52400,
  outgoing: 18200,
  recentTransactions: [
    { _id: '1', description: 'Apple Inc Dividend', type: 'income', category: 'Dividends', amount: 840, status: 'completed', date: new Date() },
    { _id: '2', description: 'AWS Cloud Services', type: 'expense', category: 'Technology', amount: 1200, status: 'completed', date: new Date() },
    { _id: '3', description: 'BTC Purchase', type: 'investment', category: 'Crypto', amount: 5000, status: 'completed', date: new Date() },
    { _id: '4', description: 'Client Payment - Q4', type: 'income', category: 'Revenue', amount: 12000, status: 'completed', date: new Date() },
    { _id: '5', description: 'Office Rent', type: 'expense', category: 'Operations', amount: 3500, status: 'pending', date: new Date() },
  ],
  alerts: [
    { type: 'price', msg: 'BTC crossed $45,000 alert', level: 'warning', time: '2m ago' },
    { type: 'payment', msg: 'Scheduled payment due tomorrow', level: 'info', time: '1h ago' },
    { type: 'security', msg: 'New login from Chrome/Mac', level: 'success', time: '3h ago' },
  ],
  cashflow: {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    income: [38000, 42000, 39000, 45000, 41000, 52000, 48000, 51000, 56000],
    expense: [22000, 24000, 21000, 26000, 28000, 31000, 27000, 29000, 32000],
  }
};

const StatCard = ({ title, value, sub, color, icon }) => (
  <div className="card fade-in">
    <div className="flex-between mb-8">
      <span className="card-title">{title}</span>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </div>
    <div className="card-value" style={{ color }}>{value}</div>
    <div className="card-sub">{sub}</div>
  </div>
);

const AlertBadge = ({ level }) => {
  const map = { warning: 'badge-amber', info: 'badge-blue', success: 'badge-emerald', error: 'badge-rose' };
  return <span className={`badge ${map[level] || 'badge-blue'}`}>{level}</span>;
};

export default function DashboardPage() {
  const [data] = useState(MOCK);

  const chartData = {
    labels: data.cashflow.labels,
    datasets: [
      { label: 'Income', data: data.cashflow.income, backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 5 },
      { label: 'Expense', data: data.cashflow.expense, backgroundColor: 'rgba(244,63,94,0.6)', borderRadius: 5 },
    ]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#8899bb', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#8899bb', font: { size: 10 } }, grid: { color: 'rgba(99,170,255,0.05)' } },
      y: { ticks: { color: '#8899bb', font: { size: 10 }, callback: v => '$' + (v/1000) + 'k' }, grid: { color: 'rgba(99,170,255,0.05)' } }
    }
  };

  const txTypeColor = { income: '#10b981', expense: '#f43f5e', investment: '#8b5cf6', transfer: '#06b6d4' };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Financial Overview</div>
        <div className="page-sub">All accounts consolidated · Updated just now</div>
      </div>

      {/* Wallets */}
      <div className="grid-4 mb-14">
        {WALLETS.map((w, i) => (
          <div className="card" key={i} style={{ borderLeft: `3px solid ${w.color}` }}>
            <div className="flex-between mb-8">
              <span className="card-title">{w.name}</span>
              <span>{w.icon}</span>
            </div>
            <div className="card-value" style={{ fontSize: '1.2rem', color: w.color }}>
              {formatCurrency(data.totalBalance / (i + 1) * 0.4, w.currency === 'BTC' ? 'USD' : w.currency)}
            </div>
            <div className="card-sub flex-center gap-8 mt-14">
              <span className="stat-change up">↑ {(Math.random() * 5 + 1).toFixed(2)}%</span>
              <span>this week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid-4 mb-14">
        <StatCard title="Total Balance" value={formatCurrency(data.totalBalance)} sub="Across all accounts" color="var(--accent-blue)" icon="💼" />
        <StatCard title="Daily PnL" value={formatCurrency(data.dailyPnl)} sub={<span className="stat-change up">↑ 2.1% from yesterday</span>} color="var(--accent-emerald)" icon="📊" />
        <StatCard title="Weekly PnL" value={formatCurrency(data.weeklyPnl)} sub={<span className="stat-change up">↑ 8.4% this week</span>} color="var(--accent-cyan)" icon="📅" />
        <StatCard title="Savings Rate" value={`${data.savingsRate}%`} sub="Net savings of income" color="var(--accent-violet)" icon="🎯" />
      </div>

      <div className="grid-2 mb-14">
        {/* Cashflow Chart */}
        <div className="card">
          <div className="flex-between mb-14">
            <span className="card-title">Monthly Cashflow</span>
            <div className="flex gap-8">
              <span className="badge badge-blue">Income</span>
              <span className="badge badge-rose">Expense</span>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Transactions + Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Incoming/Outgoing */}
          <div className="grid-2">
            <div className="card" style={{ borderTop: '2px solid var(--accent-emerald)' }}>
              <div className="card-title mb-8">Incoming</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-emerald)' }}>
                +{formatCurrency(data.incoming)}
              </div>
              <div className="card-sub">Last 30 days</div>
            </div>
            <div className="card" style={{ borderTop: '2px solid var(--accent-rose)' }}>
              <div className="card-title mb-8">Outgoing</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-rose)' }}>
                -{formatCurrency(data.outgoing)}
              </div>
              <div className="card-sub">Last 30 days</div>
            </div>
          </div>

          {/* Alerts */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-title mb-14">🔔 Alerts & Notifications</div>
            {data.alerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < data.alerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <AlertBadge level={a.level} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem' }}>{a.msg}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex-between mb-14">
          <span className="card-title">Recent Transactions</span>
          <span className="badge badge-blue">{data.recentTransactions.length} items</span>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Type</th><th>Category</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {data.recentTransactions.map(tx => (
              <tr key={tx._id}>
                <td style={{ fontWeight: 500 }}>{tx.description}</td>
                <td><span className="badge" style={{ background: `${txTypeColor[tx.type]}20`, color: txTypeColor[tx.type] }}>{tx.type}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{tx.category}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: tx.type === 'income' ? 'var(--accent-emerald)' : tx.type === 'expense' ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td><span className={`badge ${tx.status === 'completed' ? 'badge-emerald' : 'badge-amber'}`}>{tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
