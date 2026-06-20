import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Rotas acessíveis apenas sem login (login e cadastro). */
export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#00112b]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00b7eb] border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/veiculos" replace />;
  }

  return children;
}
