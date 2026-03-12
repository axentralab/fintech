import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token from localStorage on startup
const stored = JSON.parse(localStorage.getItem('axentralab-store') || '{}');
const token = stored?.state?.token;
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Response interceptor
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('axentralab-store');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
