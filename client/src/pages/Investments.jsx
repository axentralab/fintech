import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import Icon from '../components/ui/Icon';
import { useStore } from '../store';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const PORTFOLIO = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', type: 'crypto', qty: 0.842, avgPrice: 38200, currentPrice: 45800, color: '#f59e0b', change24h: 3.2 },
  { id: '2', symbol: 'ETH', name: 'Ethereum', type: 'crypto', qty: 4.5, avgPrice: 2100, currentPrice: 2380, color: '#6366f1', change24h: -1.8 },
  { id: '3', symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', qty: 25, avgPrice: 168, currentPrice: 189, color: '#10b981', change24h: 0.9 },
  { id: '4', symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', qty: 15, avgPrice: 320, currentPrice: 374, color: '#2563eb', change24h: 1.4 },
  { id: '5', symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex', qty: 10000, avgPrice: 1.08, currentPrice: 1.094, color: '#06b6d4', change24h: 0.3 },
  { id: '6', symbol: 'SOL', name: 'Solana', type: 'crypto', qty: 48, avgPrice: 62, currentPrice: 98, color: '#f43f5e', change24h: 5.7 },
];

const genChartData = (color, trend = 'up') => {
  const base = 100;
  const pts = Array.from({ length: 30 }, (_, i) => {
    const noise = (Math.random() - 0.48) * 8;
    return base + (trend === 'up' ? i * 0.8 : i * -0.3) + noise;
  });
  return {
    labels: pts.map((_, i) => `D${i + 1}`),
    datasets: [{
      data: pts,
      borderColor: color,
      backgroundColor: `${color}15`,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 1.5,
    }],
  };
};

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
const microOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } };

export default function Investments() {
  const { theme } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [showAlertModal, setShowAlertModal] = useState(null);
  const [period, setPeriod] = useState('1W');
  const isDark = theme === 'dark';

  const types = ['all', 'crypto', 'stock', 'forex'];
  const filtered = activeTab === 'all' ? PORTFOLIO : PORTFOLIO.filter(p => p.type === activeTab);
  const totalValue = PORTFOLIO.reduce((s, p) => s + p.qty * p.currentPrice, 0);
  const totalCost = PORTFOLIO.reduce((s, p) => s + p.qty * p.avgPrice, 0);
  const totalPnL = totalValue - totalCost;
  const pnlPct = ((totalValue - totalCost) / totalCost) * 100;

  const portfolioChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Portfolio Value',
      data: [74000, 78000, 82000, 79000, 85000, 88000, 84000, 91000, 89000, 94000, 92800, 96200],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.08)',
      fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: isDark ? '#131c2b' : '#fff', borderColor: 'rgba(56,189,248,0.2)', borderWidth: 1, titleColor: isDark ? '#e8f0fe' : '#0d1424', bodyColor: isDark ? '#7a90b0' : '#3d5070', padding: 10, callbacks: { label: ctx => `$${ctx.raw.toLocaleString()}` } } },
    scales: {
      x: { grid: { color: 'rgba(56,189,248,0.04)', drawBorder: false }, ticks: { color: isDark ? '#3d5070' : '#8aa0be', font: { size: 11, family: "'DM Mono',monospace" } } },
      y: { grid: { color: 'rgba(56,189,248,0.04)', drawBorder: false }, ticks: { color: isDark ? '#3d5070' : '#8aa0be', font: { size: 11, family: "'DM Mono',monospace" }, callback: v => `$${(v/1000).toFixed(0)}k` } },
    },
  };

  return (
    <div className="section-gap page-enter">
      {/* Portfolio Overview */}
      <div className="grid-3">
        {[
          { label: 'Portfolio Value', value: fmt(totalValue), color: 'var(--brand-secondary)', icon: 'briefcase', sub: `${PORTFOLIO.length} assets` },
          { label: 'Total P&L', value: fmt(totalPnL), color: totalPnL >= 0 ? 'var(--success)' : 'var(--danger)', icon: 'trending', sub: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}% all time` },
          { label: 'Cost Basis', value: fmt(totalCost), color: 'var(--text-secondary)', icon: 'coin', sub: 'Total invested' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex-between mb-8">
              <span className="card-title">{s.label}</span>
              <Icon name={s.icon} size={16} color={s.color} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', color: s.color }}>{s.value}</div>
            <div className="card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Portfolio Performance</span>
          <div className="flex gap-8">
            <div className="tabs">
              {['1D','1W','1M','3M','1Y','All'].map(p => (
                <div key={p} className={`tab ${period === p ? 'active' : ''}`} style={{ padding: '4px 10px' }} onClick={() => setPeriod(p)}>{p}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height: 220 }}>
          <Line data={portfolioChartData} options={chartOpts} />
        </div>
      </div>

      {/* Holdings */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="tabs">
            {types.map(t => (
              <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-sm btn-primary"><Icon name="plus" size={13} /> Add Asset</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Avg Price</th>
                <th>Current Price</th>
                <th>Value</th>
                <th>P&L</th>
                <th>24h</th>
                <th>Trend</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => {
                const value = asset.qty * asset.currentPrice;
                const cost = asset.qty * asset.avgPrice;
                const pnl = value - cost;
                const pnlPct = ((value - cost) / cost) * 100;
                return (
                  <tr key={asset.id}>
                    <td>
                      <div className="flex gap-10 items-center">
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${asset.color}20`, border: `1px solid ${asset.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, color: asset.color }}>{asset.symbol.slice(0, 3)}</span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{asset.symbol}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{asset.type}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{asset.qty.toLocaleString()}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{fmt(asset.avgPrice)}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{fmt(asset.currentPrice)}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{fmt(value)}</span></td>
                    <td>
                      <div style={{ color: pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                        {pnl >= 0 ? '+' : ''}{fmt(pnl)}
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%</div>
                      </div>
                    </td>
                    <td>
                      <span className={asset.change24h >= 0 ? 'stat-up' : 'stat-down'}>
                        <Icon name={asset.change24h >= 0 ? 'arrowUp' : 'arrowDown'} size={10} />
                        {Math.abs(asset.change24h)}%
                      </span>
                    </td>
                    <td style={{ width: 90 }}>
                      <div style={{ height: 36 }}>
                        <Line data={genChartData(asset.color, asset.change24h >= 0 ? 'up' : 'down')} options={microOpts} />
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-4">
                        <button className="btn btn-xs btn-ghost" onClick={() => setShowAlertModal(asset)}><Icon name="bell" size={12} /></button>
                        <button className="btn btn-xs btn-ghost"><Icon name="edit" size={12} /></button>
                        <button className="btn btn-xs btn-danger"><Icon name="trash" size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Set Price Alert — {showAlertModal.symbol}</div>
            <button className="modal-close" onClick={() => setShowAlertModal(null)}><Icon name="x" size={14} /></button>
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Current Price</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: showAlertModal.color }}>{fmt(showAlertModal.currentPrice)}</div>
            </div>
            <div className="section-gap" style={{ gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Alert Condition</label>
                <select className="input"><option value="above">Price goes above</option><option value="below">Price drops below</option></select>
              </div>
              <div className="input-group">
                <label className="input-label">Target Price (USD)</label>
                <input className="input" type="number" placeholder={showAlertModal.currentPrice * 1.1} />
              </div>
              <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowAlertModal(null)}>Cancel</button>
                <button className="btn btn-primary"><Icon name="bell" size={14} /> Set Alert</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
