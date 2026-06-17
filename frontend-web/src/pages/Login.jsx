import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { waitForFirebaseUser } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro]     = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/veiculos';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      const firebaseUser = await waitForFirebaseUser();
      await firebaseUser.getIdToken(true);
      navigate(from, { replace: true });
    } catch (error) {
      const code = error.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErro('Email ou senha inválidos');
      } else if (code === 'auth/too-many-requests') {
        setErro('Muitas tentativas. Aguarde alguns minutos.');
      } else if (code === 'auth/user-disabled') {
        setErro('Esta conta foi desativada.');
      } else {
        setErro('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#002b45] p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          C h e c a r
        </h1>

        {erro && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

          <div className="flex flex-col gap-1">
            <label htmlFor="senha" className="text-sm font-semibold text-[#00b7eb]">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              disabled={loading}
              className="rounded-lg border-2 border-white/10 bg-[#00112b] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#00b7eb] disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-[#00b7eb] py-3 font-extrabold text-[#00112b] transition hover:bg-white disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link to="/cadastro" className="text-[#00b7eb] hover:underline">
            Não possui conta? Cadastre-se
          </Link>
          <Link to="/recuperar-senha" className="text-white/50 hover:text-white/80">
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
}
