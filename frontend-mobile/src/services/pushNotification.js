import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

// Exibe notificações mesmo com o app em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Solicita permissão e registra o token FCM no backend.
 * Deve ser chamado após o login do usuário.
 */
const registrarTokenPush = async () => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Push] Permissão de notificações negada pelo usuário.');
      return;
    }

    // Expo Push Token (funciona com Expo Go; para build nativo usar getDevicePushTokenAsync)
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await api.post('/fcm-tokens', {
      token,
      plataforma: Platform.OS,
    });

    console.log('[Push] Token registrado:', token);
    return token;
  } catch (err) {
    console.error('[Push] Erro ao registrar token:', err.message);
  }
};

/**
 * Remove o token do backend ao fazer logout.
 */
const removerTokenPush = async (token) => {
  if (!token) return;
  try {
    await api.delete(`/fcm-tokens/${encodeURIComponent(token)}`);
  } catch {
    // silencia — token pode já ter sido removido
  }
};

export { registrarTokenPush, removerTokenPush };
