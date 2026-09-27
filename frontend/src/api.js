// api.js — all backend calls
import axios from 'axios';

const BASE = 'https://safegaurd-women-safety-api.vercel.app/api';

const http = axios.create({ baseURL: BASE, timeout: 15000 });

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sg_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  r => r,
  err => {
    // Only redirect to login on 401 from non-auth endpoints
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      localStorage.removeItem('sg_token');
      localStorage.removeItem('sg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: d  => http.post('/auth/register', d),
  login:    d  => http.post('/auth/login', d),
  me:       ()  => http.get('/auth/me'),
  profile:  d  => http.put('/auth/profile', d),
};

export const contactsAPI = {
  list:   ()     => http.get('/contacts'),
  create: d      => http.post('/contacts', d),
  update: (id,d) => http.put(`/contacts/${id}`, d),
  remove: id     => http.delete(`/contacts/${id}`),
};

export const sosAPI = {
  trigger:  d  => http.post('/sos', d),
  history:  () => http.get('/sos/history'),
  cancel:   id => http.put(`/sos/${id}/cancel`),
};

export const reportsAPI = {
  list:   () => http.get('/reports'),
  create: d  => http.post('/reports', d),
};

export default http;
