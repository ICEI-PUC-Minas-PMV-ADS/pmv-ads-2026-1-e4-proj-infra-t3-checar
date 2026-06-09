import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Car, LayoutGrid, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PUBLIC_PATHS = ['/login', '/cadastro', '/recuperar-senha'];

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#00112b] text-white">
      <nav className="border-b border-[#33ccff]/30 bg-[#002b45] px-6 py-3">
        <div className="container mx-auto flex max-w-6xl items-center justify-between">

          <Link
            to={user ? '/veiculos' : '/login'}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00b7eb]">
              <span className="font-bold text-[#00112b]">C</span>
            </div>
            <span className="text-lg font-bold uppercase tracking-wider text-white">
              Checar
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user && !isPublicPage ? (
              <>
                <Link
                  to="/veiculos"
                  className="flex items-center gap-2 rounded-full px-4 py-2 transition-colors hover:bg-[#0052cc]"
                >
                  <Car size={18} /> Veículos
                </Link>
                <Link
                  to="/modelos"
                  className="flex items-center gap-2 rounded-full px-4 py-2 transition-colors hover:bg-[#0052cc]"
                >
                  <LayoutGrid size={18} /> Modelos
                </Link>
                <Link
                  to="/upload"
                  className="flex items-center gap-2 rounded-full bg-[#00b7eb] px-4 py-2 font-bold text-[#00112b] transition-colors hover:bg-white"
                >
                  <Camera size={16} /> Nova Inspeção
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-white/60 transition-colors hover:bg-red-900/40 hover:text-red-400"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : !user ? (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full bg-[#00b7eb] px-4 py-2 font-bold text-[#00112b]"
              >
                <LogIn size={16} /> Entrar
              </Link>
            ) : null}
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl p-6">
        {children}
      </main>
    </div>
  );
}

export default Layout;
