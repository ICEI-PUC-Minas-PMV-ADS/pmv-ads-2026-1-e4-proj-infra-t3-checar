import express from "express";
import mongoose from "mongoose";
import Usuario from "./usuariocadastrados.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 🔥 ROTA SIMPLES PRA TESTAR
app.get("/", (req, res) => {
    res.send("API OK 🚀");
});

// 🔌 conexão com banco
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo conectado ✅");
    } catch (error) {
        console.log("Erro Mongo env ❌", error);
    }
};

connectDB();

// CREATE
app.post("/usuariocadastrados", async (req, res) => {
    try {
        console.log("BODY:", req.body);

        const novoUsuario = await Usuario.create(req.body);

        res.status(201).json(novoUsuario);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });

    }
});

// GET
app.get("/usuariocadastrados/:id", async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

// PUT
app.put("/usuariocadastrados/:id", async (req, res) => {
    try {
        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!usuarioAtualizado) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json(usuarioAtualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

// DELETE
app.delete("/usuariocadastrados/:id", async (req, res) => {
    try {
        const usuarioDeletado = await Usuario.findByIdAndDelete(req.params.id);

        if (!usuarioDeletado) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" });
        }

        res.status(200).json({ mensagem: "Usuário deletado com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.listen(PORT, () => {
    console.log("Servidor rodando na porta 3000 🚀");
});