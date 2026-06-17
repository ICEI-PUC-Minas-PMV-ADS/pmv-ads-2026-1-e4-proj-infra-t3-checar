import * as admin from 'firebase-admin';

let initialized = false;

const initFirebase = () => {
  // A verificação abaixo é o ponto crítico. 
  // Se 'admin' for undefined, o código quebrava antes.
  if (initialized || (admin && admin.apps && admin.apps.length > 0)) {
    return true;
  }

  const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!credential) {
    console.error('[Firebase] VARIÁVEL FIREBASE_SERVICE_ACCOUNT_JSON NÃO ENCONTRADA!');
    return false;
  }

  try {
    const serviceAccount = JSON.parse(credential);
    // Usamos admin.default.initializeApp se necessário, 
    // mas com import * as, tentamos o admin.initializeApp direto:
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    initialized = true;
    return true;
  } catch (err) {
    console.error('[Firebase] Erro na inicialização:', err);
    return false;
  }
};

export { admin, initFirebase };