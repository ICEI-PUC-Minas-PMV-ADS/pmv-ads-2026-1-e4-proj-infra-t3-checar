import * as admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';

let initialized = false;

const initFirebase = () => {
  // Verifica se já existe uma app inicializada pelo SDK
  if (initialized || (admin.apps && admin.apps.length > 0)) {
    return true;
  }

  const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!credential) {
    console.error('[Firebase] VARIÁVEL FIREBASE_SERVICE_ACCOUNT_JSON NÃO ENCONTRADA!');
    return false;
  }

  try {
    const serviceAccount = JSON.parse(credential);
    
    // Inicialização correta usando o método da v14+
    initializeApp({
      credential: cert(serviceAccount)
    });
    
    initialized = true;
    return true;
  } catch (err) {
    console.error('[Firebase] Erro na inicialização:', err);
    return false;
  }
};

// Exportamos o 'admin' para que outros arquivos acessem admin.auth(), etc.
export { admin, initFirebase };