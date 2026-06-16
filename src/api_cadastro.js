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
// contentSecurityPolicy desativado para não quebrar Swagger UI e o SPA React
app.use(helmet({
  contentSecurityPolicy: false,
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

// ── 8. Normalização do prefixo /api ─────────────────────────────
// Dev: Vite proxy retira /api. Prod: browser envia /api/* direto.
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) req.url = req.url.slice(4);
  next();
});

// ── 9. Autenticação global com bypass de rotas públicas ──────────
// Caminhos que NÃO exigem token Firebase:
//   - POST /login, POST /usuarios, POST /usuariocadastrados (registro)
//   - Documentação Swagger
//   - Arquivos de upload
//   - Health check
const PUBLIC_PATHS = new Set([
  'POST /login',
  'POST /usuarios',
  'POST /usuariocadastrados',
]);

app.use((req, res, next) => {
  const key = `${req.method} ${req.path}`;
  if (
    PUBLIC_PATHS.has(key)             ||
    req.path.startsWith('/api-docs')  ||
    req.path.startsWith('/uploads')   ||
    req.path === '/health'
  ) return next();

  return authMiddleware(req, res, next);
});

// ── 10. Rotas — usuários ─────────────────────────────────────────
// O router gerencia internamente:
//   - Rate limiting em /login e registro
//   - authorize('Gestor') em operações de gestão
app.use(usuariosRoutes);

// ── 11. Rotas — todos os perfis autenticados ─────────────────────
app.use(checklistRoutes);
app.use(itemChecklistRoutes);
app.use(inspecoesRoutes);
app.use(notificacoesRoutes);

// Modelos de checklist:
//   GET (leitura) → qualquer usuário autenticado
//   POST/PUT/DELETE → somente Gestor (gerenciado internamente no router)
app.use(modeloChecklistRoutes);

// ── 12. Veículos ─────────────────────────────────────────────────
// Leitura: qualquer usuário autenticado
app.get('/vehicles',     getAllVehicles);
app.get('/vehicles/:id', getVehicleById);

// Escrita: somente Gestor (1.2 — RBAC)
app.post('/vehicles',       authorize('Gestor'), validateVehicleCreate, createVehicle);
app.put('/vehicles/:id',    authorize('Gestor'), updateVehicle);
app.delete('/vehicles/:id', authorize('Gestor'), deleteVehicle);

// ── 13. Relatórios e auditoria — somente Gestor ──────────────────
app.use(authorize('Gestor'), reportRoutes);
app.use(authorize('Gestor'), auditoriaRoutes);

// ── 14. Frontend (produção) ───────────────────────────────────────
const distPath = path.join(__dirname, '..', 'frontend-web', 'dist');
app.use(express.static(distPath));

// SPA fallback: qualquer rota desconhecida devolve index.html
// para que o React Router trate no lado do cliente
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── 15. Conexão MongoDB e inicialização ──────────────────────────
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
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });
