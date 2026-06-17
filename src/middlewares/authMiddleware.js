import crypto from 'node:crypto';
import { getAuth } from 'firebase-admin/auth';
import { initFirebase, getFirebaseStatus } from '../config/firebase.js';
import Usuario from '../models/Usuario.js';

const EXPECTED_PROJECT_ID = 'checar-d8205';

const decodeJwtPayload = (token) => {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const buildAuthFailureResponse = (err, token) => {
  const payload = decodeJwtPayload(token);
  const serverProjectId = getFirebaseStatus().projectId || null;
  const tokenAud = payload?.aud ?? null;
  const tokenExpired = payload?.exp ? payload.exp * 1000 < Date.now() : null;

  let detalhe;
  if (tokenAud && serverProjectId && tokenAud !== serverProjectId) {
    detalhe =
      `Token emitido para "${tokenAud}" mas o servidor usa "${serverProjectId}". ` +
      'Recoloque a service account do projeto checar-d8205 no Azure.';
  } else if (tokenExpired) {
    detalhe = 'Token expirado. Saia e entre novamente.';
  } else if (err.message?.includes('fetch') || err.message?.includes('certificate')) {
    detalhe =
      'Servidor não alcançou os certificados do Google (rede outbound do Azure). ' +
      'Libere acesso a googleapis.com.';
  } else if (payload && !tokenAud) {
    detalhe = 'Token JWT inválido ou incompleto.';
  }

  console.error('[Auth] verifyIdToken falhou:', {
    codigo: err.code,
    message: err.message,
    tokenAud,
    serverProjectId,
    tokenExpired,
  });

  return {
    erro: 'Falha na autenticação.',
    codigo: err.code || 'unknown',
    ...(detalhe ? { detalhe } : {}),
    ...(tokenAud ? { tokenProjectId: tokenAud } : {}),
    ...(serverProjectId ? { serverProjectId } : {}),
  };
};

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
  if (!token || token === 'undefined' || token === 'null') {
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
    const decoded = await getAuth().verifyIdToken(token);
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
    return res.status(401).json(buildAuthFailureResponse(err, token));
  }
};

export { EXPECTED_PROJECT_ID, decodeJwtPayload, buildAuthFailureResponse };
export default authMiddleware;
