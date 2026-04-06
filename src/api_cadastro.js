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

// 🔥 ROTA POST (A QUE IMPORTA)
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

app.listen(PORT, () => {
    console.log("Servidor rodando na porta 3000 🚀");
});