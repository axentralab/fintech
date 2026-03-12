import { useState } from 'react';
import Icon from '../components/ui/Icon';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH', 'USDC', 'CHF', 'CAD', 'AUD'];
const SCHEDULED = [
  { id: '1', recipient: 'Netflix', amount: 15.99, currency: 'USD', date: '2024-02-01', frequency: 'monthly', status: 'scheduled' },
  { id: '2', recipient: 'AWS Services', amount: 234.50, currency: 'USD', date: '2024-02-13', frequency: 'monthly', status: 'scheduled' },
  { id: '3', recipient: 'Office Rent', amount: 2800, currency: 'USD', date: '2024-02-01', frequency: 'monthly', status: 'scheduled' },
  { id: '4', recipient: 'Team Salaries', amount: 28000, currency: 'USD', date: '2024-02-28', frequency: 'monthly', status: 'pending' },
];
const CONTACTS = [
  { id: '1', name: 'Alice Chen', initials: 'AC', color: '#2563eb' },
  { id: '2', name: 'Bob Martinez', initials: 'BM', color: '#10b981' },
  { id: '3', name: 'Carol Kim', initials: 'CK', color: '#f59e0b' },
  { id: '4', name: 'Dave Wilson', initials: 'DW', color: '#8b5cf6' },
  { id: '5', name: 'Eve Johnson', initials: 'EJ', color: '#f43f5e' },
];
const fmt = (n, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c === 'BTC' || c === 'ETH' || c === 'USDC' ? 'USD' : c, maximumFractionDigits: 2 }).format(n);

export default function Payments() {
  const [activeTab, setActiveTab] = useState('send');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Dummy QR pattern
  const QRPattern = () => (
    <div style={{ width: 160, height: 160, background: 'white', padding: 12, borderRadius: 12, display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 1 }}>
      {Array.from({ length: 169 }, (_, i) => {
        const row = Math.floor(i / 13), col = i % 13;
        const corner = (row < 3 && col < 3) || (row < 3 && col > 9) || (row > 9 && col < 3);
        const isData = corner || Math.random() > 0.55;
        return <div key={i} style={{ background: isData ? '#000' : 'transparent', borderRadius: 1 }} />;
      })}
    </div>
  );

  return (
    <div className="section-gap page-enter">
      {/* Stats */}
      <div className="grid-3">
        {[
          { label: 'Sent This Month', value: '$18,640', icon: 'send', color: 'var(--danger)' },
          { label: 'Received This Month', value: '$42,300', icon: 'arrowDown', color: 'var(--success)' },
          { label: 'Scheduled Payments', value: SCHEDULED.length, prefix: '', suffix: ' upcoming', icon: 'calendar', color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div className="flex-between mb-8">
              <span className="card-title">{s.label}</span>
              <Icon name={s.icon} size={15} color={s.color} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: s.color }}>
              {s.prefix}{s.value}{s.suffix}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Send / Schedule Panel */}
        <div className="card">
          <div className="tabs mb-16">
            {['send', 'schedule', 'qr'].map(t => (
              <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ flex: 1, textAlign: 'center' }}>
                {t === 'send' ? '⚡ Quick Send' : t === 'schedule' ? '📅 Schedule' : '📷 QR Code'}
              </div>
            ))}
          </div>

          {activeTab === 'send' && (
            <div className="section-gap" style={{ gap: 14 }}>
              <div>
                <div className="input-label mb-8">Recent Contacts</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {CONTACTS.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContact(c)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: `${c.color}20`, border: `2px solid ${selectedContact?.id === c.id ? c.color : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', color: c.color }}>{c.initials}</span>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Recipient (Email or Account)</label>
                <input className="input" placeholder="email@example.com or account number" value={recipient} onChange={e => setRecipient(e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Amount</label>
                  <input className="input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Currency</label>
                  <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Note (optional)</label>
                <input className="input" placeholder="What's this for?" value={note} onChange={e => setNote(e.target.value)} />
              </div>
              {amount && (
                <div style={{ padding: '12px 14px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex-between">
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Amount</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{currency} {parseFloat(amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex-between mt-4">
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Network fee</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>~$0.50</span>
                  </div>
                </div>
              )}
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                <Icon name="send" size={15} /> Send Payment
              </button>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="section-gap" style={{ gap: 14 }}>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Recipient</label>
                  <input className="input" placeholder="Name or account" />
                </div>
                <div className="input-group">
                  <label className="input-label">Amount</label>
                  <input className="input" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Start Date</label>
                  <input className="input" type="date" />
                </div>
                <div className="input-group">
                  <label className="input-label">Frequency</label>
                  <select className="input"><option>Once</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Yearly</option></select>
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Currency</label>
                  <select className="input">{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
                </div>
                <div className="input-group">
                  <label className="input-label">End Date</label>
                  <input className="input" type="date" />
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Icon name="calendar" size={15} /> Schedule Payment
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex-col" style={{ alignItems: 'center', gap: 20 }}>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Generate a QR code for payment requests</p>
              <div className="grid-2" style={{ width: '100%' }}>
                <div className="input-group">
                  <label className="input-label">Amount</label>
                  <input className="input" type="number" placeholder="0.00" />
                </div>
                <div className="input-group">
                  <label className="input-label">Currency</label>
                  <select className="input">{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
                </div>
              </div>
              <div className="input-group" style={{ width: '100%' }}>
                <label className="input-label">Note</label>
                <input className="input" placeholder="Payment reference..." />
              </div>
              <button className="btn btn-primary" onClick={() => setShowQR(true)} style={{ width: '100%', justifyContent: 'center' }}>
                <Icon name="qr" size={15} /> Generate QR Code
              </button>
              {showQR && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <QRPattern />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Scan to pay · Axentralab</span>
                  <div className="flex gap-8">
                    <button className="btn btn-sm btn-secondary"><Icon name="download" size={12} /> Save</button>
                    <button className="btn btn-sm btn-secondary"><Icon name="copy" size={12} /> Copy Link</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scheduled Payments */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="flex-between">
              <span className="card-title">Scheduled Payments</span>
              <span className="badge badge-warning">{SCHEDULED.length} upcoming</span>
            </div>
          </div>
          <div>
            {SCHEDULED.map(pay => (
              <div key={pay.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="send" size={14} color="var(--brand-secondary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{pay.recipient}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pay.frequency} · {pay.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--danger)' }}>-{fmt(pay.amount, pay.currency)}</div>
                  <span className={`badge ${pay.status === 'scheduled' ? 'badge-info' : 'badge-warning'}`}>{pay.status}</span>
                </div>
                <button className="btn btn-xs btn-danger btn-icon"><Icon name="x" size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
