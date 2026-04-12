import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

// Importação dos seus modelos e controllers existentes
import Usuario from "./usuariocadastrados.js";
import itemChecklistRoutes from "./api_itemchecklist.js";
import modeloChecklistRoutes from "./api_modelochecklist.js";
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "./controllers/vehicleController.js";
import { validateVehicleCreate } from "./middlewares/validateVehicle.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());

// --- CONFIGURAÇÃO DO SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- ROTA RAIZ ---
app.get("/", (req, res) => {
  res.send("API Checar OK 🚀. Acesse a documentação em /api-docs");
});

// --- ROTAS DE VEÍCULOS (Diretas no arquivo como você usa) ---
app.get("/vehicles", getAllVehicles);
app.get("/vehicles/:id", getVehicleById);
app.post("/vehicles", validateVehicleCreate, createVehicle);
app.put("/vehicles/:id", validateVehicleCreate, updateVehicle);
app.delete("/vehicles/:id", deleteVehicle);

// --- ROTAS IMPORTADAS ---
app.use(itemChecklistRoutes);
app.use(modeloChecklistRoutes);

// --- ROTAS DE USUÁRIOS ---
app.post("/usuariocadastrados", async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;
    if (!nome || !email || !senha || !tipoUsuario) {
      return res.status(400).json({ mensagem: "Preencha todos os campos" });
    }
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ mensagem: "Email já cadastrado" });
    }
    const novoUsuario = await Usuario.create(req.body);
    res.status(201).json({
      id: novoUsuario._id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      tipoUsuario: novoUsuario.tipoUsuario
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.get("/usuariocadastrados/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensagem: "ID inválido" });
    }
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado" });
    res.status(200).json({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// --- INICIALIZAÇÃO DO BANCO E SERVIDOR ---
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado ao MongoDB Atlas ✅");

    app.listen(PORT, () => {
      console.log(`\n==============================================`);
      console.log(`Servidor rodando na porta ${PORT} 🚀`);
      console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
      console.log(`==============================================\n`);
    });

  } catch (error) {
    console.error("Erro ao conectar no Mongo ❌", error.message);
    process.exit(1);
  }
};

startServer();