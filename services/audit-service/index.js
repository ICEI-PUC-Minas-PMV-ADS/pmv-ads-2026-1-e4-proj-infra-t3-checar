import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'audit-service' }));

import AuditLog from '../../src/models/AuditLog.js';

app.get('/audit', async (req, res) => {
  try {
    const { page = 1, limit = 50, usuarioId, metodo } = req.query;
    const filter = {};
    if (usuarioId) filter.usuarioId = usuarioId;
    if (metodo) filter.metodo = metodo.toUpperCase();
    const [data, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ data, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/checar')
  .then(() => app.listen(process.env.AUDIT_PORT || 3005, () => console.log('audit-service :3005')))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
