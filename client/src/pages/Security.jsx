import { useState } from 'react';
import Icon from '../components/ui/Icon';

const ACTIVITY_LOG = [
  { id: '1', action: 'Login', ip: '203.0.113.1', device: 'Chrome / MacOS', location: 'New York, US', time: '2024-01-15 14:32', status: 'success' },
  { id: '2', action: 'API Key Generated', ip: '203.0.113.1', device: 'Chrome / MacOS', location: 'New York, US', time: '2024-01-15 14:28', status: 'success' },
  { id: '3', action: 'Login Attempt', ip: '185.220.101.44', device: 'Firefox / Windows', location: 'Berlin, DE', time: '2024-01-15 08:14', status: 'failed' },
  { id: '4', action: 'Password Changed', ip: '203.0.113.1', device: 'Chrome / MacOS', location: 'New York, US', time: '2024-01-14 20:05', status: 'success' },
  { id: '5', action: '2FA Enabled', ip: '203.0.113.1', device: 'Chrome / MacOS', location: 'New York, US', time: '2024-01-12 11:48', status: 'success' },
  { id: '6', action: 'Login', ip: '192.168.1.44', device: 'Safari / iOS', location: 'New York, US', time: '2024-01-11 09:30', status: 'success' },
];

const ROLES = [
  { name: 'Admin', color: 'var(--danger)', permissions: ['Full Access', 'User Management', 'API Keys', 'Settings', 'Transactions', 'Reports'], users: 1 },
  { name: 'Manager', color: 'var(--warning)', permissions: ['Transactions', 'Analytics', 'Investments', 'Payments', 'Reports'], users: 3 },
  { name: 'Viewer', color: 'var(--info)', permissions: ['View Transactions', 'View Analytics', 'View Portfolio'], users: 7 },
];

const API_KEYS = [
  { id: '1', name: 'Production API', key: 'axn_a1b2c3d4e5f6...', created: '2024-01-01', lastUsed: '2024-01-15', permissions: ['read', 'write'], active: true },
  { id: '2', name: 'Analytics Webhook', key: 'axn_x9y8z7w6v5...', created: '2023-12-01', lastUsed: '2024-01-14', permissions: ['read'], active: true },
  { id: '3', name: 'Legacy Integration', key: 'axn_q1r2s3t4u5...', created: '2023-08-15', lastUsed: '2023-11-20', permissions: ['read'], active: false },
];

export default function Security() {
  const [twoFA, setTwoFA] = useState(true);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="section-gap page-enter">
      {/* Security Score */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(6,182,212,0.08))', borderColor: 'rgba(37,99,235,0.2)' }}>
        <div className="flex-between">
          <div>
            <div className="card-title">Security Score</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.04em', color: 'var(--success)', marginTop: 4 }}>
              87<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>Good — Enable all recommendations to reach 100</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: '2FA', active: twoFA, icon: 'shield' },
              { label: 'Strong PW', active: true, icon: 'key' },
              { label: 'API Keys', active: true, icon: 'zap' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: item.active ? 'rgba(16,185,129,0.12)' : 'var(--bg-elevated)', border: `1px solid ${item.active ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={item.icon} size={18} color={item.active ? 'var(--success)' : 'var(--text-muted)'} />
                </div>
                <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: item.active ? 'var(--success)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'activity', 'roles', 'api-keys'].map(t => (
          <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'api-keys' ? 'API Keys' : t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="section-gap" style={{ gap: 14 }}>
          {/* 2FA Card */}
          <div className="card">
            <div className="flex-between">
              <div className="flex gap-12" style={{ alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: twoFA ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)', border: `1px solid ${twoFA ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="shield" size={18} color={twoFA ? 'var(--success)' : 'var(--text-muted)'} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {twoFA ? 'TOTP authenticator app is active' : 'Strongly recommended — adds extra layer of security'}
                  </div>
                </div>
              </div>
              <div className="flex gap-8">
                <span className={`badge ${twoFA ? 'badge-success' : 'badge-danger'}`}>{twoFA ? 'Enabled' : 'Disabled'}</span>
                <button className={`btn btn-sm ${twoFA ? 'btn-danger' : 'btn-primary'}`} onClick={() => twoFA ? setTwoFA(false) : setShowSetup2FA(true)}>
                  {twoFA ? 'Disable' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="card">
            <div className="flex-between">
              <div className="flex gap-12" style={{ alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="key" size={18} color="var(--brand-secondary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Password</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>Last changed 14 days ago</div>
                </div>
              </div>
              <button className="btn btn-sm btn-secondary">Change Password</button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Active Sessions</span>
              <button className="btn btn-xs btn-danger">Revoke All Others</button>
            </div>
            {[
              { device: 'Chrome / MacOS', location: 'New York, US', ip: '203.0.113.1', current: true },
              { device: 'Safari / iOS 17', location: 'New York, US', ip: '192.168.1.44', current: false },
            ].map((s, i) => (
              <div key={i} className="flex-between" style={{ padding: '10px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex gap-10">
                  <Icon name="eye" size={16} color="var(--text-secondary)" />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{s.device}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{s.location} · {s.ip}</div>
                  </div>
                </div>
                <div className="flex gap-8">
                  {s.current && <span className="badge badge-success">Current</span>}
                  {!s.current && <button className="btn btn-xs btn-danger">Revoke</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Action</th><th>Device</th><th>Location</th><th>IP Address</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {ACTIVITY_LOG.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 500 }}>{log.action}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{log.device}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)' }}>{log.location}</td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{log.ip}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{log.time}</span></td>
                    <td><span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="grid-3">
          {ROLES.map(role => (
            <div key={role.name} className="card">
              <div className="flex-between mb-12">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{role.name}</span>
                </div>
                <span className="badge badge-neutral">{role.users} user{role.users !== 1 ? 's' : ''}</span>
              </div>
              <div className="section-gap" style={{ gap: 6 }}>
                {role.permissions.map(p => (
                  <div key={p} className="flex gap-8" style={{ alignItems: 'center' }}>
                    <Icon name="check" size={12} color={role.color} />
                    <span style={{ fontSize: 'var(--font-size-xs)' }}>{p}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-sm btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>Manage Role</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'api-keys' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-sm btn-primary"><Icon name="plus" size={13} /> Generate API Key</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Key</th><th>Permissions</th><th>Created</th><th>Last Used</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {API_KEYS.map(key => (
                  <tr key={key.id}>
                    <td style={{ fontWeight: 600 }}>{key.name}</td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{key.key}</span></td>
                    <td>
                      <div className="flex gap-4">
                        {key.permissions.map(p => <span key={p} className="badge badge-neutral">{p}</span>)}
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{key.created}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{key.lastUsed}</span></td>
                    <td><span className={`badge ${key.active ? 'badge-success' : 'badge-neutral'}`}>{key.active ? 'Active' : 'Revoked'}</span></td>
                    <td>
                      <div className="flex gap-4">
                        <button className="btn btn-xs btn-ghost"><Icon name="copy" size={12} /></button>
                        {key.active && <button className="btn btn-xs btn-danger">Revoke</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {showSetup2FA && (
        <div className="modal-overlay" onClick={() => setShowSetup2FA(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Setup Two-Factor Auth</div>
            <button className="modal-close" onClick={() => setShowSetup2FA(false)}><Icon name="x" size={14} /></button>
            <div className="section-gap" style={{ gap: 16 }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', background: 'white', borderRadius: 12 }}>
                <div style={{ width: 120, height: 120, background: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }} />
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div className="input-label mb-4">Manual Entry Key</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', letterSpacing: '0.08em' }}>AXNX-3K72-BVPW-9MQL</span>
              </div>
              <div className="input-group">
                <label className="input-label">Verification Code</label>
                <input className="input" placeholder="Enter 6-digit code" maxLength={6} style={{ letterSpacing: '0.2em', fontFamily: 'var(--font-mono)', textAlign: 'center', fontSize: '1.2rem' }} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setTwoFA(true); setShowSetup2FA(false); }}>
                <Icon name="shield" size={14} /> Verify and Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
