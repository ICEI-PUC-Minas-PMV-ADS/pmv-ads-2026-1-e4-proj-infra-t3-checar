import express from 'express';
import mongoose from 'mongoose';
import Usuario from './models/Usuario.js';

const router = express.Router();

router.use(express.json());

const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Campos obrigatórios',
        mensagem: 'Nome, email e senha são obrigatórios.',
      });
    }

    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({
        erro: 'Email já cadastrado',
        mensagem: 'Este email já está em uso.',
      });
    }

    const tipoNormalizado = tipoUsuario
      ? tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1).toLowerCase()
      : 'Motorista';

    const novoUsuario = new Usuario({
      nome,
      email,
      senha,
      tipoUsuario: tipoNormalizado,
    });

    await novoUsuario.save();

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso!',
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipoUsuario: novoUsuario.tipoUsuario,
        createdAt: novoUsuario.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar usuário', detalhe: error.message });
  }
};

router.post('/usuarios', criarUsuario);
// Legacy alias kept for backward compatibility
router.post('/usuariocadastrados', criarUsuario);

router.get('/usuarios', async (_req, res) => {
  try {
    const usuarios = await Usuario.find().select('-senha');
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar usuários', detalhe: error.message });
  }
});

router.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const usuario = await Usuario.findById(id).select('-senha');
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar usuário', detalhe: error.message });
  }
});

router.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, tipoUsuario, senha } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const usuario = await Usuario.findById(id).select('+senha');
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    if (email && email !== usuario.email) {
      const emailExistente = await Usuario.findOne({ email: email.toLowerCase() });
      if (emailExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }
    }

    if (nome) usuario.nome = nome;
    if (email) usuario.email = email;
    if (tipoUsuario) {
      usuario.tipoUsuario =
        tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1).toLowerCase();
    }
    // Setting senha directly triggers the pre-save hook that re-hashes it
    if (senha) usuario.senha = senha;

    await usuario.save();

    res.status(200).json({
      mensagem: 'Usuário atualizado com sucesso!',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        updatedAt: usuario.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhe: error.message });
  }
});

router.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar usuário', detalhe: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Campos obrigatórios',
        mensagem: 'Email e senha são obrigatórios.',
      });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+senha');
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas', mensagem: 'Email ou senha incorretos.' });
    }

    const senhaValida = await usuario.compararSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas', mensagem: 'Email ou senha incorretos.' });
    }

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro no servidor', detalhe: error.message });
  }
});

export default router;
