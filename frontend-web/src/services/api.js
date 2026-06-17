import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { getCurrentUser, triggerUnauthorized } from './authState';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Sempre obtém token fresco do Firebase (evita race após login e token expirado).
api.interceptors.request.use(async (config) => {
  try {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const token = await getIdToken(firebaseUser);
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['X-User-Id'] = firebaseUser.uid;
      return config;
    }
  } catch {
    // fallback abaixo
  }

  const user = getCurrentUser();
  if (user?.uid) config.headers['X-User-Id'] = user.uid;
  if (user?.token) config.headers['Authorization'] = `Bearer ${user.token}`;
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
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
