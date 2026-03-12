import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('axentralab_token');
    if (token) {
      api.get('/auth/me').then(res => { setUser(res.data.user); }).catch(() => { localStorage.removeItem('axentralab_token'); }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('axentralab_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('axentralab_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('axentralab_token');
    setUser(null);
  };

  const updatePreferences = async (prefs) => {
    const res = await api.put('/settings/preferences', prefs);
    setUser(u => ({ ...u, preferences: res.data.preferences }));
  };

  return <AuthContext.Provider value={{ user, login, register, logout, loading, updatePreferences }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
