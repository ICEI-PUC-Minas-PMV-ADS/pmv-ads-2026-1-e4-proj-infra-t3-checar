// Central API — all requests go through the Vite dev proxy (/api → http://localhost:3000)
import axios from 'axios';
import { getCurrentUser } from './authState';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth headers are sourced exclusively from the authState singleton,
// which is maintained by AuthContext. Zero sessionStorage access here.
api.interceptors.request.use((config) => {
  const user = getCurrentUser();
  if (user?.uid)   config.headers['X-User-Id']    = user.uid;
  if (user?.token) config.headers['Authorization'] = `Bearer ${user.token}`;
  return config;
});

export default api;
