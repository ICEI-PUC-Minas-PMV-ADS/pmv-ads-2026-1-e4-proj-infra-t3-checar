import admin from 'firebase-admin';

let initialized = false;

const initFirebase = () => {
  if (initialized || admin.apps.length > 0) {
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
