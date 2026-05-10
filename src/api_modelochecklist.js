import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ModeloChecklist from "./modelochecklist.js";

dotenv.config();

const router = express.Router();

router.use(express.json());

router.get("/", (req, res) => {
    res.send("API ModeloChecklist OK");
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post("/modelochecklists", async (req, res) => {
    try {
        const novoModeloChecklist = await ModeloChecklist.create(req.body);
        res.status(201).json(novoModeloChecklist);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

router.get("/modelochecklists", async (req, res) => {
    try {
        const filtros = {};

        if (req.query.tipo) {
            filtros.tipo = req.query.tipo;
        }

        if (req.query.nome) {
            filtros.nome = { $regex: req.query.nome, $options: "i" };
        }

        if (req.query.ativo !== undefined) {
            filtros.ativo = req.query.ativo === "true";
        }

        const modelosChecklist = await ModeloChecklist.find(filtros);
        res.status(200).json(modelosChecklist);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

router.get("/modelochecklists/:id", async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ erro: "ID invalido" });
        }

        const modeloChecklist = await ModeloChecklist.findById(req.params.id);

        if (!modeloChecklist) {
            return res.status(404).json({ mensagem: "Modelo de checklist nao encontrado" });
        }

        res.status(200).json(modeloChecklist);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

router.put("/modelochecklists/:id", async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ erro: "ID invalido" });
        }

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
        res.status(400).json({ erro: error.message });
    }
});

router.delete("/modelochecklists/:id", async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ erro: "ID invalido" });
        }

        const modeloChecklistDeletado = await ModeloChecklist.findByIdAndDelete(req.params.id);

        if (!modeloChecklistDeletado) {
            return res.status(404).json({ mensagem: "Modelo de checklist nao encontrado" });
        }

        res.status(200).json({ mensagem: "Modelo de checklist deletado com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

export default router;
