import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ModeloChecklist from "./modelochecklist.js";
import * as cache from "./services/memoryCache.js";
import authorize from "./middlewares/roleMiddleware.js";

dotenv.config();

const CACHE_PREFIX = 'modelochecklists:';

const router = express.Router();

router.use(express.json());

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Criação/edição de modelo: Gestor e Motorista (tela Modelos acessível a ambos)
router.post("/modelochecklists", authorize("Gestor", "Motorista"), async (req, res) => {
  try {
    const novoModeloChecklist = await ModeloChecklist.create(req.body);
    cache.delByPrefix(CACHE_PREFIX); // invalida cache da listagem
    res.status(201).json(novoModeloChecklist);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ erro: error.message });
    }
    console.error('[POST /modelochecklists]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao criar modelo de checklist.' });
  }
});

router.get("/modelochecklists", async (req, res) => {
  try {
    const cacheKey = CACHE_PREFIX + JSON.stringify(req.query);
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

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
    const payload = { status: 'success', data: modelosChecklist };
    cache.set(cacheKey, payload, 5 * 60_000); // TTL 5 min
    res.status(200).json(payload);
  } catch (error) {
    console.error('[GET /modelochecklists]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao listar modelos de checklist.' });
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
    console.error('[GET /modelochecklists/:id]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao buscar modelo de checklist.' });
  }
});

router.put("/modelochecklists/:id", authorize("Gestor", "Motorista"), async (req, res) => {
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

    cache.delByPrefix(CACHE_PREFIX);
    res.status(200).json(modeloChecklistAtualizado);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ erro: error.message });
    }
    console.error('[PUT /modelochecklists/:id]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao atualizar modelo de checklist.' });
  }
});

router.delete("/modelochecklists/:id", authorize("Gestor"), async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ erro: "ID invalido" });
    }

    const modeloChecklistDeletado = await ModeloChecklist.findByIdAndDelete(req.params.id);

    if (!modeloChecklistDeletado) {
      return res.status(404).json({ mensagem: "Modelo de checklist nao encontrado" });
    }

    cache.delByPrefix(CACHE_PREFIX);
    res.status(200).json({ mensagem: "Modelo de checklist deletado com sucesso" });
  } catch (error) {
    console.error('[DELETE /modelochecklists/:id]', error.name, error.message, error.stack);
    res.status(500).json({ erro: 'Erro interno ao deletar modelo de checklist.' });
  }
});

export default router;
