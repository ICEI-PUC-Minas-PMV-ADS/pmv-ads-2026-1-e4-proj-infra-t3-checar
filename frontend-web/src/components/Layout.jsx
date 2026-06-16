import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Camera, Car, LayoutGrid, LogOut, LogIn, Clock, FileText, Download, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const PUBLIC_PATHS = ['/login', '/cadastro', '/recuperar-senha'];

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);

  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    if (!user || isPublicPage) {
      setNaoLidas(0);
      return;
    }
    let cancelado = false;
    api.get('/notificacoes', { params: { page: 1, limit: 1 } })
      .then((res) => {
        if (!cancelado) {
          const total = res.data?.total ?? 0;
          const naoLidasCount = res.data?.data?.filter?.((n) => !n.lida).length ?? 0;
          // Usa o total se o backend já filtra apenas não lidas, senão conta do data
          setNaoLidas(naoLidasCount || (total > 0 ? total : 0));
        }
      })
      .catch(() => {});
    return () => { cancelado = true; };
  }, [user, isPublicPage, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#00112b] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[#004aad] focus:px-4 focus:py-2 focus:text-white"
      >
        Ir para o conteúdo principal
      </a>
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

          <div className="flex items-center gap-1 flex-wrap">
            {user && !isPublicPage ? (
              <>
                <Link
                  to="/veiculos"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#0052cc]"
                >
                  <Car size={16} /> Veículos
                </Link>
                <Link
                  to="/modelos"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#0052cc]"
                >
                  <LayoutGrid size={16} /> Modelos
                </Link>
                <Link
                  to="/historico"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#0052cc]"
                >
                  <Clock size={16} /> Histórico
                </Link>
                <Link
                  to="/relatorios"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#0052cc]"
                >
                  <FileText size={16} /> Relatórios
                </Link>
                <Link
                  to="/exportacoes"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#0052cc]"
                >
                  <Download size={16} /> Exportações
                </Link>
                <Link
                  to="/notificacoes"
                  className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#0052cc]"
                >
                  <Bell size={16} />
                  Notificações
                  {naoLidas > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                      {naoLidas > 9 ? '9+' : naoLidas}
                    </span>
                  )}
                </Link>
                <Link
                  to="/upload"
                  className="flex items-center gap-2 rounded-full bg-[#00b7eb] px-4 py-2 text-sm font-bold text-[#00112b] transition-colors hover:bg-white"
                >
                  <Camera size={15} /> Nova Inspeção
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

      <main id="main-content" tabIndex={-1} className="container mx-auto max-w-6xl p-6">
        {children}
      </main>
    </div>
  );
}

export default Layout;
