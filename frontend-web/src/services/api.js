import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { triggerUnauthorized } from './authState';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Usa SOMENTE token fresco do Firebase — nunca cache do sessionStorage.
api.interceptors.request.use(async (config) => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return config;

  const token = await getIdToken(firebaseUser);
  config.headers['Authorization'] = `Bearer ${token}`;
  config.headers['X-User-Id'] = firebaseUser.uid;
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const erro = error.response?.data?.erro;
      // Evita logout em requisição sem token (auth ainda inicializando)
      if (erro !== 'Token de autenticação obrigatório.' && auth.currentUser) {
        triggerUnauthorized();
      }
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
