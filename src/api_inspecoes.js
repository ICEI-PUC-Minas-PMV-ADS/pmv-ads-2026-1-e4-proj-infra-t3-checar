import express from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import Inspecao from './models/Inspecao.js';
import upload, { processImages } from './config/multer.js';

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Muitas tentativas de upload. Tente novamente em 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post(
  '/inspecao/upload',
  uploadLimiter,
  upload.fields([
    { name: 'frente',          maxCount: 1 },
    { name: 'traseira',        maxCount: 1 },
    { name: 'lateralEsquerda', maxCount: 1 },
    { name: 'lateralDireita',  maxCount: 1 },
    { name: 'topo',            maxCount: 1 },
  ]),
  processImages,
  async (req, res) => {
    try {
      const { placa, checklistId } = req.body;

      if (!placa || placa.trim() === '') {
        return res.status(400).json({ erro: 'Placa obrigatória' });
      }

      if (checklistId && !isValidObjectId(checklistId)) {
        return res.status(400).json({ erro: 'checklistId inválido' });
      }

      if (!req.files) {
        return res.status(400).json({ erro: 'Fotos obrigatórias' });
      }

      const fotosPaths = {
        frente:          req.files['frente']?.[0]?.path,
        traseira:        req.files['traseira']?.[0]?.path,
        lateralEsquerda: req.files['lateralEsquerda']?.[0]?.path,
        lateralDireita:  req.files['lateralDireita']?.[0]?.path,
        topo:            req.files['topo']?.[0]?.path,
      };

      const missingPhotos = Object.entries(fotosPaths)
        .filter(([, v]) => !v)
        .map(([k]) => k);

      if (missingPhotos.length > 0) {
        return res.status(400).json({
          erro: 'Checklist Incompleto',
          mensagem: 'Você esqueceu de tirar alguma das fotos obrigatórias.',
          campos_pendentes: missingPhotos,
        });
      }

      const novaInspecao = new Inspecao({
        placa: placa.toUpperCase(),
        fotos: fotosPaths,
        dataInspecao: new Date(),
        ...(checklistId ? { checklistId } : {}),
      });

      await novaInspecao.save();

      res.status(201).json({
        mensagem: 'Inspeção realizada com sucesso!',
        dados: novaInspecao,
      });
    } catch (error) {
      console.error('[inspecao/upload]', error.name, error.message);
      res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
  }
);

// GET /inspecoes?page=1&limit=20&checklistId=<id>
router.get('/inspecoes', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;

    const filtros = {};
    if (req.query.checklistId) {
      if (!isValidObjectId(req.query.checklistId)) {
        return res.status(400).json({ erro: 'checklistId inválido' });
      }
      filtros.checklistId = req.query.checklistId;
    }

    const [inspecoes, total] = await Promise.all([
      Inspecao.find(filtros).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Inspecao.countDocuments(filtros),
    ]);

    res.json({ data: inspecoes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /inspecoes]', error.name, error.message);
    res.status(500).json({ erro: 'Erro ao listar inspeções' });
  }
});

// GET /inspecoes/checklist/:checklistId — todas as fotos de um checklist específico
router.get('/inspecoes/checklist/:checklistId', async (req, res) => {
  try {
    const { checklistId } = req.params;
    if (!isValidObjectId(checklistId)) {
      return res.status(400).json({ erro: 'checklistId inválido' });
    }

    const inspecoes = await Inspecao.find({ checklistId }).sort({ createdAt: -1 });

    if (inspecoes.length === 0) {
      return res.status(404).json({
        mensagem: `Nenhuma inspeção encontrada para o checklist ${checklistId}`,
      });
    }

    res.status(200).json(inspecoes);
  } catch (error) {
    console.error('[GET /inspecoes/checklist]', error.name, error.message);
    res.status(500).json({ erro: 'Erro ao buscar inspeções do checklist.' });
  }
});

// GET /inspecoes/historico/:placa?page=1&limit=20&startDate=&endDate=
router.get('/inspecoes/historico/:placa', async (req, res) => {
  try {
    const { placa } = req.params;
    if (!placa || placa.trim() === '') {
      return res.status(400).json({ erro: 'Placa obrigatória' });
    }

    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;

    const filtro = { placa: placa.toUpperCase() };
    if (req.query.startDate || req.query.endDate) {
      filtro.dataInspecao = {};
      if (req.query.startDate) filtro.dataInspecao.$gte = new Date(req.query.startDate);
      if (req.query.endDate)   filtro.dataInspecao.$lte = new Date(req.query.endDate);
    }

    const [historico, total] = await Promise.all([
      Inspecao.find(filtro).sort({ dataInspecao: -1 }).skip(skip).limit(limit),
      Inspecao.countDocuments(filtro),
    ]);

    if (total === 0) {
      return res.status(404).json({
        mensagem: `Nenhuma inspeção encontrada para a placa ${placa.toUpperCase()}.`,
      });
    }

    res.status(200).json({ data: historico, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /inspecoes/historico]', error.name, error.message);
    res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
});

// IMPORTANT: /inspecoes/placa/:placa must come before /inspecoes/:id
router.delete('/inspecoes/placa/:placa', async (req, res) => {
  try {
    const { placa } = req.params;
    const resultado = await Inspecao.deleteMany({ placa: placa.toUpperCase() });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({
        mensagem: `Nenhuma inspeção encontrada para a placa ${placa.toUpperCase()}`,
      });
    }

    res.status(200).json({
      mensagem: `${resultado.deletedCount} inspeção(ões) deletada(s) com sucesso`,
      totalDeletado: resultado.deletedCount,
    });
  } catch (error) {
    console.error('[DELETE /inspecoes/placa]', error.name, error.message);
    res.status(500).json({ erro: 'Erro ao deletar inspeções' });
  }
});

router.delete('/inspecoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const inspecaoDeletada = await Inspecao.findByIdAndDelete(id);
    if (!inspecaoDeletada) {
      return res.status(404).json({ mensagem: 'Inspeção não encontrada' });
    }
    res.status(200).json({ mensagem: 'Inspeção deletada com sucesso', inspecao: inspecaoDeletada });
  } catch (error) {
    console.error('[DELETE /inspecoes/:id]', error.name, error.message);
    res.status(500).json({ erro: 'Erro ao deletar inspeção' });
  }
});

export default router;
