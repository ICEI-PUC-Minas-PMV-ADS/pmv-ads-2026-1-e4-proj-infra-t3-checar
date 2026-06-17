import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as adminNamespace from 'firebase-admin';

// Função de inicialização robusta
const initFirebase = () => {
  // Se já houver apps inicializados, retornamos true
  if (getApps().length > 0) {
    return true;
  }

  const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!credential) {
    console.error('[Firebase] VARIÁVEL FIREBASE_SERVICE_ACCOUNT_JSON NÃO ENCONTRADA!');
    return false;
  }

  try {
    const serviceAccount = JSON.parse(credential);
    
    // Inicializa usando os métodos nomeados
    initializeApp({
      credential: cert(serviceAccount)
    });
    
    return true;
  } catch (err) {
    console.error('[Firebase] Erro crítico na inicialização:', err);
    return false;
  }
};

// Exportamos o namespace admin para que o authMiddleware continue funcionando
// acessando admin.auth()
const admin = adminNamespace;
export { admin, initFirebase };