/**
 * Central API config for React Native / Expo.
 *
 * Para dispositivo físico: defina EXPO_PUBLIC_API_URL no arquivo
 * frontend-mobile/.env com o IP da sua máquina na rede Wi-Fi:
 *   EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
 *
 * Para descobrir seu IP:
 *   Windows: ipconfig  →  "Endereço IPv4"
 *   Mac/Linux: ifconfig | grep inet
 *
 * Defaults automáticos:
 *   - Android emulator → http://10.0.2.2:3000   (funciona sem .env)
 *   - iOS simulator    → http://localhost:3000   (funciona sem .env)
 *   - Dispositivo físico → requer EXPO_PUBLIC_API_URL
 */
import { Platform } from 'react-native';
import axios from 'axios';
<<<<<<< HEAD
=======
import { getIdToken } from 'firebase/auth';
import { auth } from './firebaseConfig';
import * as offlineStorage from './offlineStorage';
import { enqueue } from './syncQueue';
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

export const BASE_URL = getBaseUrl();

if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    `[API] EXPO_PUBLIC_API_URL não definida.\n` +
    `Usando fallback: ${BASE_URL}\n` +
    `Em dispositivo físico, crie frontend-mobile/.env com:\n` +
    `EXPO_PUBLIC_API_URL=http://SEU_IP:3000`
  );
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

<<<<<<< HEAD
=======
// ── Request interceptor: injeta Firebase ID Token ─────────────────
// O token é renovado automaticamente pelo SDK quando expirado (~1h)
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await getIdToken(user);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Sem usuário logado ou falha ao obter token — requisição prossegue sem header
  }
  return config;
});

// Rotas cacheáveis: GET key → offlineStorage key
const CACHE_MAP = {
  '/vehicles':        offlineStorage.KEYS.VEICULOS,
  '/modelochecklists': offlineStorage.KEYS.MODELOS,
  '/inspecoes':       offlineStorage.KEYS.INSPECOES_RECENTES,
};

const TTL_MAP = {
  '/vehicles':        offlineStorage.TTL.VEICULOS,
  '/modelochecklists': offlineStorage.TTL.MODELOS,
  '/inspecoes':       offlineStorage.TTL.INSPECOES_RECENTES,
};

// Response interceptor: armazena GET bem-sucedidos em cache
api.interceptors.response.use(
  (response) => {
    const { method, url } = response.config;
    const path = url?.replace(/\?.*$/, '');
    const cacheKey = CACHE_MAP[path];
    if (method === 'get' && cacheKey) {
      offlineStorage.set(cacheKey, response.data, TTL_MAP[path]).catch(() => {});
    }
    return response;
  },
  async (error) => {
    const isNetworkError = !error.response;
    const config = error.config || {};
    const method = (config.method || '').toLowerCase();
    const path   = (config.url || '').replace(/\?.*$/, '');

    // GET offline: retorna cache se disponível
    if (isNetworkError && method === 'get') {
      const cacheKey = CACHE_MAP[path];
      if (cacheKey) {
        const cached = await offlineStorage.get(cacheKey);
        if (cached) {
          return { data: cached, status: 200, _fromCache: true };
        }
      }
    }

    // Mutações offline: enfileira para sync posterior
    if (isNetworkError && ['post', 'put', 'delete'].includes(method)) {
      await enqueue({ method: method.toUpperCase(), url: config.url, data: config.data });
    }

    return Promise.reject(error);
  }
);

>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
export default api;
