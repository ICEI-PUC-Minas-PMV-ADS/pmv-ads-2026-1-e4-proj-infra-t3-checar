import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

export default function RecuperarSenha() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate              = useNavigate();

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!email) {
      setErro('Digite seu email');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSucesso('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setEmail('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      const code = error.code;
      if (code === 'auth/user-not-found') {
        setErro('Email não encontrado.');
      } else if (code === 'auth/invalid-email') {
        setErro('Email inválido.');
      } else {
        setErro('Erro ao enviar email. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#002b45] p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">Recuperar Senha</h1>
        <p className="mb-6 text-center text-sm text-white/60">
          Digite seu email para receber um link de recuperação
        </p>

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

        <form onSubmit={handleRecuperar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold text-[#00b7eb]">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
              className="rounded-lg border-2 border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#00b7eb] disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-[#00b7eb] py-3 font-extrabold text-[#00112b] transition hover:bg-white disabled:opacity-60"
          >
            {loading ? 'Enviando…' : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-[#00b7eb] hover:underline">
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  );
}
