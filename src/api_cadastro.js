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
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { initNotificationQueue } from './queues/notificationQueue.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import reportRoutes from './api_reports.js';
import modeloChecklistRoutes from './api_modelochecklist.js';
import itemChecklistRoutes from './api_itemchecklist.js';
import checklistRoutes from './api_checklist.js';
import usuariosRoutes from './api_usuarios.js';
import inspecoesRoutes from './api_inspecoes.js';
import notificacoesRoutes from './api_notificacoes.js';
import auditoriaRoutes from './api_auditoria.js';
import lgpdRoutes from './api_lgpd.js';
import auditMiddleware from './middlewares/auditMiddleware.js';
import authMiddleware from './middlewares/authMiddleware.js';
import authorize from './middlewares/roleMiddleware.js';
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

// ── 1. Security headers — RNF-004 / HSTS ────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: isProduction,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// ── 2. CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
}));

// ── 3. Body parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(hpp());

// ── 4. Audit middleware (global) ─────────────────────────────────
app.use(auditMiddleware);

// ── 5. Arquivos estáticos — uploads ──────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 6. Swagger ───────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── 7. Health check (público) ────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ═══════════════════════════════════════════════════════════════════
// 🔥 CORREÇÃO: Autenticação APENAS para rotas /api
// ═══════════════════════════════════════════════════════════════════

// ── 8. Normalização do prefixo /api ─────────────────────────────
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) {
    req.url = req.url.slice(4);
  }
  next();
});

// ── 9. Middleware de autenticação SOMENTE para /api ─────────────
// ✅ Frontend (/, /favicon.ico, etc) fica LIVRE
// ✅ API (/api/*) é protegida
app.use('/api', (req, res, next) => {
  const key = `${req.method} ${req.path}`;
  
  // Rotas públicas da API (sem autenticação)
  const PUBLIC_API_PATHS = new Set([
    'POST /login',
    'POST /usuarios',
    'POST /usuariocadastrados',
  ]);
  
  // Swagger e uploads também são públicos
  if (
    PUBLIC_API_PATHS.has(key) ||
    req.path.startsWith('/api-docs') ||
    req.path.startsWith('/uploads')
  ) {
    return next();
  }
  
  // Qualquer outra rota /api exige autenticação
  return authMiddleware(req, res, next);
});

// ── 10. Rotas — usuários (autenticadas via middleware /api) ─────
app.use('/api', usuariosRoutes);

// ── 11. Rotas — todos os perfis autenticados ─────────────────────
app.use('/api', checklistRoutes);
app.use('/api', itemChecklistRoutes);
app.use('/api', inspecoesRoutes);
app.use('/api', notificacoesRoutes);
app.use('/api', modeloChecklistRoutes);

// ── 12. Veículos ─────────────────────────────────────────────────
app.get('/api/vehicles', getAllVehicles);
app.get('/api/vehicles/:id', getVehicleById);
app.post('/api/vehicles', authorize('Gestor'), validateVehicleCreate, createVehicle);
app.put('/api/vehicles/:id', authorize('Gestor'), updateVehicle);
app.delete('/api/vehicles/:id', authorize('Gestor'), deleteVehicle);

// ── 13. Relatórios e auditoria — somente Gestor ──────────────────
app.use('/api', authorize('Gestor'), reportRoutes);
app.use('/api', authorize('Gestor'), auditoriaRoutes);

// ── 14. LGPD — rotas autenticadas ────────────────────────────────
app.use('/api', lgpdRoutes);

// ═══════════════════════════════════════════════════════════════════
// 🎯 FRONTEND - Livre e público (SEM autenticação)
// ═══════════════════════════════════════════════════════════════════

// ── 15. Frontend (produção) ───────────────────────────────────────
const distPath = path.join(__dirname, '..', 'frontend-web', 'dist');

// Arquivos estáticos do frontend
app.use(express.static(distPath));

// SPA fallback: QUALQUER rota não reconhecida volta index.html
// ⚠️ Isso inclui / e /favicon.ico (que agora funcionam!)
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── 16. Conexão MongoDB e inicialização ──────────────────────────
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI não definida. Configure o arquivo .env');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
    initNotificationQueue();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📚 Swagger em http://localhost:${PORT}/api-docs`);
      console.log(`🌐 Frontend em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });