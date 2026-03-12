import React, { useState } from 'react';
import { formatDate } from '../../utils/format';

const ACTIVITY_LOG = [
  { action: 'Login', ip: '192.168.1.1', userAgent: 'Chrome 120 / macOS', timestamp: new Date(), status: 'success' },
  { action: 'Password Changed', ip: '192.168.1.1', userAgent: 'Chrome 120 / macOS', timestamp: new Date(Date.now() - 86400000), status: 'success' },
  { action: 'Login Attempt', ip: '45.12.89.201', userAgent: 'Firefox / Windows', timestamp: new Date(Date.now() - 172800000), status: 'failed' },
  { action: 'API Key Created', ip: '192.168.1.1', userAgent: 'Chrome 120 / macOS', timestamp: new Date(Date.now() - 259200000), status: 'success' },
  { action: 'Export Data', ip: '192.168.1.1', userAgent: 'Chrome 120 / macOS', timestamp: new Date(Date.now() - 345600000), status: 'success' },
];

const USERS = [
  { name: 'Alex Morgan', email: 'alex@axentralab.com', role: 'admin', status: 'active', avatar: 'AM', color: '#3b82f6' },
  { name: 'Jordan Lee', email: 'jordan@axentralab.com', role: 'manager', status: 'active', avatar: 'JL', color: '#10b981' },
  { name: 'Sam Rivera', email: 'sam@axentralab.com', role: 'viewer', status: 'active', avatar: 'SR', color: '#8b5cf6' },
  { name: 'Taylor Kim', email: 'taylor@axentralab.com', role: 'viewer', status: 'inactive', avatar: 'TK', color: '#f59e0b' },
];

const API_KEYS = [
  { name: 'Production API', key: 'axn_prod_•••••••••••••••••••2f8a', permissions: ['read', 'write'], lastUsed: new Date(Date.now() - 3600000), created: new Date(Date.now() - 30 * 86400000) },
  { name: 'Analytics Service', key: 'axn_svc_•••••••••••••••••••9c2d', permissions: ['read'], lastUsed: new Date(Date.now() - 7200000), created: new Date(Date.now() - 14 * 86400000) },
  { name: 'Webhook Integration', key: 'axn_whk_•••••••••••••••••••4e1b', permissions: ['read', 'webhook'], lastUsed: new Date(), created: new Date(Date.now() - 7 * 86400000) },
];

export default function SecurityPage() {
  const [tab, setTab] = useState('2fa');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [otp, setOtp] = useState('');

  const TABS = [
    { id: '2fa', label: '2FA Authentication' },
    { id: 'activity', label: 'Activity Log' },
    { id: 'roles', label: 'Role Management' },
    { id: 'api', label: 'API Keys' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Security & Settings</div>
        <div className="page-sub">Manage authentication, access control, and integrations</div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t.id} className={`btn ${tab === t.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === '2fa' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-title mb-14">Two-Factor Authentication</div>
            <div style={{ padding: '16px', background: twoFAEnabled ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-sm)', border: `1px solid ${twoFAEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>{twoFAEnabled ? '🔒' : '⚠️'}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{twoFAEnabled ? '2FA is Active' : '2FA is Disabled'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{twoFAEnabled ? 'Your account is protected by two-factor authentication' : 'Enable 2FA for an extra layer of security'}</div>
              </div>
            </div>

            {!twoFAEnabled && (
              <div>
                <button className="btn btn-primary w-full mb-14" onClick={() => setShowQR(true)}>
                  Enable 2FA with Authenticator App
                </button>
                {showQR && (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                      <div style={{ width: 140, height: 140, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        [QR Code here]
                      </div>
                      <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scan with Google Authenticator or Authy</div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Enter verification code</label>
                      <input className="form-input" placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} style={{ textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.3em' }} />
                    </div>
                    <button className="btn btn-primary w-full" onClick={() => { setTwoFAEnabled(true); setShowQR(false); }}>
                      Verify & Enable
                    </button>
                  </div>
                )}
              </div>
            )}
            {twoFAEnabled && (
              <button className="btn btn-sm" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.2)' }} onClick={() => setTwoFAEnabled(false)}>
                Disable 2FA
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-title mb-14">Security Checklist</div>
            {[
              { label: 'Strong Password', done: true },
              { label: 'Two-Factor Authentication', done: twoFAEnabled },
              { label: 'Email Verified', done: true },
              { label: 'API Keys Rotated Recently', done: false },
              { label: 'Activity Alerts Enabled', done: true },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.done ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>
                  {item.done ? '✓' : '!'}
                </div>
                <span style={{ fontSize: '0.82rem', color: item.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{item.label}</span>
                <span className={`badge ${item.done ? 'badge-emerald' : 'badge-amber'}`} style={{ marginLeft: 'auto' }}>{item.done ? 'ok' : 'todo'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="card">
          <div className="flex-between mb-14">
            <span className="card-title">Activity Log</span>
            <button className="btn btn-outline btn-sm">Export Log</button>
          </div>
          <table>
            <thead><tr><th>Action</th><th>IP Address</th><th>Browser / OS</th><th>Timestamp</th><th>Status</th></tr></thead>
            <tbody>
              {ACTIVITY_LOG.map((log, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{log.action}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{log.ip}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{log.userAgent}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.timestamp.toLocaleString()}</td>
                  <td><span className={`badge ${log.status === 'success' ? 'badge-emerald' : 'badge-rose'}`}>{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'roles' && (
        <div className="card">
          <div className="flex-between mb-14">
            <span className="card-title">User & Role Management</span>
            <button className="btn btn-primary btn-sm">+ Invite User</button>
          </div>
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {USERS.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${u.color}20`, border: `1px solid ${u.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: u.color, flexShrink: 0 }}>{u.avatar}</div>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <select className="form-select" style={{ width: 110, padding: '4px 8px', fontSize: '0.75rem' }} defaultValue={u.role}>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td><span className={`badge ${u.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>{u.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm">Edit</button>
                      <button className="btn btn-sm" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.2)' }}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Role Permissions:</strong> Admin — full access · Manager — read + write, no settings · Viewer — read only
          </div>
        </div>
      )}

      {tab === 'api' && (
        <div>
          <div className="card mb-14">
            <div className="flex-between mb-14">
              <span className="card-title">API Keys</span>
              <button className="btn btn-primary btn-sm">+ Create Key</button>
            </div>
            {API_KEYS.map((key, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < API_KEYS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex-between mb-8">
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{key.name}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {key.permissions.map(p => <span key={p} className="badge badge-blue">{p}</span>)}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '6px 10px', borderRadius: 6, marginBottom: 6 }}>{key.key}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Last used: {key.lastUsed.toLocaleDateString()} · Created: {key.created.toLocaleDateString()}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm">Rotate</button>
                    <button className="btn btn-sm" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.2)' }}>Revoke</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title mb-14">API Integrations</div>
            <div className="grid-3">
              {[
                { name: 'Stripe', desc: 'Payment processing', icon: '💳', connected: true },
                { name: 'Plaid', desc: 'Bank connections', icon: '🏦', connected: true },
                { name: 'CoinGecko', desc: 'Crypto prices', icon: '🦎', connected: false },
                { name: 'Alpha Vantage', desc: 'Stock data', icon: '📈', connected: false },
                { name: 'Twilio', desc: 'SMS alerts', icon: '📱', connected: false },
                { name: 'Slack', desc: 'Notifications', icon: '💬', connected: true },
              ].map((int, i) => (
                <div key={i} className="card" style={{ padding: 14 }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{int.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 3 }}>{int.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>{int.desc}</div>
                  <button className={`btn btn-sm ${int.connected ? 'btn-outline' : 'btn-primary'} w-full`}>
                    {int.connected ? '✓ Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
