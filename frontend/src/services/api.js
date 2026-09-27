// src/services/api.js
// Centralized API client using axios
// All backend communication goes through this module

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://safegaurd-women-safety-api.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth token injection ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('safeguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Global error handling ────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('safeguard_token');
      localStorage.removeItem('safeguard_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

// ─── SOS ──────────────────────────────────────────────────────────────────────
export const sosAPI = {
  activate: (data) => api.post('/sos', data),
  getActive: () => api.get('/sos/active'),
  getHistory: () => api.get('/sos/history'),
  cancel: (id, reason) => api.put(`/sos/${id}/cancel`, { reason }),
  resolve: (id) => api.put(`/sos/${id}/resolve`),
  getById: (id) => api.get(`/sos/${id}`),
};

// ─── Location ─────────────────────────────────────────────────────────────────
export const locationAPI = {
  update: (data) => api.post('/location', data),
  getCurrent: () => api.get('/location/current'),
  getHistory: () => api.get('/location/history'),
  trackUser: (userId) => api.get(`/location/track/${userId}`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  create: (data) => api.post('/reports', data),
  getDangerZones: () => api.get('/reports/danger-zones'),
  getNearby: (lat, lng, radius) => api.get('/reports/nearby', { params: { lat, lng, radius } }),
};

// ─── Risk ─────────────────────────────────────────────────────────────────────
export const riskAPI = {
  calculate: (data) => api.post('/risk/calculate', data),
};

export default api;
