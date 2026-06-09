import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Checklist from "./checklist.js";

dotenv.config();

const router = express.Router();

router.use(express.json());


const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const objectIdFilters = ["usuarioId", "veiculoId", "modeloId"];

router.post("/checklists", async (req, res) => {
    try {
        const novoChecklist = await Checklist.create(req.body);
        res.status(201).json(novoChecklist);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

router.get("/checklists", async (req, res) => {
    try {
        const filtros = {};

        for (const campo of objectIdFilters) {
            if (req.query[campo]) {
                if (!isValidObjectId(req.query[campo])) {
                    return res.status(400).json({ erro: `${campo} invalido` });
                }

                filtros[campo] = req.query[campo];
            }
        }

        if (req.query.conformidade !== undefined) {
            filtros.conformidade = req.query.conformidade === "true";
        }

        if (req.query.status) {
            filtros.status = req.query.status;
        }

        const checklists = await Checklist.find(filtros);
        res.status(200).json(checklists);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

router.get("/checklists/:id", async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ erro: "ID invalido" });
        }

        const checklist = await Checklist.findById(req.params.id);

        if (!checklist) {
            return res.status(404).json({ mensagem: "Checklist nao encontrado" });
        }

        res.status(200).json(checklist);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

router.put("/checklists/:id", async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ erro: "ID invalido" });
        }

        const checklistAtualizado = await Checklist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!checklistAtualizado) {
            return res.status(404).json({ mensagem: "Checklist nao encontrado" });
        }

        res.status(200).json(checklistAtualizado);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

router.delete("/checklists/:id", async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ erro: "ID invalido" });
        }

        const checklistDeletado = await Checklist.findByIdAndDelete(req.params.id);

        if (!checklistDeletado) {
            return res.status(404).json({ mensagem: "Checklist nao encontrado" });
        }

        res.status(200).json({ mensagem: "Checklist deletado com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

export default router;
