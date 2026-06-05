// Carregar variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerSpec from './swagger.js';
import upload from './config/multer.js';
import Vehicle from './models/Vehicle.js';
import Inspecao from './models/Inspecao.js';
import Usuario from './models/Usuario.js';
import reportRoutes from "./api_reports.js";
import modeloChecklistRoutes from "./api_modelochecklist.js";
import itemChecklistRoutes from "./api_itemchecklist.js";
import checklistRoutes from "./api_checklist.js";
import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from './controllers/vehicleController.js';

// ==========================================
// LOG PARA DEBUG DO SWAGGER
// ==========================================
console.log('=== DEBUG SWAGGER ===');
console.log('Rotas documentadas no Swagger:', Object.keys(swaggerSpec.paths || {}));
console.log('Total de rotas:', Object.keys(swaggerSpec.paths || {}).length);
console.log('Swagger Spec válido:', !!swaggerSpec);
console.log('=====================');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(reportRoutes);
app.use(modeloChecklistRoutes);
app.use(itemChecklistRoutes);
app.use(checklistRoutes);

// Rota para ver o JSON do Swagger (debug)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rota de debug do Swagger
app.get('/debug/swagger', (req, res) => {
  res.json({
    rotas_documentadas: Object.keys(swaggerSpec.paths || {}),
    total_rotas: Object.keys(swaggerSpec.paths || {}).length,
    servidor: process.env.NODE_ENV || 'development',
    swagger_valido: !!swaggerSpec,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// CRUD DE USUÁRIOS (CORRIGIDO)
// ==========================================

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastrar um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               tipoUsuario:
 *                 type: string
 *                 enum: [Motorista, Gestor]
 *                 default: Motorista
 *                 example: "Motorista"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     tipoUsuario:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *       400:
 *         description: Erro na validação dos dados
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/usuarios', async (req, res) => {
    try {
        const { nome, email, senha, tipoUsuario } = req.body;

        // Validação de campos obrigatórios
        if (!nome || !email || !senha) {
            return res.status(400).json({ 
                erro: "Campos obrigatórios",
                mensagem: "Nome, email e senha são obrigatórios." 
            });
        }

        // Verificar se email já está cadastrado
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ 
                erro: "Email já cadastrado",
                mensagem: "Este email já está em uso." 
            });
        }

        // Criar novo usuário
        const novoUsuario = new Usuario({
            nome,
            email,
            senha,
            tipoUsuario: tipoUsuario || "Motorista"
        });

        await novoUsuario.save();

        // Remover a senha da resposta
        const usuarioResponse = {
            id: novoUsuario._id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            tipoUsuario: novoUsuario.tipoUsuario,
            createdAt: novoUsuario.createdAt
        };

        res.status(201).json({ 
            mensagem: "Usuário criado com sucesso!",
            usuario: usuarioResponse
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ 
            erro: "Erro ao criar usuário",
            detalhe: error.message 
        });
    }
});

// Rota alternativa para compatibilidade com versões anteriores
app.post('/usuariocadastrados', async (req, res) => {
    console.log('⚠️ Rota /usuariocadastrados está obsoleta. Use POST /usuarios');
    try {
        const { nome, email, senha, tipoUsuario } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ 
                erro: "Campos obrigatórios",
                mensagem: "Nome, email e senha são obrigatórios." 
            });
        }

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ 
                erro: "Email já cadastrado",
                mensagem: "Este email já está em uso." 
            });
        }

        const novoUsuario = new Usuario({
            nome,
            email,
            senha,
            tipoUsuario: tipoUsuario || "Motorista"
        });

        await novoUsuario.save();

        const usuarioResponse = {
            id: novoUsuario._id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            tipoUsuario: novoUsuario.tipoUsuario,
            createdAt: novoUsuario.createdAt
        };

        res.status(201).json({ 
            mensagem: "Usuário criado com sucesso!",
            usuario: usuarioResponse,
            aviso: "Esta rota está obsoleta. Use POST /usuarios"
        });

    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao criar usuário",
            detalhe: error.message 
        });
    }
});

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-senha');
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao listar usuários", 
            detalhe: error.message 
        });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
app.get('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ erro: "ID inválido" });
        }

        const usuario = await Usuario.findById(id).select('-senha');
        
        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao buscar usuário", 
            detalhe: error.message 
        });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualizar um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               tipoUsuario:
 *                 type: string
 *                 enum: [Motorista, Gestor]
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, tipoUsuario, senha } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ erro: "ID inválido" });
        }

        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        // Verificar se o novo email já existe (se estiver mudando)
        if (email && email !== usuario.email) {
            const emailExistente = await Usuario.findOne({ email });
            if (emailExistente) {
                return res.status(400).json({ 
                    erro: "Email já cadastrado",
                    mensagem: "Este email já está em uso por outro usuário." 
                });
            }
        }

        // Atualizar campos
        if (nome) usuario.nome = nome;
        if (email) usuario.email = email;
        if (tipoUsuario) usuario.tipoUsuario = tipoUsuario;
        if (senha) usuario.senha = senha;

        await usuario.save();

        const usuarioResponse = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
            updatedAt: usuario.updatedAt
        };

        res.status(200).json({
            mensagem: "Usuário atualizado com sucesso!",
            usuario: usuarioResponse
        });

    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao atualizar usuário", 
            detalhe: error.message 
        });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Deletar um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ erro: "ID inválido" });
        }

        const usuario = await Usuario.findByIdAndDelete(id);

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json({
            mensagem: "Usuário deletado com sucesso!",
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (error) {
        res.status(500).json({ 
            erro: "Erro ao deletar usuário", 
            detalhe: error.message 
        });
    }
});

// ==========================================
// AUTENTICAÇÃO (Login)
// ==========================================

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realizar login do usuário (RF-001)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: E-mail ou senha incorretos
 */
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ 
                erro: "Campos obrigatórios",
                mensagem: "Email e senha são obrigatórios." 
            });
        }

        const usuario = await Usuario.findOne({ email }).select('+senha');

        if (!usuario) {
            return res.status(401).json({ 
                erro: "Credenciais inválidas",
                mensagem: "Email ou senha incorretos." 
            });
        }

        const senhaValida = await usuario.compararSenha(senha);

        if (!senhaValida) {
            return res.status(401).json({ 
                erro: "Credenciais inválidas",
                mensagem: "Email ou senha incorretos." 
            });
        }

        const usuarioResponse = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        };

        res.status(200).json({ 
            mensagem: "Login realizado com sucesso!",
            usuario: usuarioResponse
        });

    } catch (error) {
        res.status(500).json({ 
            erro: "Erro no servidor", 
            detalhe: error.message 
        });
    }
});

// ==========================================
// CRUD DE VEÍCULOS (Gerenciamento)
// ==========================================

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Cadastrar um novo veículo
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       201:
 *         description: Veículo cadastrado com sucesso
 *       400:
 *         description: Erro na validação dos dados
 */
app.post('/vehicles', createVehicle);

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Listar todos os veículos cadastrados
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: Lista de veículos retornada com sucesso
 */
app.get('/vehicles', getAllVehicles);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Buscar veículo por ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Veículo encontrado
 *       404:
 *         description: Veículo não encontrado
 */
app.get('/vehicles/:id', getVehicleById);

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     summary: Atualizar um veículo
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       200:
 *         description: Veículo atualizado com sucesso
 *       404:
 *         description: Veículo não encontrado
 */
app.put('/vehicles/:id', updateVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Remover um veículo do sistema
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Veículo removido com sucesso
 *       404:
 *         description: Veículo não encontrado
 */
app.delete('/vehicles/:id', deleteVehicle);

// ==========================================
// INSPEÇÃO E UPLOAD (Checklist Fotográfico)
// ==========================================

/**
 * @swagger
 * /inspecao/upload:
 *   post:
 *     summary: Realizar inspeção com fotos obrigatórias (RF-005)
 *     tags: [Inspeção]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               placa:
 *                 type: string
 *               frente:
 *                 type: string
 *                 format: binary
 *               traseira:
 *                 type: string
 *                 format: binary
 *               lateralEsquerda:
 *                 type: string
 *                 format: binary
 *               lateralDireita:
 *                 type: string
 *                 format: binary
 *               topo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Inspeção salva com sucesso
 *       400:
 *         description: Checklist incompleto ou placa ausente
 */
app.post('/inspecao/upload', upload.fields([
    { name: 'frente', maxCount: 1 },
    { name: 'traseira', maxCount: 1 },
    { name: 'lateralEsquerda', maxCount: 1 },
    { name: 'lateralDireita', maxCount: 1 },
    { name: 'topo', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log("--- Nova tentativa de Upload Estruturado ---");
        const { placa } = req.body;

        if (!placa || placa.trim() === '') {
            return res.status(400).json({ 
                erro: "Placa obrigatória",
                mensagem: "A placa do veículo é obrigatória para iniciar a inspeção." 
            });
        }

        if (!req.files) {
            return res.status(400).json({ 
                erro: "Fotos obrigatórias",
                mensagem: "Todas as 5 fotos do veículo são obrigatórias." 
            });
        }

        const fotosPaths = {
            frente: req.files['frente']?.[0]?.path,
            traseira: req.files['traseira']?.[0]?.path,
            lateralEsquerda: req.files['lateralEsquerda']?.[0]?.path,
            lateralDireita: req.files['lateralDireita']?.[0]?.path,
            topo: req.files['topo']?.[0]?.path
        };

        const missingPhotos = Object.entries(fotosPaths)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingPhotos.length > 0) {
            return res.status(400).json({
                erro: "Checklist Incompleto",
                mensagem: "Você esqueceu de tirar alguma das fotos obrigatórias.",
                campos_pendentes: missingPhotos
            });
        }

        const novaInspecao = new Inspecao({
            placa: placa.toUpperCase(),
            fotos: fotosPaths,
            dataInspecao: new Date()
        });

        await novaInspecao.save();
        
        console.log("Sucesso: Inspeção salva com todas as fotos!");
        res.status(201).json({
            mensagem: "Inspeção realizada com sucesso!",
            dados: novaInspecao
        });

    } catch (error) {
        console.error("ERRO NO BACKEND:", error.message);
        res.status(500).json({ erro: "Erro interno no servidor.", detalhe: error.message });
    }
});

/**
 * @swagger
 * /inspecoes/historico/{placa}:
 *   get:
 *     summary: Buscar histórico de inspeções por placa (RF-011)
 *     tags: [Inspeção]
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Histórico de inspeções encontrado
 *       404:
 *         description: Nenhuma inspeção para esta placa
 */
app.get('/inspecoes/historico/:placa', async (req, res) => {
    try {
        const { placa } = req.params;
        
        if (!placa || placa.trim() === '') {
            return res.status(400).json({ erro: "Placa obrigatória" });
        }

        const historico = await Inspecao.find({ 
            placa: placa.toUpperCase() 
        }).sort({ createdAt: -1 });

        if (historico.length === 0) {
            return res.status(404).json({ 
                mensagem: `Nenhuma inspeção encontrada para a placa ${placa.toUpperCase()}.` 
            });
        }

        res.status(200).json(historico);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar histórico.", detalhe: error.message });
    }
});

/**
 * @swagger
 * /inspecoes:
 *   get:
 *     summary: Listar todas as inspeções
 *     tags: [Inspeção]
 *     responses:
 *       200:
 *         description: Lista de inspeções retornada com sucesso
 */
app.get('/inspecoes', async (req, res) => {
    try {
        const inspecoes = await Inspecao.find().sort({ createdAt: -1 });
        res.json(inspecoes);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar inspeções", detalhe: error.message });
    }
});

/**
 * @swagger
 * /inspecoes/{id}:
 *   delete:
 *     summary: Deletar uma inspeção por ID
 *     tags: [Inspeção]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inspeção deletada com sucesso
 *       404:
 *         description: Inspeção não encontrada
 */
app.delete('/inspecoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ erro: "ID inválido" });
        }
        
        const inspecaoDeletada = await Inspecao.findByIdAndDelete(id);
        
        if (!inspecaoDeletada) {
            return res.status(404).json({ mensagem: "Inspeção não encontrada" });
        }
        
        res.status(200).json({ 
            mensagem: "Inspeção deletada com sucesso",
            inspecao: inspecaoDeletada
        });
        
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar inspeção", detalhe: error.message });
    }
});

/**
 * @swagger
 * /inspecoes/placa/{placa}:
 *   delete:
 *     summary: Deletar todas as inspeções de uma placa
 *     tags: [Inspeção]
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inspeções deletadas com sucesso
 *       404:
 *         description: Nenhuma inspeção encontrada
 */
app.delete('/inspecoes/placa/:placa', async (req, res) => {
    try {
        const { placa } = req.params;
        
        const resultado = await Inspecao.deleteMany({ 
            placa: placa.toUpperCase() 
        });
        
        if (resultado.deletedCount === 0) {
            return res.status(404).json({ 
                mensagem: `Nenhuma inspeção encontrada para a placa ${placa.toUpperCase()}` 
            });
        }
        
        res.status(200).json({ 
            mensagem: `${resultado.deletedCount} inspeção(ões) deletada(s) com sucesso`,
            totalDeletado: resultado.deletedCount
        });
        
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar inspeções", detalhe: error.message });
    }
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({ 
        mensagem: "API de Inspeção Veicular",
        versao: "2.0.0",
        endpoints: {
            documentacao: `http://localhost:${PORT}/api-docs`,
            usuarios: {
                criar: "POST /usuarios",
                listar: "GET /usuarios",
                buscar: "GET /usuarios/:id",
                atualizar: "PUT /usuarios/:id",
                deletar: "DELETE /usuarios/:id",
                login: "POST /login"
            },
            veiculos: {
                cadastrar: "POST /vehicles",
                listar: "GET /vehicles",
                buscar: "GET /vehicles/:id",
                atualizar: "PUT /vehicles/:id",
                deletar: "DELETE /vehicles/:id"
            },
            inspecoes: {
                upload: "POST /inspecao/upload",
                historico: "GET /inspecoes/historico/:placa",
                todas: "GET /inspecoes",
                deletar: "DELETE /inspecoes/:id",
                deletarPorPlaca: "DELETE /inspecoes/placa/:placa"
            }
        }
    });
});

// Conectar ao MongoDB e iniciar servidor
console.log("MONGO_URI:", !!process.env.MONGO_URI);
console.log("MONGODB_URI:", !!process.env.MONGODB_URI);

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log("URI encontrada:", !!mongoUri);

mongoose.connect(mongoUri)
    .then(() => {
        console.log('✅ Conectado ao MongoDB Atlas com sucesso!');
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
            console.log(`\nRotas de usuários disponíveis:`);
            console.log(`   POST   /usuarios          - Criar novo usuário (recomendado)`);
            console.log(`   POST   /usuariocadastrados - Rota obsoleta (compatibilidade)`);
            console.log(`   GET    /usuarios          - Listar todos usuários`);
            console.log(`   GET    /usuarios/:id      - Buscar usuário por ID`);
            console.log(`   PUT    /usuarios/:id      - Atualizar usuário`);
            console.log(`   DELETE /usuarios/:id      - Deletar usuário`);
            console.log(`   POST   /login             - Fazer login\n`);
        });
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MongoDB:', err.message);
        process.exit(1);
    });
