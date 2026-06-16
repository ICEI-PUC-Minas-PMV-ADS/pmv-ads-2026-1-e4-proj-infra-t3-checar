import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Checklist from "./checklist.js";
import { uploadSignature } from "./services/blobStorageService.js";

dotenv.config();

const router = express.Router();

router.use(express.json());


const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const objectIdFilters = ["usuarioId", "veiculoId", "modeloId"];

router.post("/checklists", async (req, res) => {
    try {
        const { assinatura: assinaturaInput, ...rest } = req.body;

        if (!assinaturaInput) {
            return res.status(400).json({ erro: 'Assinatura do motorista é obrigatória.' });
        }

        const assinatura = await uploadSignature(assinaturaInput);
        const novoChecklist = await Checklist.create({ ...rest, assinatura });
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

// GET /checklists/historico — must be before /checklists/:id to avoid "historico" matching :id
router.get("/checklists/historico", async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
        const skip  = (page - 1) * limit;

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
            filtros.conformidade = req.query.conformidade === 'true';
        }

        if (req.query.startDate || req.query.endDate) {
            filtros.data = {};
            if (req.query.startDate) filtros.data.$gte = new Date(req.query.startDate);
            if (req.query.endDate)   filtros.data.$lte = new Date(req.query.endDate);
        }

        const [checklists, total] = await Promise.all([
            Checklist.find(filtros).sort({ data: -1 }).skip(skip).limit(limit),
            Checklist.countDocuments(filtros),
        ]);

        res.status(200).json({ data: checklists, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar histórico de checklists.', detalhe: error.message });
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
