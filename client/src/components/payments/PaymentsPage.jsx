import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'JPY', 'CHF', 'AUD', 'SGD'];
const RATES = { USD: 1, EUR: 0.92, GBP: 0.79, BTC: 0.0000218, ETH: 0.00042, JPY: 149.2, CHF: 0.89, AUD: 1.52, SGD: 1.34 };

const SCHEDULED = [
  { id: 1, recipient: 'AWS Services', amount: 2400, currency: 'USD', date: '2024-02-01', recurring: 'monthly', status: 'scheduled' },
  { id: 2, recipient: 'Office Rent', amount: 3500, currency: 'USD', date: '2024-02-05', recurring: 'monthly', status: 'scheduled' },
  { id: 3, recipient: 'Stripe Subscription', amount: 149, currency: 'USD', date: '2024-02-10', recurring: 'monthly', status: 'scheduled' },
  { id: 4, recipient: 'Team Salaries', amount: 28000, currency: 'USD', date: '2024-02-28', recurring: 'monthly', status: 'pending' },
];

const QR_EXAMPLE = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
<rect width="200" height="200" fill="#111827"/>
<rect x="20" y="20" width="60" height="60" fill="none" stroke="#3b82f6" stroke-width="6"/>
<rect x="30" y="30" width="40" height="40" fill="#3b82f6"/>
<rect x="120" y="20" width="60" height="60" fill="none" stroke="#3b82f6" stroke-width="6"/>
<rect x="130" y="30" width="40" height="40" fill="#3b82f6"/>
<rect x="20" y="120" width="60" height="60" fill="none" stroke="#3b82f6" stroke-width="6"/>
<rect x="30" y="130" width="40" height="40" fill="#3b82f6"/>
<rect x="90" y="20" width="10" height="10" fill="#3b82f6"/>
<rect x="100" y="30" width="10" height="10" fill="#3b82f6"/>
<rect x="90" y="40" width="10" height="10" fill="#3b82f6"/>
<rect x="100" y="50" width="10" height="10" fill="#3b82f6"/>
<rect x="90" y="60" width="10" height="10" fill="#3b82f6"/>
<rect x="120" y="90" width="10" height="10" fill="#3b82f6"/>
<rect x="140" y="90" width="10" height="10" fill="#3b82f6"/>
<rect x="160" y="90" width="10" height="10" fill="#3b82f6"/>
<rect x="130" y="100" width="10" height="10" fill="#3b82f6"/>
<rect x="150" y="100" width="10" height="10" fill="#3b82f6"/>
<rect x="120" y="110" width="10" height="10" fill="#3b82f6"/>
<rect x="140" y="110" width="10" height="10" fill="#3b82f6"/>
<rect x="160" y="110" width="10" height="10" fill="#3b82f6"/>
<rect x="120" y="120" width="10" height="10" fill="#3b82f6"/>
<rect x="130" y="130" width="10" height="10" fill="#3b82f6"/>
<rect x="150" y="130" width="10" height="10" fill="#3b82f6"/>
<rect x="90" y="90" width="20" height="20" fill="#3b82f6"/>
<rect x="90" y="120" width="10" height="10" fill="#3b82f6"/>
<rect x="100" y="140" width="10" height="10" fill="#3b82f6"/>
</svg>`);

export default function PaymentsPage() {
  const [tab, setTab] = useState('send');
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [qrAmount, setQrAmount] = useState('100');
  const [qrCurrency, setQrCurrency] = useState('USD');
  const [sent, setSent] = useState(false);

  const convertedAmount = amount ? (parseFloat(amount) / RATES[fromCurrency] * RATES[toCurrency]).toFixed(4) : '';
  const rate = RATES[toCurrency] / RATES[fromCurrency];

  const handleSend = () => {
    if (!amount || !recipient) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setAmount(''); setRecipient(''); setNote('');
  };

  const TABS = [
    { id: 'send', label: 'Send Money', icon: '→' },
    { id: 'scheduled', label: 'Scheduled', icon: '🕐' },
    { id: 'qr', label: 'QR Payment', icon: '⬛' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Payments & Transfers</div>
        <div className="page-sub">Multi-currency, instant transfers worldwide</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} className={`btn ${tab === t.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'send' && (
        <div className="grid-2">
          {/* Send Form */}
          <div className="card">
            <div className="card-title mb-14">Quick Send</div>

            {sent && (
              <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, color: 'var(--accent-emerald)', fontSize: '0.82rem' }}>
                ✅ Payment sent successfully!
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Recipient</label>
              <input className="form-input" placeholder="Name, email, or account number" value={recipient} onChange={e => setRecipient(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Amount</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1 }} />
                <select className="form-select" style={{ width: 90 }} value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Currency Conversion */}
            <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: 3 }}>Recipient gets</div>
                <div style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{convertedAmount || '0.00'} {toCurrency}</div>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</div>
              <select className="form-select" style={{ width: 90 }} value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-input" placeholder="Payment description..." value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transfer fee</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>Total</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>{amount ? formatCurrency(parseFloat(amount)) : '$0.00'} {fromCurrency}</span>
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={handleSend}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Send Payment
            </button>
          </div>

          {/* Quick Contacts */}
          <div className="card">
            <div className="card-title mb-14">Recent Recipients</div>
            {[
              { name: 'Sarah Chen', email: 'sarah@example.com', avatar: 'SC', color: '#3b82f6' },
              { name: 'Marcus Webb', email: 'marcus@corp.io', avatar: 'MW', color: '#10b981' },
              { name: 'Anya Patel', email: 'anya@design.co', avatar: 'AP', color: '#8b5cf6' },
              { name: 'Tom Fischer', email: 'tom@finance.eu', avatar: 'TF', color: '#f59e0b' },
              { name: 'Acme Corp', email: 'billing@acme.com', avatar: 'AC', color: '#06b6d4' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                onClick={() => setRecipient(c.email)}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${c.color}20`, border: `1px solid ${c.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', color: c.color, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{c.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.email}</div>
                </div>
                <button className="btn btn-outline btn-sm">Send</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'scheduled' && (
        <div className="card">
          <div className="flex-between mb-14">
            <span className="card-title">Scheduled Payments</span>
            <button className="btn btn-primary btn-sm">+ Schedule New</button>
          </div>
          <table>
            <thead><tr><th>Recipient</th><th>Amount</th><th>Next Date</th><th>Recurring</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {SCHEDULED.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.recipient}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(p.amount)} {p.currency}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.date}</td>
                  <td><span className="badge badge-blue">{p.recurring}</span></td>
                  <td><span className={`badge ${p.status === 'scheduled' ? 'badge-cyan' : 'badge-amber'}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm">Edit</button>
                      <button className="btn btn-sm" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.2)' }}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'qr' && (
        <div className="grid-2">
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-title mb-14">QR Code Payment</div>
            <div style={{ marginBottom: 14 }}>
              <img src={QR_EXAMPLE} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12, border: '1px solid var(--border)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>Scan to pay · Expires in 15 min</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
              <input className="form-input" type="number" placeholder="Amount" value={qrAmount} onChange={e => setQrAmount(e.target.value)} style={{ width: 120 }} />
              <select className="form-select" style={{ width: 90 }} value={qrCurrency} onChange={e => setQrCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-blue)', marginBottom: 14 }}>
              {formatCurrency(parseFloat(qrAmount) || 0, qrCurrency === 'BTC' || qrCurrency === 'ETH' ? 'USD' : qrCurrency)}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-primary">Regenerate QR</button>
              <button className="btn btn-outline">Share</button>
            </div>
          </div>
          <div className="card">
            <div className="card-title mb-14">Multi-Currency Rates</div>
            {CURRENCIES.slice(0, 7).map((cur, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 6 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cur}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>1 USD = {RATES[cur].toFixed(4)} {cur}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
