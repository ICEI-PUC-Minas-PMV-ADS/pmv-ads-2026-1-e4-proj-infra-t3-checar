import crypto from 'node:crypto';
import { admin, initFirebase, getFirebaseStatus } from '../config/firebase.js';
import Usuario from '../models/Usuario.js';

const findOrCreateUsuario = async (decoded) => {
  const email = decoded.email?.toLowerCase?.()?.trim();
  if (!email) return null;

  let usuario = await Usuario
    .findOne({ email })
    .select('_id tipoUsuario nome email')
    .lean();

  if (usuario) return usuario;

  try {
    const novo = new Usuario({
      nome: decoded.name?.trim() || email.split('@')[0] || 'Usuário',
      email,
      senha: crypto.randomBytes(24).toString('hex'),
      tipoUsuario: 'Motorista',
    });
    await novo.save();
    console.log('[Auth] Usuário auto-provisionado no MongoDB:', email);
    return {
      _id: novo._id,
      tipoUsuario: novo.tipoUsuario,
      nome: novo.nome,
      email: novo.email,
    };
  } catch (err) {
    if (err.code === 11000) {
      return Usuario.findOne({ email }).select('_id tipoUsuario nome email').lean();
    }
    console.error('[Auth] Falha ao auto-provisionar usuário:', err.message);
    return null;
  }
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação obrigatório.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticação obrigatório.' });
  }

  if (!initFirebase()) {
    const { error } = getFirebaseStatus();
    return res.status(503).json({
      erro: 'Serviço de autenticação indisponível.',
      mensagem: error || 'Configure FIREBASE_SERVICE_ACCOUNT_JSON no Azure App Service.',
    });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const usuario = await findOrCreateUsuario(decoded);

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
    console.error('[Auth] Erro ao verificar token:', err.code, err.message);
    return res.status(401).json({
      erro: 'Falha na autenticação.',
      codigo: err.code || 'unknown',
    });
  }
};

export default authMiddleware;
