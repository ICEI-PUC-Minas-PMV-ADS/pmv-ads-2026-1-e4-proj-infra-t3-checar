import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { triggerUnauthorized } from './authState';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return config;

  const forceRefresh = Boolean(config._forceTokenRefresh);
  const token = await getIdToken(firebaseUser, forceRefresh);
  if (!token) return config;

  config.headers['Authorization'] = `Bearer ${token}`;
  config.headers['X-User-Id'] = firebaseUser.uid;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      original &&
      !original._authRetry &&
      auth.currentUser &&
      error.response?.data?.erro === 'Falha na autenticação.'
    ) {
      original._authRetry = true;
      original._forceTokenRefresh = true;
      try {
        return await api.request(original);
      } catch (retryErr) {
        error = retryErr;
      }
    }

    if (error.response?.status === 401) {
      const codigo = error.response?.data?.codigo;
      const sessaoInvalida =
        codigo === 'auth/id-token-revoked' ||
        codigo === 'auth/user-disabled';
      if (sessaoInvalida && auth.currentUser) {
        triggerUnauthorized();
      }
    }

    const serverMessage =
      error.response?.data?.detalhe ||
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
