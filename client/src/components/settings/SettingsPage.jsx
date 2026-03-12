import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'SGD', 'BTC'];
const TIMEZONES = ['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'];

const WIDGET_LIST = [
  { id: 'balance', label: 'Total Balance', pinned: true },
  { id: 'pnl_daily', label: 'Daily PnL', pinned: true },
  { id: 'pnl_weekly', label: 'Weekly PnL', pinned: false },
  { id: 'savings', label: 'Savings Rate', pinned: true },
  { id: 'portfolio', label: 'Portfolio Value', pinned: false },
  { id: 'cashflow', label: 'Cashflow Chart', pinned: true },
  { id: 'heatmap', label: 'Spending Heatmap', pinned: false },
  { id: 'alerts', label: 'Alerts Panel', pinned: true },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('English');
  const [widgets, setWidgets] = useState(WIDGET_LIST);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [dragging, setDragging] = useState(null);

  const togglePin = (id) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, pinned: !w.pinned } : w));

  const handleDragStart = (id) => setDragging(id);
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOver(id); };
  const handleDrop = (targetId) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setWidgets(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(w => w.id === dragging);
      const toIdx = arr.findIndex(w => w.id === targetId);
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
    setDragging(null); setDragOver(null);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Dashboard Settings</div>
        <div className="page-sub">Personalize your Axentralab experience</div>
      </div>

      <div className="grid-2">
        {/* Appearance */}
        <div className="card mb-14">
          <div className="card-title mb-14">🎨 Appearance</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 3 }}>Theme</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Switch between light and dark mode</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`} onClick={() => theme !== 'dark' && toggleTheme()}>
                🌙 Dark
              </button>
              <button className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`} onClick={() => theme !== 'light' && toggleTheme()}>
                ☀️ Light
              </button>
            </div>
          </div>

          <div className="divider" />

          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select className="form-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
              {TIMEZONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <select className="form-select" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Profile */}
        <div className="card mb-14">
          <div className="card-title mb-14">👤 Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: '#fff', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{user?.email || 'user@axentralab.com'}</div>
              <span className={`badge ${user?.role === 'admin' ? 'badge-rose' : user?.role === 'manager' ? 'badge-amber' : 'badge-blue'}`} style={{ marginTop: 4 }}>{user?.role || 'viewer'}</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" defaultValue={user?.name || ''} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" defaultValue={user?.email || ''} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="Leave blank to keep current" />
          </div>
        </div>
      </div>

      {/* Widgets / Drag-and-drop */}
      <div className="card mb-14">
        <div className="flex-between mb-14">
          <div>
            <div className="card-title mb-4">⚡ Dashboard Widgets</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Drag to reorder · Click pin to show/hide on dashboard</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {widgets.map((w) => (
            <div key={w.id}
              draggable
              onDragStart={() => handleDragStart(w.id)}
              onDragOver={e => handleDragOver(e, w.id)}
              onDrop={() => handleDrop(w.id)}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${dragOver === w.id ? 'var(--accent-blue)' : 'var(--border)'}`, background: dragging === w.id ? 'rgba(59,130,246,0.08)' : 'var(--bg-primary)', cursor: 'grab', display: 'flex', alignItems: 'center', gap: 9, transition: 'all 0.15s', userSelect: 'none' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>⠿</span>
              <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 500 }}>{w.label}</span>
              <button onClick={() => togglePin(w.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: w.pinned ? 'rgba(59,130,246,0.12)' : 'transparent', color: w.pinned ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                {w.pinned ? '📌 Pinned' : '📍 Pin'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card mb-14">
        <div className="card-title mb-14">🔔 Notifications</div>
        <div className="grid-2">
          {[
            { label: 'Email Alerts', desc: 'Get transaction alerts via email', on: true },
            { label: 'SMS Notifications', desc: 'Critical alerts via SMS', on: false },
            { label: 'Price Alerts', desc: 'Investment price threshold alerts', on: true },
            { label: 'Weekly Report', desc: 'Weekly financial summary email', on: true },
            { label: 'Security Alerts', desc: 'New login & suspicious activity', on: true },
            { label: 'Payment Reminders', desc: 'Upcoming scheduled payments', on: true },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.82rem' }}>{n.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.desc}</div>
              </div>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: n.on ? 'var(--accent-blue)' : 'var(--bg-primary)', border: '1px solid var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: n.on ? 20 : 2, transition: 'left 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? '✅ Saved!' : 'Save Settings'}
        </button>
        <button className="btn btn-outline">Reset to Defaults</button>
      </div>
    </div>
  );
}
