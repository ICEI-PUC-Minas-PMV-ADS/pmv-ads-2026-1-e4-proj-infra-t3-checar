// IMPORTANTE: use o * as para garantir a importação do objeto admin
import * as admin from 'firebase-admin';

let initialized = false;

const initFirebase = () => {
  // Verificação robusta
  if (initialized || (admin && admin.apps && admin.apps.length > 0)) {
    return true;
  }

  const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!credential) {
    console.error('[Firebase] VARIÁVEL NÃO ENCONTRADA');
    return false;
  }

  try {
    const serviceAccount = JSON.parse(credential);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    initialized = true;
    return true;
  } catch (err) {
    console.error('[Firebase] Erro crítico:', err);
    return false;
  }
};

export { admin, initFirebase };