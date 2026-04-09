import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ModeloChecklist from "./modelochecklist.js";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API ModeloChecklist OK");
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo conectado para ModeloChecklist");
    } catch (error) {
        console.log("Erro ao conectar no Mongo", error);
    }
};

connectDB();

app.post("/modelochecklists", async (req, res) => {
    try {
        const novoModeloChecklist = await ModeloChecklist.create(req.body);
        res.status(201).json(novoModeloChecklist);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.get("/modelochecklists", async (req, res) => {
    try {
        const modelosChecklist = await ModeloChecklist.find();
        res.status(200).json(modelosChecklist);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.get("/modelochecklists/:id", async (req, res) => {
    try {
        const modeloChecklist = await ModeloChecklist.findById(req.params.id);

        if (!modeloChecklist) {
            return res.status(404).json({ mensagem: "Modelo de checklist nao encontrado" });
        }

        res.status(200).json(modeloChecklist);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.put("/modelochecklists/:id", async (req, res) => {
    try {
        const modeloChecklistAtualizado = await ModeloChecklist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!modeloChecklistAtualizado) {
            return res.status(404).json({ mensagem: "Modelo de checklist nao encontrado" });
        }

        res.status(200).json(modeloChecklistAtualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.delete("/modelochecklists/:id", async (req, res) => {
    try {
        const modeloChecklistDeletado = await ModeloChecklist.findByIdAndDelete(req.params.id);

        if (!modeloChecklistDeletado) {
            return res.status(404).json({ mensagem: "Modelo de checklist nao encontrado" });
        }

        res.status(200).json({ mensagem: "Modelo de checklist deletado com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ModeloChecklist rodando na porta ${PORT}`);
});
