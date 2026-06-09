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
import upload from './config/multer.js';
import Vehicle from './models/Vehicle.js';
import Inspecao from './models/Inspecao.js';
import Usuario from './models/Usuario.js';
import reportRoutes from './api_reports.js';
import modeloChecklistRoutes from './api_modelochecklist.js';
import itemChecklistRoutes from './api_itemchecklist.js';
import checklistRoutes from './api_checklist.js';
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

// Serve uploaded files with absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Swagger ─────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Sub-routers ──────────────────────────────────────────────────
app.use(reportRoutes);
app.use(modeloChecklistRoutes);
app.use(itemChecklistRoutes);
app.use(checklistRoutes);

// ============================================================
// USERS
// ============================================================

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Campos obrigatórios',
        mensagem: 'Nome, email e senha são obrigatórios.',
      });
    }

    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({
        erro: 'Email já cadastrado',
        mensagem: 'Este email já está em uso.',
      });
    }

    // Normalize tipoUsuario — accept both cases
    const tipoNormalizado = tipoUsuario
      ? tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1).toLowerCase()
      : 'Motorista';

    const novoUsuario = new Usuario({
      nome,
      email,
      senha,
      tipoUsuario: tipoNormalizado,
    });

    await novoUsuario.save();

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso!',
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipoUsuario: novoUsuario.tipoUsuario,
        createdAt: novoUsuario.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar usuário', detalhe: error.message });
  }
});

// Legacy route — kept for compatibility
app.post('/usuariocadastrados', async (req, res) => {
  // Delegate to /usuarios handler
  req.url = '/usuarios';
  app.handle(req, res);
});

app.get('/usuarios', async (_req, res) => {
  try {
    const usuarios = await Usuario.find().select('-senha');
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar usuários', detalhe: error.message });
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const usuario = await Usuario.findById(id).select('-senha');
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar usuário', detalhe: error.message });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, tipoUsuario, senha } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const usuario = await Usuario.findById(id).select('+senha');
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    if (email && email !== usuario.email) {
      const emailExistente = await Usuario.findOne({ email: email.toLowerCase() });
      if (emailExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }
    }

    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (tipoUsuario) {
      usuario.tipoUsuario =
        tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1).toLowerCase();
    }
    // Setting senha directly triggers the pre-save hook that re-hashes it
    if (senha) usuario.senha = senha;

    await usuario.save();

    res.status(200).json({
      mensagem: 'Usuário atualizado com sucesso!',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        updatedAt: usuario.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhe: error.message });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar usuário', detalhe: error.message });
  }
});

// ============================================================
// AUTH — Login
// ============================================================

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Campos obrigatórios',
        mensagem: 'Email e senha são obrigatórios.',
      });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+senha');
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas', mensagem: 'Email ou senha incorretos.' });
    }

    const senhaValida = await usuario.compararSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas', mensagem: 'Email ou senha incorretos.' });
    }

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro no servidor', detalhe: error.message });
  }
});

// ============================================================
// VEHICLES
// ============================================================

app.post('/vehicles', validateVehicleCreate, createVehicle);
app.get('/vehicles', getAllVehicles);
app.get('/vehicles/:id', getVehicleById);
app.put('/vehicles/:id', updateVehicle);
app.delete('/vehicles/:id', deleteVehicle);

// ============================================================
// INSPEÇÕES — ORDER MATTERS: specific routes before generic /:id
// ============================================================

app.post(
  '/inspecao/upload',
  upload.fields([
    { name: 'frente',          maxCount: 1 },
    { name: 'traseira',        maxCount: 1 },
    { name: 'lateralEsquerda', maxCount: 1 },
    { name: 'lateralDireita',  maxCount: 1 },
    { name: 'topo',            maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { placa } = req.body;

      if (!placa || placa.trim() === '') {
        return res.status(400).json({ erro: 'Placa obrigatória' });
      }

      if (!req.files) {
        return res.status(400).json({ erro: 'Fotos obrigatórias' });
      }

      const fotosPaths = {
        frente:          req.files['frente']?.[0]?.path,
        traseira:        req.files['traseira']?.[0]?.path,
        lateralEsquerda: req.files['lateralEsquerda']?.[0]?.path,
        lateralDireita:  req.files['lateralDireita']?.[0]?.path,
        topo:            req.files['topo']?.[0]?.path,
      };

      const missingPhotos = Object.entries(fotosPaths)
        .filter(([, v]) => !v)
        .map(([k]) => k);

      if (missingPhotos.length > 0) {
        return res.status(400).json({
          erro: 'Checklist Incompleto',
          mensagem: 'Você esqueceu de tirar alguma das fotos obrigatórias.',
          campos_pendentes: missingPhotos,
        });
      }

      const novaInspecao = new Inspecao({
        placa: placa.toUpperCase(),
        fotos: fotosPaths,
        dataInspecao: new Date(),
      });

      await novaInspecao.save();

      res.status(201).json({
        mensagem: 'Inspeção realizada com sucesso!',
        dados: novaInspecao,
      });
    } catch (error) {
      res.status(500).json({ erro: 'Erro interno no servidor.', detalhe: error.message });
    }
  }
);

app.get('/inspecoes', async (_req, res) => {
  try {
    const inspecoes = await Inspecao.find().sort({ createdAt: -1 });
    res.json(inspecoes);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar inspeções', detalhe: error.message });
  }
});

app.get('/inspecoes/historico/:placa', async (req, res) => {
  try {
    const { placa } = req.params;
    if (!placa || placa.trim() === '') {
      return res.status(400).json({ erro: 'Placa obrigatória' });
    }

    const historico = await Inspecao.find({
      placa: placa.toUpperCase(),
    }).sort({ createdAt: -1 });

    if (historico.length === 0) {
      return res
        .status(404)
        .json({ mensagem: `Nenhuma inspeção encontrada para a placa ${placa.toUpperCase()}.` });
    }

    res.status(200).json(historico);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar histórico.', detalhe: error.message });
  }
});

// FIXED: /inspecoes/placa/:placa MUST come before /inspecoes/:id
app.delete('/inspecoes/placa/:placa', async (req, res) => {
  try {
    const { placa } = req.params;
    const resultado = await Inspecao.deleteMany({ placa: placa.toUpperCase() });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({
        mensagem: `Nenhuma inspeção encontrada para a placa ${placa.toUpperCase()}`,
      });
    }

    res.status(200).json({
      mensagem: `${resultado.deletedCount} inspeção(ões) deletada(s) com sucesso`,
      totalDeletado: resultado.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar inspeções', detalhe: error.message });
  }
});

app.delete('/inspecoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const inspecaoDeletada = await Inspecao.findByIdAndDelete(id);
    if (!inspecaoDeletada) {
      return res.status(404).json({ mensagem: 'Inspeção não encontrada' });
    }
    res.status(200).json({ mensagem: 'Inspeção deletada com sucesso', inspecao: inspecaoDeletada });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar inspeção', detalhe: error.message });
  }
});

// ── Health check / root ──────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    mensagem: 'API de Inspeção Veicular — Checar v2.1',
    docs: `/api-docs`,
  });
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
