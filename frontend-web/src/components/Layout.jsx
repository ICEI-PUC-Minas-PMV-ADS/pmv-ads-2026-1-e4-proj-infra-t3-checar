// src/components/Layout.jsx
import { Link } from 'react-router-dom';
import { Camera, Car, LayoutGrid } from 'lucide-react';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#00112b] text-white">
      {/* Navbar Global */}
      <nav className="bg-[#002b45] border-b border-[#33ccff]/30 px-6 py-3">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          
          {/* Logo como Link para Autenticação */}
          <Link 
            to="/login" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Ir para página de autenticação"
          >
            <div className="bg-[#00b7eb] w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-[#00112b] font-bold">C</span>
            </div>
            <span className="font-bold text-white uppercase tracking-wider text-lg">
              C h e c a r
            </span>
          </Link>

          {/* Navegação Principal */}
          <div className="flex gap-4 items-center">
            <Link 
              to="/veiculos" 
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#0052cc] transition-colors"
            >
              <Car size={18} />
              Veículos
            </Link>
            
            <Link 
              to="/modelos" 
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#0052cc] transition-colors"
            >
              <LayoutGrid size={18} />
              Modelos
            </Link>
            
            <Link 
              to="/upload" 
              className="bg-[#00b7eb] text-[#00112b] px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white transition-colors"
            >
              <Camera size={16} />
              Nova Inspeção
            </Link>
          </div>
        </div>
      </nav>

      {/* Área de Conteúdo Dinâmico */}
      <main className="container mx-auto max-w-6xl p-6">
        {children}
      </main>
    </div>
  );
}

export default Layout;