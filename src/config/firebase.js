import * as admin from 'firebase-admin'; // Mudança principal

let initialized = false;

const initFirebase = () => {
  // Proteção extra: verifica se admin e admin.apps existem
  if (initialized || (admin && admin.apps && admin.apps.length > 0)) {
    initialized = true;
    return true;
  }

  const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!credential) {
    console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT_JSON não definida — push e auth desativados.');
    return false;
  }

  try {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(credential)) });
    initialized = true;
    return true;
  } catch (err) {
    console.error('[Firebase] Falha ao inicializar:', err.message);
    return false;
  }
};

export { admin, initFirebase };
