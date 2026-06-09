/**
 * Central API config for React Native / Expo.
 *
 * Set EXPO_PUBLIC_API_URL in a .env file at frontend-mobile root:
 *   EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
 *
 * Defaults:
 *   - Android emulator → http://10.0.2.2:3000
 *   - iOS simulator    → http://localhost:3000
 *   - Physical device  → set EXPO_PUBLIC_API_URL to your machine's LAN IP
 */
import { Platform } from 'react-native';
import axios from 'axios';

const getBaseUrl = () => {
  // Expo environment variable (set in .env at frontend-mobile root)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Defaults per platform
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

export const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
