import React from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { section: 'Main', items: [
    { id: 'dashboard', label: 'Overview', icon: 'home' },
    { id: 'transactions', label: 'Transactions', icon: 'list' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
  ]},
  { section: 'Finance', items: [
    { id: 'investments', label: 'Investments', icon: 'trending-up' },
    { id: 'payments', label: 'Payments', icon: 'send' },
  ]},
  { section: 'System', items: [
    { id: 'security', label: 'Security', icon: 'shield', badge: null },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]},
];

const ICONS = {
  home: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  list: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>),
  'bar-chart': (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
  'trending-up': (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>),
  send: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>),
  shield: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  settings: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>),
};

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">Ax</div>
        <div>
          <div className="logo-text">Axentralab</div>
          <div className="logo-sub">Finance Platform</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(section => (
          <div className="nav-section" key={section.section}>
            <span className="nav-label">{section.section}</span>
            {section.items.map(item => (
              <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
                <span className="nav-icon">{ICONS[item.icon]}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="user-card" onClick={logout} title="Click to logout">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'viewer'} · logout</div>
          </div>
        </div>
      </div>
    </div>
  );
}
