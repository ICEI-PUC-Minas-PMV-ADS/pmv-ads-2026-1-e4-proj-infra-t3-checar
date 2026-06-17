// Importa o objeto 'admin' já inicializado e a função 'initFirebase'
import { admin, initFirebase, getFirebaseStatus } from '../config/firebase.js'; 
import Usuario from '../models/Usuario.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação obrigatório.' });
  }

  const token = authHeader.slice(7);

  // Garante que o Firebase está pronto antes de tentar validar
  if (!initFirebase()) {
    const { error } = getFirebaseStatus();
    return res.status(503).json({
      erro: 'Serviço de autenticação indisponível.',
      mensagem: error || 'Configure FIREBASE_SERVICE_ACCOUNT_JSON no Azure App Service.',
    });
  }

  try {
    // Agora o 'admin' está disponível e garantido pelo módulo firebase.js
    const decoded = await admin.auth().verifyIdToken(token);

    const usuario = await Usuario
      .findOne({ email: decoded.email?.toLowerCase?.() ?? decoded.email })
      .select('_id tipoUsuario nome email')
      .lean();

    if (!usuario) {
      return res.status(401).json({
        erro: 'Usuário não encontrado.',
        mensagem: 'Autenticado no Firebase mas sem cadastro local.',
      });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      id: usuario._id.toString(),
      nome: usuario.nome,
      tipoUsuario: usuario.tipoUsuario,
    };

    next();
  } catch (err) {
    console.error('[Auth] Erro ao verificar token:', err.message);
    return res.status(401).json({ erro: 'Falha na autenticação.' });
  }
};

export default authMiddleware;