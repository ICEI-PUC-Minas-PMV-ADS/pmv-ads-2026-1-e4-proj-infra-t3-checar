const express = require('express');
const router = express.Router();
const upload = require('./config/multer');
const Vehicle = require('./models/Vehicle');
const Inspecao = require('./models/Inspecao');

// ==========================================
// CRUD DE VEÍCULOS (Gerenciamento)
// ==========================================

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Cadastrar um novo veículo
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       201:
 *         description: Veículo cadastrado com sucesso
 *       400:
 *         description: Erro na validação dos dados
 */
router.post('/vehicles', async (req, res) => {
    try {
        const novoVeiculo = new Vehicle(req.body);
        await novoVeiculo.save();
        res.status(201).json(novoVeiculo);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
});

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Listar todos os veículos cadastrados
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: Lista de veículos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get('/vehicles', async (req, res) => {
    try {
        const veiculos = await Vehicle.find();
        res.json(veiculos);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar veículos", detalhe: error.message });
    }
});

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Buscar veículo por ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *     responses:
 *       200:
 *         description: Veículo encontrado
 *       404:
 *         description: Veículo não encontrado
 */
router.get('/vehicles/:id', async (req, res) => {
    try {
        const veiculo = await Vehicle.findById(req.params.id);
        if (!veiculo) return res.status(404).json({ mensagem: "Veículo não encontrado" });
        res.json(veiculo);
    } catch (error) {
        res.status(400).json({ erro: "ID inválido" });
    }
});

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Remover um veículo do sistema
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *     responses:
 *       204:
 *         description: Veículo removido com sucesso
 *       404:
 *         description: Veículo não encontrado
 */
router.delete('/vehicles/:id', async (req, res) => {
    try {
        const deletado = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deletado) return res.status(404).json({ mensagem: "Veículo não encontrado" });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ erro: "Erro ao deletar veículo" });
    }
});

// ==========================================
// INSPEÇÃO E UPLOAD (Checklist Fotográfico)
// ==========================================

/**
 * @swagger
 * /inspecao/upload:
 *   post:
 *     summary: Realizar inspeção com fotos obrigatórias (RF-005)
 *     tags: [Inspeção]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               placa:
 *                 type: string
 *                 example: ABC1234
 *               frente:
 *                 type: string
 *                 format: binary
 *               traseira:
 *                 type: string
 *                 format: binary
 *               lateralEsquerda:
 *                 type: string
 *                 format: binary
 *               lateralDireita:
 *                 type: string
 *                 format: binary
 *               topo:
 *                 type: string
 *                 format: binary
 *             required:
 *               - placa
 *               - frente
 *               - traseira
 *               - lateralEsquerda
 *               - lateralDireita
 *               - topo
 *     responses:
 *       201:
 *         description: Inspeção salva com sucesso
 *       400:
 *         description: Checklist incompleto ou placa ausente
 */
router.post('/inspecao/upload', upload.fields([
    { name: 'frente', maxCount: 1 },
    { name: 'traseira', maxCount: 1 },
    { name: 'lateralEsquerda', maxCount: 1 },
    { name: 'lateralDireita', maxCount: 1 },
    { name: 'topo', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log("--- Nova tentativa de Upload Estruturado ---");
        const { placa } = req.body;

        if (!placa || placa.trim() === '') {
            return res.status(400).json({ 
                erro: "Placa obrigatória",
                mensagem: "A placa do veículo é obrigatória para iniciar a inspeção." 
            });
        }

        const fotosPaths = {
            frente: req.files?.['frente']?.[0]?.path,
            traseira: req.files?.['traseira']?.[0]?.path,
            lateralEsquerda: req.files?.['lateralEsquerda']?.[0]?.path,
            lateralDireita: req.files?.['lateralDireita']?.[0]?.path,
            topo: req.files?.['topo']?.[0]?.path
        };

        const novaInspecao = new Inspecao({
            placa: placa.toUpperCase(),
            fotos: fotosPaths
        });

        await novaInspecao.save();
        
        console.log("Sucesso: Inspeção salva com todas as fotos!");
        res.status(201).json({
            mensagem: "Inspeção realizada com sucesso!",
            dados: novaInspecao
        });

    } catch (error) {
        console.error("ERRO NO BACKEND:", error.message);

        if (error.name === 'ValidationError') {
            const camposFaltantes = Object.keys(error.errors);
            return res.status(400).json({ 
                erro: "Checklist Incompleto",
                mensagem: "Você esqueceu de tirar alguma das fotos obrigatórias.",
                campos_pendentes: camposFaltantes
            });
        }

        res.status(500).json({ erro: "Erro interno no servidor.", detalhe: error.message });
    }
});

/**
 * @swagger
 * /inspecoes/historico/{placa}:
 *   get:
 *     summary: Buscar histórico de inspeções por placa (RF-011)
 *     tags: [Inspeção]
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *         description: Placa do veículo para busca
 *     responses:
 *       200:
 *         description: Histórico de inspeções encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inspecao'
 *       404:
 *         description: Nenhuma inspeção para esta placa
 */
router.get('/inspecoes/historico/:placa', async (req, res) => {
    try {
        const { placa } = req.params;
        
        if (!placa || placa.trim() === '') {
            return res.status(400).json({ erro: "Placa obrigatória" });
        }

        const historico = await Inspecao.find({ 
            placa: placa.toUpperCase() 
        }).sort({ createdAt: -1 });

        if (historico.length === 0) {
            return res.status(404).json({ 
                mensagem: `Nenhuma inspeção encontrada para a placa ${placa.toUpperCase()}.` 
            });
        }

        res.status(200).json(historico);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar histórico.", detalhe: error.message });
    }
});

module.exports = router;
