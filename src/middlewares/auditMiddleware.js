import AuditLog from '../models/AuditLog.js';

const METHOD_ACTION = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };

const deriveEntidade = (path) => {
  const segment = path.replace(/^\/api\//, '/').split('/')[1] || 'unknown';
  return segment.split('?')[0];
};

const deriveEntidadeId = (path) => {
  const parts = path.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  return last && /^[a-f\d]{24}$/i.test(last) ? last : null;
};

const auditMiddleware = (req, res, next) => {
  const acao = METHOD_ACTION[req.method];
  if (!acao) return next();

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    // Auditamos apenas se o request foi bem-sucedido
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const entidade = deriveEntidade(req.path);
        const entidadeId = deriveEntidadeId(req.path);
        // Proteção: Verifique se req.user existe antes de acessar .id
        const usuarioId = req.user?.id || req.headers['x-user-id'] || null;

        let dados = null;
        if (req.body && typeof req.body === 'object') {
          const { senha, password, token, ...rest } = req.body;
          dados = Object.keys(rest).length > 0 ? rest : null;
        }

        // Criamos o log sem travar o response principal
        AuditLog.create({
          usuarioId,
          acao,
          entidade,
          entidadeId,
          metodo: req.method,
          rota: req.originalUrl,
          statusCode: res.statusCode,
          dados,
        }).catch((err) => console.error('[Auditoria] Erro crítico no AuditLog.create:', err.message));
      } catch (logErr) {
        console.error('[Auditoria] Erro interno:', logErr.message);
      }
    }

    return originalJson(body);
  };

  next();
};

export default auditMiddleware;