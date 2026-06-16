import express from 'express';
import Notificacao from './models/Notificacao.js';
import FcmToken from './models/FcmToken.js';

const router = express.Router();

// ── FCM Token ─────────────────────────────────────────────────────

// POST /fcm-tokens — registra ou atualiza token FCM do dispositivo
// usuarioId vem de req.user (autenticado), nunca do body (evita IDOR)
router.post('/fcm-tokens', async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const { token, plataforma } = req.body;
    if (!token) {
      return res.status(400).json({ erro: 'token é obrigatório' });
    }

    await FcmToken.findOneAndUpdate(
      { token },
      { usuarioId, token, plataforma: plataforma || 'android' },
      { upsert: true, new: true }
    );

    return res.status(200).json({ mensagem: 'Token registrado com sucesso' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao registrar token', detalhe: err.message });
  }
});

// DELETE /fcm-tokens/:token — remove token ao fazer logout
router.delete('/fcm-tokens/:token', async (req, res) => {
  try {
    await FcmToken.deleteOne({ token: req.params.token });
    return res.status(200).json({ mensagem: 'Token removido' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao remover token', detalhe: err.message });
  }
});

// ── Notificações ──────────────────────────────────────────────────

// GET /notificacoes?lida=false&page=1&limit=20
// Filtrado automaticamente pelo usuário autenticado (evita IDOR)
router.get('/notificacoes', async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const { lida } = req.query;
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(50,  Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;

    const filtro = { usuarioId };
    if (lida !== undefined) filtro.lida = lida === 'true';

    const [notificacoes, total] = await Promise.all([
      Notificacao.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notificacao.countDocuments(filtro),
    ]);

    return res.status(200).json({
      data: notificacoes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar notificações', detalhe: err.message });
  }
});

// PATCH /notificacoes/:id/lida — marca como lida
router.patch('/notificacoes/:id/lida', async (req, res) => {
  try {
    const notificacao = await Notificacao.findByIdAndUpdate(
      req.params.id,
      { lida: true },
      { new: true }
    );
    if (!notificacao) {
      return res.status(404).json({ erro: 'Notificação não encontrada' });
    }
    return res.status(200).json(notificacao);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao atualizar notificação', detalhe: err.message });
  }
});

// PATCH /notificacoes/lida/todas — marca todas do usuário autenticado como lidas
// usuarioId vem de req.user, nunca do body (evita IDOR)
router.patch('/notificacoes/lida/todas', async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    await Notificacao.updateMany({ usuarioId, lida: false }, { lida: true });
    return res.status(200).json({ mensagem: 'Todas as notificações marcadas como lidas' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao atualizar notificações', detalhe: err.message });
  }
});

export default router;
