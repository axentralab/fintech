import { useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import Icon from '../components/ui/Icon';
import { useStore } from '../store';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

const PIE_DATA = {
  labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other'],
  datasets: [{
    data: [32, 18, 12, 9, 11, 6, 7, 5],
    backgroundColor: ['#2563eb','#10b981','#f59e0b','#ef4444','#6366f1','#06b6d4','#f43f5e','#8b5cf6'],
    borderWidth: 0,
    hoverOffset: 6,
  }],
};

const CASHFLOW_DATA = {
  labels: ['Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan'],
  datasets: [
    { label: 'Income', data: [34000,36000,35500,38000,39200,41000,38500,42300,39800,44000,42300,46800], backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6, borderSkipped: false },
    { label: 'Expenses', data: [22000,21000,23000,20500,21800,19500,22300,18640,21000,20200,19800,18640], backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 6, borderSkipped: false },
  ],
};

function Heatmap() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const cells = Array.from({ length: 365 }, (_, i) => ({
    val: Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 500),
    day: i,
  }));
  const max = Math.max(...cells.map(c => c.val));
  const getColor = (val) => {
    if (val === 0) return isDark ? '#111827' : '#e8edf8';
    const intensity = val / max;
    if (intensity < 0.25) return isDark ? '#1e3a5f' : '#bfdbfe';
    if (intensity < 0.5) return isDark ? '#1d4ed8' : '#60a5fa';
    if (intensity < 0.75) return isDark ? '#2563eb' : '#2563eb';
    return '#0ea5e9';
  };
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {months.map(m => <span key={m} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>{m}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(53, 1fr)', gap: 2 }}>
        {cells.map((c, i) => (
          <div
            key={i}
            title={`$${c.val}`}
            style={{ width: '100%', aspectRatio: '1', borderRadius: 2, background: getColor(c.val), cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.target.style.opacity = '0.7'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>Less</span>
        {['#111827','#1e3a5f','#1d4ed8','#2563eb','#0ea5e9'].map(c => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { theme } = useStore();
  const [cashflowPeriod, setCashflowPeriod] = useState('12m');
  const isDark = theme === 'dark';

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: isDark ? '#131c2b' : '#fff', borderColor: 'rgba(56,189,248,0.2)', borderWidth: 1, titleColor: isDark ? '#e8f0fe' : '#0d1424', bodyColor: isDark ? '#7a90b0' : '#3d5070', padding: 10 } },
  };
  const scalesOpts = {
    x: { grid: { color: 'rgba(56,189,248,0.04)', drawBorder: false }, ticks: { color: isDark ? '#3d5070' : '#8aa0be', font: { size: 11, family: "'DM Mono',monospace" } } },
    y: { grid: { color: 'rgba(56,189,248,0.04)', drawBorder: false }, ticks: { color: isDark ? '#3d5070' : '#8aa0be', font: { size: 11, family: "'DM Mono',monospace" }, callback: v => `$${(v/1000).toFixed(0)}k` } },
  };

  const KPIs = [
    { label: 'ROI (YTD)', value: '14.7%', change: '+2.3%', positive: true, icon: 'percent', color: 'var(--success)' },
    { label: 'Net Profit', value: '$23,660', change: '+8.3%', positive: true, icon: 'trending', color: 'var(--brand-secondary)' },
    { label: 'Savings Rate', value: '55.9%', change: '+1.8%', positive: true, icon: 'coin', color: 'var(--warning)' },
    { label: 'Expense Ratio', value: '44.1%', change: '-1.8%', positive: true, icon: 'analytics', color: 'var(--info)' },
  ];

  return (
    <div className="section-gap page-enter">
      {/* KPI Row */}
      <div className="grid-4">
        {KPIs.map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div className="flex-between mb-8">
              <span className="card-title">{k.label}</span>
              <Icon name={k.icon} size={15} color={k.color} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', color: k.color }}>{k.value}</div>
            <div style={{ marginTop: 4 }}>
              <span className={k.positive ? 'stat-up' : 'stat-down'}>
                <Icon name={k.positive ? 'arrowUp' : 'arrowDown'} size={11} />
                {k.change} vs last period
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        {/* Pie */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Expense Distribution</span>
            <div className="tabs">
              {['Month', 'Quarter', 'Year'].map(p => (
                <div key={p} className={`tab ${p === 'Month' ? 'active' : ''}`} style={{ padding: '4px 10px' }}>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ height: 220, flex: '0 0 220px' }}>
              <Pie data={PIE_DATA} options={{ ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }} />
            </div>
            <div style={{ flex: 1 }}>
              {PIE_DATA.labels.map((label, i) => (
                <div key={label} className="flex-between" style={{ marginBottom: 8 }}>
                  <div className="flex gap-8" style={{ alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_DATA.datasets[0].backgroundColor[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--font-size-xs)' }}>{label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{PIE_DATA.datasets[0].data[i]}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar - Monthly Cashflow */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Monthly Cashflow</span>
            <div className="flex gap-8">
              <div className="flex gap-8">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ width: 8, height: 8, background: 'rgba(16,185,129,0.7)', borderRadius: 2, display: 'inline-block' }} /> Income
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--font-size-xs)' }}>
                  <span style={{ width: 8, height: 8, background: 'rgba(239,68,68,0.6)', borderRadius: 2, display: 'inline-block' }} /> Expenses
                </span>
              </div>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <Bar data={CASHFLOW_DATA} options={{ ...baseOpts, scales: scalesOpts, plugins: { ...baseOpts.plugins }, barPercentage: 0.6, categoryPercentage: 0.8 }} />
          </div>
        </div>
      </div>

      {/* Spending Heatmap */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Spending Heatmap — 2024</span>
          <span className="badge badge-neutral">Daily patterns</span>
        </div>
        <Heatmap />
      </div>
    </div>
  );
}
