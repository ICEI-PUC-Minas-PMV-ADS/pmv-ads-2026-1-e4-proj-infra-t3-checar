import express from 'express';
import AuditLog from './models/AuditLog.js';

const router = express.Router();

// GET /auditoria?entidade=checklists&usuarioId=xxx&page=1&limit=50
router.get('/auditoria', async (req, res) => {
  try {
    const { entidade, usuarioId, acao } = req.query;
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const skip  = (page - 1) * limit;

    const filtro = {};
    if (entidade)  filtro.entidade  = entidade;
    if (usuarioId) filtro.usuarioId = usuarioId;
    if (acao)      filtro.acao      = acao.toUpperCase();

    const [logs, total] = await Promise.all([
      AuditLog.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filtro),
    ]);

    return res.status(200).json({ data: logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[GET /auditoria]', err.name, err.message, err.stack);
    return res.status(500).json({ erro: 'Erro ao consultar auditoria.' });
  }
});

export default router;
