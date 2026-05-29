import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      if (!email || !senha) {
        setErro('Preencha email e senha');
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      console.log('Usuário logado:', userCredential.user);

      // Redirecionar para página de veículos
      navigate('/veiculos');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        
        {erro && <div className="erro-message">{erro}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-links">
          <a href="/cadastro">Não possui conta? Cadastre-se</a>
          <a href="/recuperar-senha">Esqueceu sua senha?</a>
        </div>
      </div>
    </div>
  );
}
