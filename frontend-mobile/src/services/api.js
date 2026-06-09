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

export default api;
