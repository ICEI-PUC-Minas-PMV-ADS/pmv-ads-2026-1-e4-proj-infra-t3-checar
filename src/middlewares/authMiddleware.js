import { admin, initFirebase } from '../config/firebase.js';
import Usuario from '../models/Usuario.js';


/**
 * Verifica o Firebase ID Token enviado no header Authorization: Bearer <token>.
 * Após verificação bem-sucedida, popula req.user com os dados do usuário.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação obrigatório.' });
  }

  const token = authHeader.slice(7);

  if (!initFirebase()) {
    return res.status(503).json({ erro: 'Serviço de autenticação indisponível.' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const usuario = await Usuario
      .findOne({ email: decoded.email })
      .select('_id tipoUsuario nome email')
      .lean();

    if (!usuario) {
      return res.status(401).json({
        erro: 'Usuário não encontrado.',
        mensagem: 'Autenticado no Firebase mas sem cadastro local. Faça o cadastro primeiro.',
      });
    }

    req.user = {
      uid:         decoded.uid,
      email:       decoded.email,
      id:          usuario._id.toString(),
      nome:        usuario.nome,
      tipoUsuario: usuario.tipoUsuario,
    };

    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ erro: 'Token expirado. Faça login novamente.' });
    }
    if (
      err.code === 'auth/argument-error'   ||
      err.code === 'auth/invalid-credential' ||
      err.code?.startsWith('auth/invalid')
    ) {
      return res.status(401).json({ erro: 'Token inválido.' });
    }
    console.error('[Auth] Erro ao verificar token:', err.message);
    return res.status(401).json({ erro: 'Falha na autenticação.' });
  }
};

export default authMiddleware;
