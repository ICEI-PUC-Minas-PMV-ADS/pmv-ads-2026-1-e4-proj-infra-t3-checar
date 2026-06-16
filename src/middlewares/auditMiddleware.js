import AuditLog from '../models/AuditLog.js';

// Map HTTP method → audit action
const METHOD_ACTION = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };

// Derive entity name from the first path segment after /
const deriveEntidade = (path) => {
  const segment = path.replace(/^\/api\//, '/').split('/')[1] || 'unknown';
  return segment.split('?')[0];
};

// Derive entity ID from URL (last segment if looks like an ObjectId)
const deriveEntidadeId = (path) => {
  const parts = path.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  return last && /^[a-f\d]{24}$/i.test(last) ? last : null;
};

const auditMiddleware = (req, res, next) => {
  const acao = METHOD_ACTION[req.method];
  if (!acao) return next(); // GET, OPTIONS, HEAD — não auditados

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    // Only log successful mutations (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const entidade   = deriveEntidade(req.path);
      const entidadeId = deriveEntidadeId(req.path);
      // Prefere o ID autenticado pelo authMiddleware; header só como fallback de dev
      const usuarioId  = req.user?.id || req.headers['x-user-id'] || null;

      // Sanitize body: remove sensitive fields before storing
      let dados = null;
      if (req.body && typeof req.body === 'object') {
        const { senha, password, token, ...rest } = req.body;
        dados = Object.keys(rest).length > 0 ? rest : null;
      }

      AuditLog.create({
        usuarioId,
        acao,
        entidade,
        entidadeId,
        metodo: req.method,
        rota: req.originalUrl,
        statusCode: res.statusCode,
        dados,
      }).catch((err) => console.error('[Auditoria] Erro ao salvar log:', err.message));
    }

    return originalJson(body);
  };

  next();
};

export default auditMiddleware;
