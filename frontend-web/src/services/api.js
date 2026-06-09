// Central API configuration — all requests go through Vite proxy (/api → http://localhost:3000)
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase UID so the backend can identify the caller
api.interceptors.request.use((config) => {
  try {
    const stored = sessionStorage.getItem('checar_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      // AuthContext stores { uid, email, displayName } — uid is the Firebase UID
      if (parsed?.uid) config.headers['X-User-Id'] = parsed.uid;
    }
  } catch {/* ignore malformed JSON */}
  return config;
});

export default api;
