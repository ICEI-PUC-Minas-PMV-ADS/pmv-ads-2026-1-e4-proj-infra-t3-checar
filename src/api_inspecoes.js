import express from 'express';
import mongoose from 'mongoose';
import Inspecao from './models/Inspecao.js';
<<<<<<< HEAD
import upload from './config/multer.js';
=======
import upload, { compressImages } from './config/multer.js';
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post(
  '/inspecao/upload',
  upload.fields([
    { name: 'frente',          maxCount: 1 },
    { name: 'traseira',        maxCount: 1 },
    { name: 'lateralEsquerda', maxCount: 1 },
    { name: 'lateralDireita',  maxCount: 1 },
    { name: 'topo',            maxCount: 1 },
  ]),
<<<<<<< HEAD
=======
  compressImages,
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
  async (req, res) => {
    try {
      const { placa } = req.body;

      if (!placa || placa.trim() === '') {
        return res.status(400).json({ erro: 'Placa obrigatória' });
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
      });

      await novaInspecao.save();

      res.status(201).json({
        mensagem: 'Inspeção realizada com sucesso!',
        dados: novaInspecao,
      });
    } catch (error) {
      res.status(500).json({ erro: 'Erro interno no servidor.', detalhe: error.message });
    }
  }
);

<<<<<<< HEAD
router.get('/inspecoes', async (_req, res) => {
  try {
    const inspecoes = await Inspecao.find().sort({ createdAt: -1 });
    res.json(inspecoes);
=======
// GET /inspecoes?page=1&limit=20
router.get('/inspecoes', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;

    const [inspecoes, total] = await Promise.all([
      Inspecao.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Inspecao.countDocuments(),
    ]);

    res.json({ data: inspecoes, total, page, totalPages: Math.ceil(total / limit) });
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar inspeções', detalhe: error.message });
  }
});

router.get('/inspecoes/historico/:placa', async (req, res) => {
  try {
    const { placa } = req.params;
    if (!placa || placa.trim() === '') {
      return res.status(400).json({ erro: 'Placa obrigatória' });
    }

    const historico = await Inspecao.find({
      placa: placa.toUpperCase(),
    }).sort({ createdAt: -1 });

    if (historico.length === 0) {
      return res
        .status(404)
        .json({ mensagem: `Nenhuma inspeção encontrada para a placa ${placa.toUpperCase()}.` });
    }

    res.status(200).json(historico);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar histórico.', detalhe: error.message });
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
    res.status(500).json({ erro: 'Erro ao deletar inspeções', detalhe: error.message });
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
    res.status(500).json({ erro: 'Erro ao deletar inspeção', detalhe: error.message });
  }
});

export default router;
