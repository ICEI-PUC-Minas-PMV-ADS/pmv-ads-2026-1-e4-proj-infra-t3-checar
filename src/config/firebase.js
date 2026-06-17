import { initializeApp, cert, getApps } from 'firebase-admin/app';
import * as adminNamespace from 'firebase-admin';

let initError = null;

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    // Azure App Settings: JSON colado com escape duplo ou base64
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (err) {
      initError = `JSON inválido em FIREBASE_SERVICE_ACCOUNT_JSON: ${err.message}`;
      return null;
    }
  }
};

const initFirebase = () => {
  if (getApps().length > 0) {
    return true;
  }

  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) {
    if (!initError) {
      initError = 'FIREBASE_SERVICE_ACCOUNT_JSON não definida no ambiente.';
    }
    console.error('[Firebase]', initError);
    return false;
  }

  try {
    initializeApp({ credential: cert(serviceAccount) });
    initError = null;
    return true;
  } catch (err) {
    initError = `Falha ao inicializar Firebase Admin: ${err.message}`;
    console.error('[Firebase]', initError);
    return false;
  }
};

const getFirebaseStatus = () => ({
  configured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()),
  ready: getApps().length > 0 || initFirebase(),
  error: initError,
});

const admin = adminNamespace;
export { admin, initFirebase, getFirebaseStatus };
