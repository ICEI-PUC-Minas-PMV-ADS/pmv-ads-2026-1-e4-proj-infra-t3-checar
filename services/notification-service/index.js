import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'notification-service' }));

import Notificacao from '../../src/models/Notificacao.js';

app.get('/notificacoes', async (req, res) => {
  try {
    const { page = 1, limit = 20, usuarioId } = req.query;
    const filter = usuarioId ? { usuarioId } : {};
    const [data, total] = await Promise.all([
      Notificacao.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Notificacao.countDocuments(filter),
    ]);
    res.json({ data, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno', detalhe: err.message });
  }
});

app.patch('/notificacoes/:id/lida', async (req, res) => {
  try {
    await Notificacao.findByIdAndUpdate(req.params.id, { lida: true });
    res.json({ mensagem: 'Marcada como lida' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

app.patch('/notificacoes/lida/todas', async (req, res) => {
  try {
    const { usuarioId } = req.body;
    if (!usuarioId) return res.status(400).json({ erro: 'usuarioId obrigatório' });
    await Notificacao.updateMany({ usuarioId, lida: false }, { lida: true });
    res.json({ mensagem: 'Todas marcadas como lidas' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/checar')
  .then(() => app.listen(process.env.NOTIFICATION_PORT || 3004, () => console.log('notification-service :3004')))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
