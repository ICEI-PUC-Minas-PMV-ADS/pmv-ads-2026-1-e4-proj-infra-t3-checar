import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'checklist-service' }));

// Importa lógica de modelos de checklist
import Checklist from '../../src/checklist.js';

app.get('/modelochecklists', async (req, res) => {
  try {
    const { ativo } = req.query;
    const filter = ativo !== undefined ? { ativo: ativo === 'true' } : {};
    const modelos = await Checklist.find(filter).sort({ createdAt: -1 });
    res.json(modelos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno', detalhe: err.message });
  }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/checar')
  .then(() => app.listen(process.env.CHECKLIST_PORT || 3003, () => console.log('checklist-service :3003')))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
