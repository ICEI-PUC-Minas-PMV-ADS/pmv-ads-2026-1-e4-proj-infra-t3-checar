import express from 'express';
import mongoose from 'mongoose';
import Usuario from './models/Usuario.js';
import Checklist from './checklist.js';
import Inspecao from './models/Inspecao.js';
import Notificacao from './models/Notificacao.js';
import FcmToken from './models/FcmToken.js';

const router = express.Router();
router.use(express.json());

// GET /meus-dados — direito de acesso LGPD (Art. 18 LGPD)
router.get('/meus-dados', async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const [usuario, checklists, inspecoes, notificacoes] = await Promise.all([
      Usuario.findById(usuarioId).select('-senha').lean(),
      Checklist.find({ usuarioId }).lean(),
      Inspecao.find({ }).lean(), // inspeções não têm usuarioId direto
      Notificacao.find({ usuarioId }).lean(),
    ]);

    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    res.status(200).json({
      usuario,
      checklists,
      notificacoes,
      totalInspecoes: inspecoes.length,
      exportadoEm: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao exportar dados', detalhe: error.message });
  }
});

// DELETE /me — direito ao esquecimento LGPD (Art. 18 LGPD)
// Anonimiza dados pessoais em vez de deletar para preservar integridade referencial
router.delete('/me', async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const ts = Date.now();
    // Anonimiza o usuário
    await Usuario.findByIdAndUpdate(usuarioId, {
      nome: `[removido-${ts}]`,
      email: `removido-${ts}@anonimizado.local`,
      aceitouTermos: false,
      dataAceiteTermos: null,
    });

    // Remove tokens FCM (dados de dispositivo)
    await FcmToken.deleteMany({ usuarioId: String(usuarioId) });

    // Remove notificações
    await Notificacao.deleteMany({ usuarioId });

    res.status(200).json({ mensagem: 'Dados pessoais removidos conforme LGPD' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover dados', detalhe: error.message });
  }
});

// POST /aceitar-termos — registra consentimento
router.post('/aceitar-termos', async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: 'Não autenticado' });

    const { versaoTermos = '1.0' } = req.body;
    await Usuario.findByIdAndUpdate(usuarioId, {
      aceitouTermos: true,
      dataAceiteTermos: new Date(),
      versaoTermos,
    });

    res.status(200).json({ mensagem: 'Consentimento registrado' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar consentimento', detalhe: error.message });
  }
});

export default router;
