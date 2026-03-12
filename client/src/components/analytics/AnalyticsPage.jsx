import React, { useState } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler } from 'chart.js';
import { formatCurrency, formatPercent } from '../../utils/format';
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler);

const EXPENSE_DIST = [
  { category: 'Technology', amount: 12400, color: '#3b82f6' },
  { category: 'Operations', amount: 9800, color: '#8b5cf6' },
  { category: 'Marketing', amount: 7200, color: '#06b6d4' },
  { category: 'Salaries', amount: 28000, color: '#10b981' },
  { category: 'Infrastructure', amount: 5600, color: '#f59e0b' },
  { category: 'Other', amount: 3200, color: '#f43f5e' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const cashflowData = {
  income: [38000, 42000, 39000, 45000, 52000, 48000, 56000, 61000, 58000, 64000, 59000, 71000],
  expense: [22000, 24000, 21000, 26000, 28000, 31000, 27000, 32000, 29000, 34000, 31000, 38000],
};

// Heatmap: 12 weeks x 7 days spending patterns
const generateHeatmap = () => {
  const weeks = 13; const days = 7;
  return Array.from({ length: weeks }, () =>
    Array.from({ length: days }, () => Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 500))
  );
};

const HEATMAP_DATA = generateHeatmap();
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const KPI = [
  { label: 'Return on Investment', value: 18.4, unit: '%', color: '#3b82f6', sub: 'Portfolio YTD', icon: '📈' },
  { label: 'Net Profit', value: 284200, unit: '$', color: '#10b981', sub: 'This year', icon: '💵' },
  { label: 'Savings Rate', value: 32.4, unit: '%', color: '#8b5cf6', sub: 'Of total income', icon: '🏦' },
  { label: 'Expense Ratio', value: 67.6, unit: '%', color: '#f59e0b', sub: 'Of total income', icon: '📊' },
];

const getHeatColor = (val) => {
  if (val === 0) return 'rgba(99,170,255,0.04)';
  if (val < 100) return 'rgba(59,130,246,0.2)';
  if (val < 200) return 'rgba(59,130,246,0.4)';
  if (val < 350) return 'rgba(59,130,246,0.65)';
  return 'rgba(59,130,246,0.9)';
};

export default function AnalyticsPage() {
  const [cashflowView, setCashflowView] = useState('monthly');

  const donutData = {
    labels: EXPENSE_DIST.map(d => d.category),
    datasets: [{ data: EXPENSE_DIST.map(d => d.amount), backgroundColor: EXPENSE_DIST.map(d => d.color), borderWidth: 0, hoverOffset: 6 }]
  };

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: cashflowData.income, backgroundColor: 'rgba(59,130,246,0.75)', borderRadius: 5 },
      { label: 'Expenses', data: cashflowData.expense, backgroundColor: 'rgba(244,63,94,0.6)', borderRadius: 5 },
    ]
  };

  const netData = {
    labels: MONTHS,
    datasets: [{
      label: 'Net Cashflow',
      data: cashflowData.income.map((inc, i) => inc - cashflowData.expense[i]),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }]
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#8899bb', font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: '#8899bb', font: { size: 10 } }, grid: { color: 'rgba(99,170,255,0.05)' } },
      y: { ticks: { color: '#8899bb', font: { size: 10 }, callback: v => '$' + (v >= 1000 ? (v/1000) + 'k' : v) }, grid: { color: 'rgba(99,170,255,0.05)' } }
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Analytics & Insights</div>
        <div className="page-sub">Financial intelligence across all accounts</div>
      </div>

      {/* KPI Widgets */}
      <div className="grid-4 mb-14">
        {KPI.map((kpi, i) => (
          <div key={i} className="card" style={{ borderTop: `2px solid ${kpi.color}` }}>
            <div className="flex-between mb-8">
              <span className="card-title">{kpi.label}</span>
              <span>{kpi.icon}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: kpi.color }}>
              {kpi.unit === '$' ? formatCurrency(kpi.value) : `${kpi.value}${kpi.unit}`}
            </div>
            <div className="card-sub mt-14">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-14">
        {/* Expense Donut */}
        <div className="card">
          <div className="card-title mb-14">Expense Distribution</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 180, height: 180, flexShrink: 0 }}>
              <Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }} />
            </div>
            <div style={{ flex: 1 }}>
              {EXPENSE_DIST.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem' }}>{d.category}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {formatCurrency(d.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Net Cashflow Line */}
        <div className="card">
          <div className="flex-between mb-14">
            <span className="card-title">Net Cashflow Trend</span>
            <span className="badge badge-emerald">Annual</span>
          </div>
          <div style={{ height: 200 }}>
            <Line data={netData} options={{ ...chartOpts, plugins: { legend: { labels: { color: '#8899bb' } } } }} />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card mb-14">
        <div className="flex-between mb-14">
          <span className="card-title">Monthly Income vs Expense</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['monthly', 'quarterly'].map(v => (
              <button key={v} className={`btn btn-sm ${cashflowView === v ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCashflowView(v)}>{v}</button>
            ))}
          </div>
        </div>
        <div style={{ height: 240 }}>
          <Bar data={barData} options={chartOpts} />
        </div>
      </div>

      {/* Spending Heatmap */}
      <div className="card">
        <div className="flex-between mb-14">
          <span className="card-title">Spending Patterns — Last 13 Weeks</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Less</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((op, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: `rgba(59,130,246,${op})` }} />
            ))}
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>More</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 16, marginRight: 4 }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ height: 14, fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: '14px' }}>{d}</div>
            ))}
          </div>
          <div style={{ flex: 1, overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {HEATMAP_DATA.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {week.map((day, di) => (
                    <div key={di} title={day > 0 ? `$${day}` : 'No spending'} style={{ width: 14, height: 14, borderRadius: 3, background: getHeatColor(day), cursor: 'pointer', transition: 'transform 0.1s' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.3)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
