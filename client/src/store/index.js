import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      // UI
      theme: 'dark',
      sidebarCollapsed: false,
      activePage: 'overview',
      currency: 'USD',

      // Data
      wallets: [],
      transactions: [],
      investments: [],
      notifications: [],
      dashboardStats: null,

      // Auth actions
      login: async (email, password, twoFactorToken) => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/login', { email, password, twoFactorToken });
          if (res.data.requiresTwoFactor) {
            set({ loading: false });
            return { requiresTwoFactor: true };
          }
          set({ user: res.data.user, token: res.data.token, isAuthenticated: true, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          return { success: true };
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ loading: true });
        try {
          const res = await api.post('/auth/register', data);
          set({ user: res.data.user, token: res.data.token, isAuthenticated: true, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          return { success: true };
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, wallets: [], transactions: [], investments: [], notifications: [], dashboardStats: null });
        delete api.defaults.headers.common['Authorization'];
      },

      // UI actions
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setActivePage: (page) => set({ activePage: page }),
      setCurrency: (currency) => set({ currency }),

      // Data actions
      fetchDashboardStats: async () => {
        const res = await api.get('/analytics/dashboard');
        set({ dashboardStats: res.data.data });
      },
      fetchWallets: async () => {
        const res = await api.get('/wallets');
        set({ wallets: res.data.data });
      },
      fetchTransactions: async (params = {}) => {
        const res = await api.get('/transactions', { params });
        set({ transactions: res.data.data });
        return res.data;
      },
      fetchInvestments: async () => {
        const res = await api.get('/investments');
        set({ investments: res.data.data.investments });
        return res.data.data;
      },
      fetchNotifications: async () => {
        const res = await api.get('/notifications');
        set({ notifications: res.data.data });
        return res.data;
      },
      markNotificationRead: async (id) => {
        await api.put(`/notifications/${id}/read`);
        set(s => ({ notifications: s.notifications.map(n => n._id === id ? { ...n, isRead: true } : n) }));
      },
      updatePreferences: async (prefs) => {
        await api.put('/users/preferences', prefs);
        set(s => ({ user: { ...s.user, preferences: { ...s.user?.preferences, ...prefs } } }));
      },
    }),
    {
      name: 'axentralab-store',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed, currency: state.currency, token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
