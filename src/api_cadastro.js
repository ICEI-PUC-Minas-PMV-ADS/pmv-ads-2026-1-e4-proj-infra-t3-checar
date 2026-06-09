// ==========================================
// ENTRY POINT — API Checar
// ==========================================
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import reportRoutes from './api_reports.js';
import modeloChecklistRoutes from './api_modelochecklist.js';
import itemChecklistRoutes from './api_itemchecklist.js';
import checklistRoutes from './api_checklist.js';
import usuariosRoutes from './api_usuarios.js';
import inspecoesRoutes from './api_inspecoes.js';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from './controllers/vehicleController.js';
import { validateVehicleCreate } from './middlewares/validateVehicle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Swagger ─────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── /api prefix bridge ───────────────────────────────────────────
// In dev the Vite proxy strips the /api prefix before forwarding to Express.
// In production (single Azure App Service), the browser sends /api/* directly.
// This middleware normalises both cases so route handlers never see /api/.
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) req.url = req.url.slice(4); // /api/vehicles → /vehicles
  next();
});

// ── API routes ───────────────────────────────────────────────────
app.use(reportRoutes);
app.use(modeloChecklistRoutes);
app.use(itemChecklistRoutes);
app.use(checklistRoutes);
app.use(usuariosRoutes);
app.use(inspecoesRoutes);

app.post('/vehicles',     validateVehicleCreate, createVehicle);
app.get('/vehicles',      getAllVehicles);
app.get('/vehicles/:id',  getVehicleById);
app.put('/vehicles/:id',  updateVehicle);
app.delete('/vehicles/:id', deleteVehicle);

// ── Frontend (production) ────────────────────────────────────────
// Serves the Vite build output. In dev, Vite runs on its own port.
const distPath = path.join(__dirname, '..', 'frontend-web', 'dist');
app.use(express.static(distPath));

// SPA fallback — any route the browser navigates to directly must return
// index.html so React Router can handle it on the client side.
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Connect & Listen ─────────────────────────────────────────────
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI não definida. Configure o arquivo .env');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📚 Swagger em http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });
