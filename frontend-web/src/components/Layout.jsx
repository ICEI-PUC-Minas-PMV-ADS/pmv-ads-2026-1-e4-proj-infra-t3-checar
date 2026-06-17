import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Camera, Car, LayoutGrid, LogOut, LogIn,
  Clock, FileText, Download, Bell, Menu, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const PUBLIC_PATHS = ['/login', '/cadastro', '/recuperar-senha'];

const NAV_LINKS = [
  { to: '/veiculos',    Icon: Car,        label: 'Veículos' },
  { to: '/modelos',     Icon: LayoutGrid, label: 'Modelos' },
  { to: '/historico',   Icon: Clock,      label: 'Histórico' },
  { to: '/relatorios',  Icon: FileText,   label: 'Relatórios' },
  { to: '/exportacoes', Icon: Download,   label: 'Exportações' },
];

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);

  const [naoLidas, setNaoLidas] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);

  // Close mobile menu whenever the route changes
  useEffect(() => { setMenuAberto(false); }, [location.pathname]);

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
          const naoLidasCount = res.data?.data?.filter((n) => !n.lida)?.length ?? 0;
          setNaoLidas(naoLidasCount || (total > 0 ? total : 0));
        }
      })
      .catch(() => {});
    return () => { cancelado = true; };
  }, [user, isPublicPage, location.pathname]);

  const handleLogout = async () => {
    setMenuAberto(false);
    await logout();
    navigate('/login');
  };

  const showNav = Boolean(user && !isPublicPage);

  return (
    <div className="min-h-screen bg-[#00112b] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[#004aad] focus:px-4 focus:py-2 focus:text-white"
      >
        Ir para o conteúdo principal
      </a>

      <nav className="relative border-b border-[#33ccff]/30 bg-[#002b45] px-6 py-3 z-30">
        <div className="container mx-auto flex max-w-6xl items-center justify-between">

          {/* Logo */}
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

          {/* ── Desktop nav (md+) ── */}
          {showNav && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors hover:bg-[#0052cc]"
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
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
            </div>
          )}

          {/* ── Mobile: hamburger button (< md) ── */}
          {showNav && (
            <button
              className="flex items-center rounded-lg p-2 text-white transition-colors hover:bg-[#0052cc]/40 md:hidden"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuAberto}
              aria-controls="mobile-nav"
            >
              {menuAberto ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* Login button when not authenticated */}
          {!user && (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-[#00b7eb] px-4 py-2 font-bold text-[#00112b]"
            >
              <LogIn size={16} /> Entrar
            </Link>
          )}
        </div>

        {/* ── Mobile dropdown menu ── */}
        {menuAberto && showNav && (
          <div
            id="mobile-nav"
            className="border-t border-[#33ccff]/20 px-2 pt-3 pb-2 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-[#0052cc]/30 ${
                    location.pathname === to ? 'bg-[#0052cc]/20 text-[#00b7eb] font-semibold' : ''
                  }`}
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}
              <Link
                to="/notificacoes"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors hover:bg-[#0052cc]/30 ${
                  location.pathname === '/notificacoes' ? 'bg-[#0052cc]/20 text-[#00b7eb] font-semibold' : ''
                }`}
              >
                <Bell size={16} />
                Notificações
                {naoLidas > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {naoLidas > 9 ? '9+' : naoLidas}
                  </span>
                )}
              </Link>
              <Link
                to="/upload"
                className="flex items-center gap-3 rounded-lg bg-[#00b7eb] px-4 py-3 text-sm font-bold text-[#00112b] transition-colors hover:bg-white"
              >
                <Camera size={16} /> Nova Inspeção
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/60 transition-colors hover:bg-red-900/40 hover:text-red-400"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop — closes mobile menu when clicking outside */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          aria-hidden="true"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <main id="main-content" tabIndex={-1} className="container mx-auto max-w-6xl p-6">
        {children}
      </main>
    </div>
  );
}

export default Layout;
