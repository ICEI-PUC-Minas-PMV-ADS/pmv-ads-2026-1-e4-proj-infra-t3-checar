import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'vehicle-service' }));

// Proxy-delegate para a API principal via http
// Em arquitetura de microserviços real, teria seu próprio model
// Aqui usamos o model compartilhado do monolito
import Vehicle from '../../src/models/Vehicle.js';

app.get('/vehicles', async (req, res) => {
  try {
    const { page = 1, limit = 10, placa, modelo } = req.query;
    const filter = {};
    if (placa) filter.plate = new RegExp(placa, 'i');
    if (modelo) filter.model = new RegExp(modelo, 'i');
    const [data, total] = await Promise.all([
      Vehicle.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
      Vehicle.countDocuments(filter),
    ]);
    res.json({ status: 'success', data, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno', detalhe: err.message });
  }
});

app.post('/vehicles', async (req, res) => {
  try {
    const { plate, model, year, marca, cor } = req.body;
    if (!plate || !model || !year) return res.status(400).json({ erro: 'plate, model e year são obrigatórios' });
    const vehicle = new Vehicle({ plate: plate.toUpperCase(), model, year: Number(year), marca, cor });
    await vehicle.save();
    res.status(201).json({ status: 'success', data: vehicle });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: 'Placa já cadastrada' });
    res.status(500).json({ erro: 'Erro interno', detalhe: err.message });
  }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/checar')
  .then(() => app.listen(process.env.VEHICLE_PORT || 3002, () => console.log('vehicle-service :3002')))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
