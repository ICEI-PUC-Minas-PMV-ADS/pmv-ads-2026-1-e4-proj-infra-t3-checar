#!/usr/bin/env node
/**
 * Popula o MongoDB local com dados de desenvolvimento (veículos e modelos de checklist).
 * Uso: npm run seed:dev
 */
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/checar';

const vehicleSchema = new mongoose.Schema(
  {
    plate: { type: String, required: true, unique: true, trim: true, uppercase: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    mileage: { type: Number, required: true, min: 0 },
    vehicleType: {
      type: String,
      required: true,
      enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'other'],
    },
    operationalStatus: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'maintenance', 'decommissioned'],
    },
    marca: { type: String, trim: true, default: null },
    cor: { type: String, trim: true, default: null },
    observation: { type: String, trim: true, default: null },
  },
  { timestamps: true, versionKey: false }
);

const modeloSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true, default: '' },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
const ModeloChecklist =
  mongoose.models.ModeloChecklist || mongoose.model('ModeloChecklist', modeloSchema);

const SAMPLE_VEHICLES = [
  {
    plate: 'ABC1D23',
    model: 'Fiat Strada',
    year: 2022,
    mileage: 45000,
    vehicleType: 'truck',
    operationalStatus: 'active',
    marca: 'Fiat',
    cor: 'Branco',
    observation: 'Veículo de campo — desenvolvimento',
  },
  {
    plate: 'XYZ9E87',
    model: 'Volkswagen Gol',
    year: 2020,
    mileage: 78000,
    vehicleType: 'car',
    operationalStatus: 'active',
    marca: 'Volkswagen',
    cor: 'Prata',
    observation: null,
  },
  {
    plate: 'QWE4R56',
    model: 'Mercedes-Benz Sprinter',
    year: 2021,
    mileage: 120000,
    vehicleType: 'van',
    operationalStatus: 'maintenance',
    marca: 'Mercedes-Benz',
    cor: 'Azul',
    observation: 'Em revisão programada',
  },
];

const SAMPLE_MODELOS = [
  { nome: 'Checklist Diário', descricao: 'Inspeção rápida antes da saída', ativo: true },
  { nome: 'Checklist Semanal', descricao: 'Verificação completa semanal', ativo: true },
];

const upsertVehicle = async (doc) => {
  const existing = await Vehicle.findOne({ plate: doc.plate });
  if (existing) {
    Object.assign(existing, doc);
    await existing.save();
    return 'atualizado';
  }
  await Vehicle.create(doc);
  return 'criado';
};

const upsertModelo = async (doc) => {
  const existing = await ModeloChecklist.findOne({ nome: doc.nome });
  if (existing) {
    Object.assign(existing, doc);
    await existing.save();
    return 'atualizado';
  }
  await ModeloChecklist.create(doc);
  return 'criado';
};

try {
  await mongoose.connect(mongoUri);
  console.log('[Seed] Conectado:', mongoUri.replace(/\/\/[^@]+@/, '//***@'));

  let vehiclesCreated = 0;
  for (const v of SAMPLE_VEHICLES) {
    const action = await upsertVehicle(v);
    console.log(`[Seed] Veículo ${v.plate}: ${action}`);
    if (action === 'criado') vehiclesCreated += 1;
  }

  let modelosCreated = 0;
  for (const m of SAMPLE_MODELOS) {
    const action = await upsertModelo(m);
    console.log(`[Seed] Modelo "${m.nome}": ${action}`);
    if (action === 'criado') modelosCreated += 1;
  }

  const totalVehicles = await Vehicle.countDocuments();
  const totalModelos = await ModeloChecklist.countDocuments();

  console.log('');
  console.log(`[Seed] Concluído — ${totalVehicles} veículo(s), ${totalModelos} modelo(s) no banco.`);
  console.log('[Seed] Recarregue o app mobile (tecla r no Expo) para ver os dados.');
} catch (err) {
  console.error('[Seed] Erro:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
