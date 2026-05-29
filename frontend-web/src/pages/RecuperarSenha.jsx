import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import './RecuperarSenha.css';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);

    try {
      if (!email) {
        setErro('Digite seu email');
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setSucesso('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setEmail('');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      setErro('Email não encontrado ou erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-container">
      <div className="recuperar-card">
        <h1>Recuperar Senha</h1>
        <p className="subtitulo">Digite seu email para receber um link de recuperação</p>
        
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">{sucesso}</div>}
        
        <form onSubmit={handleRecuperar}>
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

          <button type="submit" disabled={loading} className="btn-recuperar">
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="recuperar-links">
          <a href="/login">Voltar ao Login</a>
        </div>
      </div>
    </div>
  );
}
