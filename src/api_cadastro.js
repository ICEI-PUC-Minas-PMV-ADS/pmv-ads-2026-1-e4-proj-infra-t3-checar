import express from "express";
import mongoose from "mongoose";
import Usuario from "./usuariocadastrados.js";
import dotenv from "dotenv";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
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
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// =========================
// DOCUMENTAÇÃO (SWAGGER)
// =========================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =========================
// ROTAS DE VEÍCULOS
// =========================
app.get("/vehicles", getAllVehicles);
app.get("/vehicles/:id", getVehicleById);
app.post("/vehicles", validateVehicleCreate, createVehicle);
app.put("/vehicles/:id", validateVehicleCreate, updateVehicle);
app.delete("/vehicles/:id", deleteVehicle);

// =========================
// ROTAS DE CHECKLIST
// =========================
app.use(itemChecklistRoutes);
app.use(modeloChecklistRoutes);

// =========================
// ROTA RAIZ
// =========================
app.get("/", (req, res) => {
    res.send("API OK 🚀. Acesse /api-docs para documentação.");
});

// =========================
// CRUD USUÁRIOS (Inline)
// =========================
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
        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }
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

app.put("/usuariocadastrados/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ mensagem: "ID inválido" });
        }
        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!usuarioAtualizado) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }
        res.status(200).json({
            id: usuarioAtualizado._id,
            nome: usuarioAtualizado.nome,
            email: usuarioAtualizado.email,
            tipoUsuario: usuarioAtualizado.tipoUsuario
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

app.delete("/usuariocadastrados/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ mensagem: "ID inválido" });
        }
        const usuarioDeletado = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuarioDeletado) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }
        res.status(200).json({ mensagem: "Usuário deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// =========================
// CONEXÃO BANCO E START
// =========================
const startServer = async () => {
    try {
        // Certifique-se que o nome da variável no .env é exatamente MONGODB_URI
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI não definida no .env");

        await mongoose.connect(uri);
        console.log("✅ MongoDB conectado com sucesso!");

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
            console.log(`📖 Documentação para testes: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error("❌ Erro ao iniciar o servidor:", error.message);
        process.exit(1);
    }
};

startServer();