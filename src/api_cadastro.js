import express from "express";
import mongoose from "mongoose";
import Usuario from "./usuariocadastrados.js";
import dotenv from "dotenv";
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "./controllers/vehicleController.js";
import { validateVehicleCreate} from "./middlewares/validateVehicle.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

//  ROTA
app.get("/", (req, res) => {
    res.send("API OK 🚀");
});

// --- CONEXÃO BANCO
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Mongo conectado ✅");

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT} 🚀`);
        });

    } catch (error) {
        console.error("Erro ao conectar no Mongo ❌", error.message);
        process.exit(1);
    }
};

connectDB();
//VEHICLES
app.get("/vehicles", getAllVehicles)
app.get("/vehicles/:id", getVehicleById)
app.post("/vehicles", validateVehicleCreate, createVehicle)
app.put("/vehicles/:id", validateVehicleCreate, updateVehicle)
app.delete("/vehicles/:id", deleteVehicle)

startServer();

// =========================
// CREATE
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


// =========================
// GET
// =========================
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


// =========================
// PUT
// =========================
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


// =========================
// DELETE
// =========================
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