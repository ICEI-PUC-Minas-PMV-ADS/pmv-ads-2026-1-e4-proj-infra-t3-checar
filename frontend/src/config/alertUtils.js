import { Alert, Platform } from 'react-native';

/**
 * Utilitário para exibir alertas de forma consistente em web e mobile
 */
export const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message, buttons);
  }
};

/**
 * Utilitário para confirmação
 */
export const showConfirm = (message) => {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(message));
  }
  return new Promise((resolve) => {
    Alert.alert(
      'Confirmação',
      message,
      [
        { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
        { text: 'OK', onPress: () => resolve(true) },
      ],
      { cancelable: false }
    );
  });
};