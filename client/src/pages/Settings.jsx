import { useState } from 'react';
import Icon from '../components/ui/Icon';
import { useStore } from '../store';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'SGD', 'HKD', 'BTC'];
const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore'];
const LANGUAGES = [{ code: 'en', label: 'English' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' }, { code: 'ja', label: '日本語' }];

const PINNABLE_METRICS = ['Total Balance', 'Monthly Income', 'Monthly Expenses', 'Portfolio Value', 'Net Profit', 'Savings Rate', 'ROI', 'Cashflow'];

const WIDGETS = [
  { id: 'balance', label: 'Balance Overview', enabled: true },
  { id: 'cashflow', label: 'Cashflow Chart', enabled: true },
  { id: 'portfolio', label: 'Portfolio Summary', enabled: true },
  { id: 'transactions', label: 'Recent Transactions', enabled: true },
  { id: 'alerts', label: 'Alerts Panel', enabled: true },
  { id: 'kpis', label: 'KPI Cards', enabled: false },
  { id: 'heatmap', label: 'Spending Heatmap', enabled: false },
];

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{ width: 40, height: 22, borderRadius: 11, background: checked ? 'var(--brand-primary)' : 'var(--bg-elevated)', border: `1px solid ${checked ? 'var(--brand-primary)' : 'var(--border)'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}
    >
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme, currency, setCurrency } = useStore();
  const [activeTab, setActiveTab] = useState('appearance');
  const [widgets, setWidgets] = useState(WIDGETS);
  const [pinnedMetrics, setPinnedMetrics] = useState(['Total Balance', 'Net Profit', 'ROI']);
  const [notifSettings, setNotifSettings] = useState({ email: true, push: true, sms: false, largeTransactions: true, priceAlerts: true, loginAlerts: true, weeklyReport: true, monthlyReport: false });

  const toggleWidget = (id) => setWidgets(ws => ws.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  const toggleMetric = (m) => setPinnedMetrics(pm => pm.includes(m) ? pm.filter(x => x !== m) : [...pm, m]);

  return (
    <div className="section-gap page-enter">
      <div className="tabs">
        {['appearance', 'regional', 'notifications', 'widgets', 'profile'].map(t => (
          <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === 'appearance' && (
        <div className="section-gap" style={{ gap: 14 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Theme</span></div>
            <div className="grid-3">
              {['dark', 'light', 'system'].map(t => (
                <div
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: `2px solid ${theme === t ? 'var(--brand-primary)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.15s', background: theme === t ? 'rgba(37,99,235,0.06)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <Icon name={t === 'dark' ? 'moon' : t === 'light' ? 'sun' : 'globe'} size={16} color={theme === t ? 'var(--brand-secondary)' : 'var(--text-secondary)'} />
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: theme === t ? 'var(--brand-secondary)' : 'var(--text-primary)' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                  {theme === t && <Icon name="check" size={14} color="var(--brand-secondary)" style={{ marginLeft: 'auto' }} />}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Color Accent</span></div>
            <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
              {['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#be185d','#4f46e5'].map(color => (
                <div key={color} onClick={() => {}} style={{ width: 32, height: 32, borderRadius: 8, background: color, cursor: 'pointer', border: color === '#2563eb' ? '3px solid white' : 'none', transition: 'transform 0.1s' }} />
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Font Size</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>A</span>
              <input type="range" min="12" max="18" defaultValue="14" style={{ flex: 1, accentColor: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>A</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'regional' && (
        <div className="section-gap" style={{ gap: 14 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Regional Settings</span></div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Default Currency</label>
                <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Language</label>
                <select className="input">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Timezone</label>
                <select className="input">
                  {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Date Format</label>
                <select className="input">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Number Format</label>
                <select className="input">
                  <option>1,234,567.89 (US)</option>
                  <option>1.234.567,89 (EU)</option>
                  <option>1 234 567.89</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary mt-16"><Icon name="check" size={14} /> Save Regional Settings</button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Notification Preferences</span></div>
          <div className="section-gap" style={{ gap: 0 }}>
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive alerts and reports via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
              { key: 'sms', label: 'SMS Notifications', desc: 'Text message alerts for critical events' },
              null,
              { key: 'largeTransactions', label: 'Large Transactions', desc: 'Alert when transaction exceeds threshold' },
              { key: 'priceAlerts', label: 'Price Alerts', desc: 'Investment price target notifications' },
              { key: 'loginAlerts', label: 'Login Alerts', desc: 'New device or location login alerts' },
              { key: 'weeklyReport', label: 'Weekly Summary', desc: 'Weekly financial overview report' },
              { key: 'monthlyReport', label: 'Monthly Report', desc: 'Detailed monthly financial report' },
            ].map((item, i) => item === null ? (
              <hr key={i} className="divider" />
            ) : (
              <div key={item.key} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{item.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <Toggle checked={notifSettings[item.key]} onChange={v => setNotifSettings(s => ({ ...s, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'widgets' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Dashboard Widgets</span><span className="badge badge-neutral">{widgets.filter(w => w.enabled).length} active</span></div>
            <div className="section-gap" style={{ gap: 0 }}>
              {widgets.map(w => (
                <div key={w.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name="menu" size={14} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{w.label}</span>
                  </div>
                  <Toggle checked={w.enabled} onChange={() => toggleWidget(w.id)} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Pinned Metrics</span><span className="badge badge-neutral">{pinnedMetrics.length} pinned</span></div>
            <div className="section-gap" style={{ gap: 8 }}>
              {PINNABLE_METRICS.map(m => (
                <div
                  key={m}
                  onClick={() => toggleMetric(m)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: pinnedMetrics.includes(m) ? 'rgba(37,99,235,0.08)' : 'var(--bg-elevated)', border: `1px solid ${pinnedMetrics.includes(m) ? 'rgba(37,99,235,0.2)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  <Icon name={pinnedMetrics.includes(m) ? 'check' : 'plus'} size={13} color={pinnedMetrics.includes(m) ? 'var(--brand-secondary)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: pinnedMetrics.includes(m) ? 'var(--brand-secondary)' : 'var(--text-primary)' }}>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Profile Settings</span></div>
          <div className="flex gap-20 mb-20">
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: '#fff', flexShrink: 0 }}>A</div>
            <div style={{ flex: 1 }}>
              <button className="btn btn-sm btn-secondary">Upload Photo</button>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 6 }}>JPG, PNG or GIF · Max 2MB</p>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" defaultValue="Admin User" />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" defaultValue="admin@axentralab.com" />
            </div>
            <div className="input-group">
              <label className="input-label">Role</label>
              <input className="input" value="Admin" readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="input-group">
              <label className="input-label">Company</label>
              <input className="input" defaultValue="Axentralab Inc." />
            </div>
          </div>
          <button className="btn btn-primary mt-16"><Icon name="check" size={14} /> Save Profile</button>
        </div>
      )}
    </div>
  );
}
