import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import DashboardPage from './components/dashboard/DashboardPage';
import TransactionsPage from './components/transactions/TransactionsPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import InvestmentsPage from './components/investments/InvestmentsPage';
import PaymentsPage from './components/payments/PaymentsPage';
import SecurityPage from './components/security/SecurityPage';
import SettingsPage from './components/settings/SettingsPage';
import LoginPage from './pages/LoginPage';
import './index.css';

const PAGE_TITLES = {
  dashboard: 'Overview',
  transactions: 'Transactions',
  analytics: 'Analytics & Insights',
  investments: 'Investments',
  payments: 'Payments & Transfers',
  security: 'Security',
  settings: 'Settings',
};

const PAGES = {
  dashboard: DashboardPage,
  transactions: TransactionsPage,
  analytics: AnalyticsPage,
  investments: InvestmentsPage,
  payments: PaymentsPage,
  security: SecurityPage,
  settings: SettingsPage,
};

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', fontSize: '1rem' }}>Ax</div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', color: '#4a5570', letterSpacing: '0.1em' }}>LOADING...</div>
    </div>
  );

  // TODO: Re-enable login check for production
  // if (!user) return <LoginPage />;

  const PageComponent = PAGES[activePage] || DashboardPage;

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main">
        <Topbar title={PAGE_TITLES[activePage] || 'Dashboard'} />
        <div className="content-area">
          <PageComponent />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
