import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ItemChecklist from "./itemchecklist.js";

dotenv.config();

const app = express();
const PORT = 3002;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API ItemChecklist OK");
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo conectado para ItemChecklist");
    } catch (error) {
        console.log("Erro ao conectar no Mongo", error);
    }
};

connectDB();

app.post("/itemchecklists", async (req, res) => {
    try {
        const novoItemChecklist = await ItemChecklist.create(req.body);
        res.status(201).json(novoItemChecklist);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.get("/itemchecklists", async (req, res) => {
    try {
        const itensChecklist = await ItemChecklist.find();
        res.status(200).json(itensChecklist);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.get("/itemchecklists/:id", async (req, res) => {
    try {
        const itemChecklist = await ItemChecklist.findById(req.params.id);

        if (!itemChecklist) {
            return res.status(404).json({ mensagem: "Item de checklist nao encontrado" });
        }

        res.status(200).json(itemChecklist);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.put("/itemchecklists/:id", async (req, res) => {
    try {
        const itemChecklistAtualizado = await ItemChecklist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!itemChecklistAtualizado) {
            return res.status(404).json({ mensagem: "Item de checklist nao encontrado" });
        }

        res.status(200).json(itemChecklistAtualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.delete("/itemchecklists/:id", async (req, res) => {
    try {
        const itemChecklistDeletado = await ItemChecklist.findByIdAndDelete(req.params.id);

        if (!itemChecklistDeletado) {
            return res.status(404).json({ mensagem: "Item de checklist nao encontrado" });
        }

        res.status(200).json({ mensagem: "Item de checklist deletado com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ItemChecklist rodando na porta ${PORT}`);
});
