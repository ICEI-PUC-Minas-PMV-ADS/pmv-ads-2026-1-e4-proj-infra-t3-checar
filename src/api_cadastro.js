console.log("DEBUG_AZURE_ENV:", process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? "ENCONTRADO" : "NÃO ENCONTRADO");
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
// express-mongo-sanitize reassigns req.query which is getter-only in Express 5 + Node 22.
// This inline version mutates the object in place instead.
app.use((req, _res, next) => {
  const hasForbidden = (key) => /[$\0]/.test(key);
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (hasForbidden(key)) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  sanitize(req.query); // mutates the object returned by the getter — safe in Express 5
  next();
});
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
app.get('/health', (_req, res) => {
  const dbStateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStateMap[mongoose.connection.readyState] ?? 'unknown';
  const isHealthy = mongoose.connection.readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    db: dbState,
    env: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    firebase: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    redis: !!process.env.REDIS_URL,
  });
});

// ═══════════════════════════════════════════════════════════════════
// Autenticação APENAS para rotas /api — frontend fica público
// ═══════════════════════════════════════════════════════════════════

// ── 8. Middleware de autenticação SOMENTE para /api ─────────────
// Dentro de app.use('/api', handler), req.path é relativo ao prefixo:
// /api/login → req.path = '/login', /api/checklists → req.path = '/checklists'
app.use('/api', (req, res, next) => {
  const key = `${req.method} ${req.path}`;

  const PUBLIC_API_PATHS = new Set([
    'POST /login',
    'POST /usuarios',
    'POST /usuariocadastrados',
  ]);

  if (PUBLIC_API_PATHS.has(key)) {
    return next();
  }

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

// ── 15. Error handler global — captura erros não tratados de middlewares async
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Express] Erro não tratado:', err);
  if (res.headersSent) return;
  res.status(err.status ?? 500).json({
    erro: err.message ?? 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ═══════════════════════════════════════════════════════════════════
// 🎯 FRONTEND - Livre e público (SEM autenticação)
// ═══════════════════════════════════════════════════════════════════

// ── 16. Frontend (produção) ───────────────────────────────────────
const distPath = path.join(__dirname, '..', 'frontend-web', 'dist');

// Arquivos estáticos do frontend
app.use(express.static(distPath));

// SPA fallback: rotas não reconhecidas pelo Express servem o React app
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(503).json({ erro: 'Frontend não disponível. Execute npm run build no frontend-web.' });
    }
  });
});

// ── 16. Conexão MongoDB e inicialização ──────────────────────────
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI não definida. Configure o arquivo .env');
  process.exit(1);
}

mongoose.connection.on('disconnected', () =>
  console.warn('[MongoDB] Desconectado — aguardando reconexão automática do driver...')
);
mongoose.connection.on('reconnected', () =>
  console.log('[MongoDB] Reconectado com sucesso.')
);
mongoose.connection.on('error', (err) =>
  console.error('[MongoDB] Erro de conexão:', err.message)
);

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
    // Azure fecha conexões TCP idle em ~4 min; manter pool menor evita SNAT exhaustion
    maxPoolSize: 5,
    minPoolSize: 1,
    // Fecha conexões pool ociosas antes do Azure fazer isso por baixo
    maxIdleTimeMS: 120000,
    family: 4,
    retryWrites: true,
    retryReads: true,
  })
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