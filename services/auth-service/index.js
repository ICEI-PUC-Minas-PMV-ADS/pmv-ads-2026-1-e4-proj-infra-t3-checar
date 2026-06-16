import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'auth-service' }));

// Importa rotas do monolito (reutiliza via import direto)
// Em produção, cada serviço teria seu próprio model/schema
import Usuario from '../../src/models/Usuario.js';

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
    const usuario = new Usuario({ nome, email: email.toLowerCase(), senha, tipoUsuario: tipoUsuario || 'Motorista' });
    await usuario.save();
    res.status(201).json({ status: 'success', data: { _id: usuario._id, nome: usuario.nome, email: usuario.email, tipoUsuario: usuario.tipoUsuario } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: 'Email já cadastrado' });
    res.status(500).json({ erro: 'Erro interno', detalhe: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios' });
    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+senha');
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const { default: bcrypt } = await import('bcryptjs');
    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });
    res.json({ status: 'success', data: { _id: usuario._id, nome: usuario.nome, email: usuario.email, tipoUsuario: usuario.tipoUsuario } });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno', detalhe: err.message });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-senha');
    res.json({ status: 'success', data: usuarios });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno' });
  }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/checar')
  .then(() => app.listen(process.env.AUTH_PORT || 3001, () => console.log('auth-service :3001')))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
