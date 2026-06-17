import { initializeApp, cert, getApps } from 'firebase-admin/app';
import * as adminNamespace from 'firebase-admin';

let initError = null;
let initHint = 'not_configured';
let serviceAccountProjectId = null;

const PEM_BEGIN = '-----BEGIN PRIVATE KEY-----';
const PEM_END = '-----END PRIVATE KEY-----';

/**
 * Corrige private_key corrompida ao colar JSON no Azure App Settings.
 * Erro típico: "Failed to parse private key"
 */
const fixPrivateKey = (raw) => {
  if (!raw || typeof raw !== 'string') return raw;

  let key = raw.trim();

  // Azure pode duplicar escapes: \\n ou deixar literal \n
  key = key.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
  key = key.replace(/\r/g, '');

  if (!key.includes(PEM_BEGIN) || !key.includes(PEM_END)) {
    return key;
  }

  const start = key.indexOf(PEM_BEGIN) + PEM_BEGIN.length;
  const stop = key.indexOf(PEM_END);
  const body = key.slice(start, stop).replace(/\s+/g, '');

  if (!body) return key;

  const lines = body.match(/.{1,64}/g) ?? [body];
  return `${PEM_BEGIN}\n${lines.join('\n')}\n${PEM_END}\n`;
};

const normalizeServiceAccount = (serviceAccount) => {
  if (serviceAccount?.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = fixPrivateKey(serviceAccount.private_key);
  }
  return serviceAccount;
};

const sanitizeRaw = (raw) => {
  let value = raw.trim().replace(/^\uFEFF/, '');
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    value = value.slice(1, -1);
  }
  return value;
};

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    initHint = 'not_configured';
    return null;
  }

  const cleaned = sanitizeRaw(raw);

  const attempts = [
    () => JSON.parse(cleaned),
    () => JSON.parse(JSON.parse(cleaned)),
    () => JSON.parse(Buffer.from(cleaned, 'base64').toString('utf8')),
    () => JSON.parse(Buffer.from(cleaned.replace(/\s+/g, ''), 'base64').toString('utf8')),
  ];

  for (const attempt of attempts) {
    try {
      const parsed = normalizeServiceAccount(attempt());
      if (parsed?.type === 'service_account' && parsed?.private_key && parsed?.client_email) {
        initError = null;
        initHint = 'parsed';
        serviceAccountProjectId = parsed.project_id || null;
        return parsed;
      }
    } catch {
      // tenta próximo formato
    }
  }

  initHint = 'invalid_json';
  initError =
    'JSON inválido em FIREBASE_SERVICE_ACCOUNT_JSON. ' +
    'Rode: node scripts/prepare-firebase-env.mjs caminho/do/arquivo.json';
  return null;
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
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    initError = null;
    initHint = 'ready';
    console.log('[Firebase] Admin SDK inicializado:', serviceAccount.client_email, serviceAccount.project_id);
    return true;
  } catch (err) {
    initHint = 'invalid_private_key';
    initError = `Falha ao inicializar Firebase Admin: ${err.message}`;
    console.error('[Firebase]', initError);
    return false;
  }
};

const getFirebaseStatus = () => ({
  configured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()),
  ready: getApps().length > 0 || initFirebase(),
  hint: initHint,
  error: initError,
  projectId: serviceAccountProjectId,
});

const admin = adminNamespace;
export { admin, initFirebase, getFirebaseStatus };
