import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function UserRegistration() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipoUsuario: 'Motorista',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');
  const [sucesso, setSucesso] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    const { nome, email, senha, tipoUsuario } = formData;

    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    let firebaseUser = null;
    try {
      // 1. Create Firebase Auth account
      const credential = await createUserWithEmailAndPassword(auth, email, senha);
      firebaseUser = credential.user;

      // 2. Register in our backend (profile data / role)
      await api.post('/usuarios', { nome, email, senha, tipoUsuario });

      // 3. Persist role in AuthContext so it's available across the session
      setRole(tipoUsuario);

      setSucesso('Cadastro realizado com sucesso! Redirecionando…');
      setTimeout(() => navigate('/veiculos'), 1500);
    } catch (error) {
      // Rollback: if the backend call failed after Firebase succeeded,
      // delete the Firebase account so the two systems stay in sync
      if (firebaseUser && error.response) {
        try { await firebaseUser.delete(); } catch { /* best-effort */ }
      }

      const code = error.code;
      if (code === 'auth/email-already-in-use') {
        setErro('Este email já está em uso.');
      } else if (code === 'auth/invalid-email') {
        setErro('Email inválido.');
      } else if (code === 'auth/weak-password') {
        setErro('Senha fraca. Use pelo menos 6 caracteres.');
      } else if (error.response?.data?.mensagem) {
        setErro(error.response.data.mensagem);
      } else {
        setErro('Erro ao realizar cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#002b45] p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Cadastro de Usuário</h1>

        {erro && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-4 rounded-lg border border-green-500/40 bg-green-950/30 px-4 py-3 text-sm text-green-300">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#00b7eb]">Nome *</label>
            <input
              name="nome"
              type="text"
              placeholder="Seu nome completo"
              value={formData.nome}
              onChange={handleChange}
              disabled={loading}
              className="rounded-lg border-2 border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#00b7eb] disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#00b7eb]">Email *</label>
            <input
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="rounded-lg border-2 border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#00b7eb] disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#00b7eb]">Senha * (mín. 6 caracteres)</label>
            <input
              name="senha"
              type="password"
              placeholder="Sua senha"
              value={formData.senha}
              onChange={handleChange}
              disabled={loading}
              className="rounded-lg border-2 border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#00b7eb] disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#00b7eb]">Tipo de Usuário</label>
            <select
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              disabled={loading}
              className="rounded-lg border-2 border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none focus:border-[#00b7eb] disabled:opacity-50"
            >
              <option value="Motorista">Motorista</option>
              <option value="Gestor">Gestor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-[#00b7eb] py-3 font-extrabold text-[#00112b] transition hover:bg-white disabled:opacity-60"
          >
            {loading ? 'Cadastrando…' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/50">
          Já possui conta?{' '}
          <Link to="/login" className="text-[#00b7eb] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
