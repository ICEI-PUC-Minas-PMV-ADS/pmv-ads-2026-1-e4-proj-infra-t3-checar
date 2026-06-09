// Central API configuration — all requests go through Vite proxy (/api → http://localhost:3000)
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token if present in sessionStorage
api.interceptors.request.use((config) => {
  const user = sessionStorage.getItem('checar_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed?.id) config.headers['X-User-Id'] = parsed.id;
    } catch {/* ignore */}
  }
  return config;
});

export default api;
