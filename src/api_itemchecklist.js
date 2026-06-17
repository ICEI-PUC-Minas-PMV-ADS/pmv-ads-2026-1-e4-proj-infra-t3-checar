import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ItemChecklist from "./itemchecklist.js";
import { calcularConformidade } from "./services/checklistComplianceService.js";

dotenv.config();

const router = express.Router();

router.use(express.json());

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post("/itemchecklists", async (req, res) => {
  try {
    const novoItemChecklist = await ItemChecklist.create(req.body);
    res.status(201).json(novoItemChecklist);
    calcularConformidade(novoItemChecklist.checklistId)
      .catch((err) => console.error('[Compliance] Erro:', err.message));
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ erro: error.message });
    }
    console.error('[POST /itemchecklists]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao criar item de checklist.' });
  }
});

router.get("/itemchecklists", async (req, res) => {
  try {
    const filtros = {};

    if (req.query.checklistId) {
      if (!isValidObjectId(req.query.checklistId)) {
        return res.status(400).json({ erro: "checklistId invalido" });
      }
      filtros.checklistId = req.query.checklistId;
    }

    if (req.query.status) {
      filtros.status = req.query.status;
    }

    const itensChecklist = await ItemChecklist.find(filtros);
    res.status(200).json(itensChecklist);
  } catch (error) {
    console.error('[GET /itemchecklists]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao listar itens de checklist.' });
  }
});

router.get("/itemchecklists/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ erro: "ID invalido" });
    }

    const itemChecklist = await ItemChecklist.findById(req.params.id);

    if (!itemChecklist) {
      return res.status(404).json({ mensagem: "Item de checklist nao encontrado" });
    }

    res.status(200).json(itemChecklist);
  } catch (error) {
    console.error('[GET /itemchecklists/:id]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao buscar item de checklist.' });
  }
});

router.put("/itemchecklists/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ erro: "ID invalido" });
    }

    const itemChecklistAtualizado = await ItemChecklist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!itemChecklistAtualizado) {
      return res.status(404).json({ mensagem: "Item de checklist nao encontrado" });
    }

    res.status(200).json(itemChecklistAtualizado);
    calcularConformidade(itemChecklistAtualizado.checklistId)
      .catch((err) => console.error('[Compliance] Erro:', err.message));
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ erro: error.message });
    }
    console.error('[PUT /itemchecklists/:id]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao atualizar item de checklist.' });
  }
});

router.delete("/itemchecklists/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ erro: "ID invalido" });
    }

    const itemChecklistDeletado = await ItemChecklist.findByIdAndDelete(req.params.id);

    if (!itemChecklistDeletado) {
      return res.status(404).json({ mensagem: "Item de checklist nao encontrado" });
    }

    res.status(200).json({ mensagem: "Item de checklist deletado com sucesso" });
  } catch (error) {
    console.error('[DELETE /itemchecklists/:id]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao deletar item de checklist.' });
  }
});

export default router;
