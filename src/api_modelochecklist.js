import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ModeloChecklist from "./modelochecklist.js";
<<<<<<< HEAD

dotenv.config();

=======
import * as cache from "./services/memoryCache.js";
import authorize from "./middlewares/roleMiddleware.js";

dotenv.config();

const CACHE_PREFIX = 'modelochecklists:';

>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
const router = express.Router();

router.use(express.json());



const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

<<<<<<< HEAD
router.post("/modelochecklists", async (req, res) => {
    try {
        const novoModeloChecklist = await ModeloChecklist.create(req.body);
=======
// Criação de modelo: somente Gestor (1.2 — RBAC)
router.post("/modelochecklists", authorize("Gestor"), async (req, res) => {
    try {
        const novoModeloChecklist = await ModeloChecklist.create(req.body);
        cache.delByPrefix(CACHE_PREFIX); // invalida cache da listagem
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
        res.status(201).json(novoModeloChecklist);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

router.get("/modelochecklists", async (req, res) => {
    try {
<<<<<<< HEAD
=======
        const cacheKey = CACHE_PREFIX + JSON.stringify(req.query);
        const cached = cache.get(cacheKey);
        if (cached) return res.status(200).json(cached);

>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
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
<<<<<<< HEAD
=======
        cache.set(cacheKey, modelosChecklist, 5 * 60_000); // TTL 5 min
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
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

<<<<<<< HEAD
router.put("/modelochecklists/:id", async (req, res) => {
=======
router.put("/modelochecklists/:id", authorize("Gestor"), async (req, res) => {
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
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

<<<<<<< HEAD
=======
        cache.delByPrefix(CACHE_PREFIX);
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
        res.status(200).json(modeloChecklistAtualizado);
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

<<<<<<< HEAD
router.delete("/modelochecklists/:id", async (req, res) => {
=======
router.delete("/modelochecklists/:id", authorize("Gestor"), async (req, res) => {
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ erro: "ID invalido" });
        }

        const modeloChecklistDeletado = await ModeloChecklist.findByIdAndDelete(req.params.id);

        if (!modeloChecklistDeletado) {
            return res.status(404).json({ mensagem: "Modelo de checklist nao encontrado" });
        }

<<<<<<< HEAD
=======
        cache.delByPrefix(CACHE_PREFIX);
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
        res.status(200).json({ mensagem: "Modelo de checklist deletado com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: error.message });
    }
});

export default router;
