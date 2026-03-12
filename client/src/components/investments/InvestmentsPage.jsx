import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler } from 'chart.js';
import { formatCurrency, formatPercent } from '../../utils/format';
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

const PORTFOLIO = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', qty: 0.84, buyPrice: 38200, currentPrice: 45800, performance: { daily: 2.4, weekly: 8.1, monthly: 19.9 }, color: '#f59e0b' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', qty: 12.5, buyPrice: 2100, currentPrice: 2380, performance: { daily: -0.8, weekly: 3.2, monthly: 13.3 }, color: '#8b5cf6' },
  { symbol: 'AAPL', name: 'Apple Inc', type: 'stock', qty: 42, buyPrice: 168, currentPrice: 189, performance: { daily: 0.4, weekly: 1.8, monthly: 12.5 }, color: '#3b82f6' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', qty: 18, buyPrice: 372, currentPrice: 410, performance: { daily: 0.9, weekly: 2.1, monthly: 10.2 }, color: '#06b6d4' },
  { symbol: 'EUR/USD', name: 'Euro Dollar', type: 'forex', qty: 10000, buyPrice: 1.08, currentPrice: 1.092, performance: { daily: 0.1, weekly: -0.3, monthly: 1.1 }, color: '#10b981' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'stock', qty: 8, buyPrice: 480, currentPrice: 628, performance: { daily: 1.8, weekly: 6.4, monthly: 30.8 }, color: '#f43f5e' },
];

const MARKET_TRENDS = [
  { symbol: 'BTC', change: 2.4, price: 45800, trend: 'bullish' },
  { symbol: 'ETH', change: -0.8, price: 2380, trend: 'bearish' },
  { symbol: 'S&P 500', change: 0.6, price: 4850, trend: 'bullish' },
  { symbol: 'NASDAQ', change: 1.1, price: 15280, trend: 'bullish' },
  { symbol: 'GOLD', change: -0.3, price: 2018, trend: 'neutral' },
  { symbol: 'EUR/USD', change: 0.1, price: 1.092, trend: 'neutral' },
];

const generateChart = (base, len = 30, vol = 0.02) => {
  const data = [base];
  for (let i = 1; i < len; i++) {
    const change = data[i-1] * (1 + (Math.random() - 0.47) * vol);
    data.push(parseFloat(change.toFixed(2)));
  }
  return data;
};

export default function InvestmentsPage() {
  const [view, setView] = useState('daily');
  const [activeAsset, setActiveAsset] = useState(PORTFOLIO[0]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const len = view === 'daily' ? 24 : view === 'weekly' ? 7 : 30;
  const chartLabels = Array.from({ length: len }, (_, i) =>
    view === 'daily' ? `${i}:00` : view === 'weekly' ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i % 7] : `${i+1}`
  );

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: activeAsset.symbol,
      data: generateChart(activeAsset.currentPrice, len, 0.015),
      borderColor: activeAsset.color,
      backgroundColor: `${activeAsset.color}18`,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    }]
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8899bb', font: { size: 9 }, maxTicksLimit: 8 }, grid: { color: 'rgba(99,170,255,0.04)' } },
      y: { ticks: { color: '#8899bb', font: { size: 9 } }, grid: { color: 'rgba(99,170,255,0.04)' } }
    }
  };

  const totalValue = PORTFOLIO.reduce((s, p) => s + p.currentPrice * p.qty, 0);
  const totalInvested = PORTFOLIO.reduce((s, p) => s + p.buyPrice * p.qty, 0);
  const totalGain = totalValue - totalInvested;
  const roi = ((totalGain / totalInvested) * 100).toFixed(2);

  const filtered = filterType === 'all' ? PORTFOLIO : PORTFOLIO.filter(p => p.type === filterType);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Investment Portfolio</div>
        <div className="page-sub">Live portfolio tracking across all asset classes</div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid-4 mb-14">
        <div className="card" style={{ borderTop: '2px solid var(--accent-blue)' }}>
          <div className="card-title mb-8">Portfolio Value</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent-blue)' }}>{formatCurrency(totalValue)}</div>
          <div className="card-sub">Total current value</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--accent-emerald)' }}>
          <div className="card-title mb-8">Total Gain</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: totalGain >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
          </div>
          <div className="card-sub stat-change up">↑ {roi}% overall ROI</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--accent-violet)' }}>
          <div className="card-title mb-8">Total Invested</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent-violet)' }}>{formatCurrency(totalInvested)}</div>
          <div className="card-sub">{PORTFOLIO.length} positions</div>
        </div>
        <div className="card" style={{ borderTop: '2px solid var(--accent-amber)' }}>
          <div className="card-title mb-8">Best Performer</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent-amber)' }}>NVDA</div>
          <div className="card-sub stat-change up">↑ +30.8% monthly</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Chart */}
        <div className="card">
          <div className="flex-between mb-14">
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{activeAsset.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{activeAsset.symbol} · {activeAsset.type}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['daily', 'weekly', 'monthly'].map(v => (
                <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView(v)}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>{formatCurrency(activeAsset.currentPrice)}</div>
              <div className={`stat-change ${activeAsset.performance[view] >= 0 ? 'up' : 'down'}`}>
                {activeAsset.performance[view] >= 0 ? '↑' : '↓'} {Math.abs(activeAsset.performance[view])}% ({view})
              </div>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <Line data={chartData} options={chartOpts} />
          </div>
        </div>

        {/* Market Trends */}
        <div className="card">
          <div className="card-title mb-14">🌐 Market Trends</div>
          {MARKET_TRENDS.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < MARKET_TRENDS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>{m.symbol}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatCurrency(m.price)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={`stat-change ${m.change >= 0 ? 'up' : 'down'}`}>
                  {m.change >= 0 ? '↑' : '↓'} {Math.abs(m.change)}%
                </div>
                <span className={`badge ${m.trend === 'bullish' ? 'badge-emerald' : m.trend === 'bearish' ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '0.58rem' }}>{m.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card">
        <div className="flex-between mb-14">
          <span className="card-title">Holdings</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'crypto', 'stock', 'forex'].map(t => (
              <button key={t} className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterType(t)}>{t}</button>
            ))}
            <button className="btn btn-primary btn-sm" onClick={() => setShowAlertModal(true)}>+ Alert</button>
          </div>
        </div>
        <table>
          <thead><tr><th>Asset</th><th>Type</th><th>Quantity</th><th>Avg Buy</th><th>Current</th><th>Value</th><th>P&L</th><th>Daily</th></tr></thead>
          <tbody>
            {filtered.map((p, i) => {
              const value = p.currentPrice * p.qty;
              const pnl = (p.currentPrice - p.buyPrice) * p.qty;
              const pnlPct = ((p.currentPrice - p.buyPrice) / p.buyPrice * 100).toFixed(2);
              return (
                <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setActiveAsset(p)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.65rem', color: p.color, fontFamily: 'var(--font-mono)', padding: 4 }}>{p.symbol.slice(0,3)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${p.type === 'crypto' ? 'badge-amber' : p.type === 'stock' ? 'badge-blue' : 'badge-emerald'}`}>{p.type}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{p.qty}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{formatCurrency(p.buyPrice)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: p.color }}>{formatCurrency(p.currentPrice)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(value)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: pnl >= 0 ? '#10b981' : '#f43f5e', fontSize: '0.78rem' }}>
                    {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPct}%)
                  </td>
                  <td className={`stat-change ${p.performance.daily >= 0 ? 'up' : 'down'}`}>
                    {p.performance.daily >= 0 ? '↑' : '↓'} {Math.abs(p.performance.daily)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAlertModal && (
        <div className="modal-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🔔 Create Price Alert</div>
            <div className="form-group"><label className="form-label">Asset</label>
              <select className="form-select">{PORTFOLIO.map(p => <option key={p.symbol}>{p.symbol} — {p.name}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Condition</label>
              <select className="form-select"><option>Price goes above</option><option>Price goes below</option></select>
            </div>
            <div className="form-group"><label className="form-label">Target Price (USD)</label>
              <input className="form-input" type="number" placeholder="e.g. 50000" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary w-full">Create Alert</button>
              <button className="btn btn-outline" onClick={() => setShowAlertModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
