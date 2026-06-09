import axios from 'axios';
import { getCurrentUser, triggerUnauthorized } from './authState';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Auth headers from the authState singleton (maintained by AuthContext).
// Zero sessionStorage access here.
api.interceptors.request.use((config) => {
  const user = getCurrentUser();
  if (user?.uid)   config.headers['X-User-Id']    = user.uid;
  if (user?.token) config.headers['Authorization'] = `Bearer ${user.token}`;
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// 1. 401 → trigger logout via the callback registered by AuthContext.
// 2. Normalize error.message so components can always use err.message reliably,
//    regardless of which key the backend used (mensagem / erro / message).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      triggerUnauthorized();
    }

    const serverMessage =
      error.response?.data?.mensagem ||
      error.response?.data?.erro     ||
      error.response?.data?.message  ||
      null;

    if (serverMessage) {
      error.message = serverMessage;
    } else if (!error.response) {
      error.message = 'Erro de conexão. Verifique sua rede.';
    }

    return Promise.reject(error);
  }
);

export default api;
