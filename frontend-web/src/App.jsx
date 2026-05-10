// frontend-web/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BuscarVeiculos from './pages/BuscarVeiculos';
import UploadFotos from './pages/UploadFotos';
import { Camera } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#00112b]">
        {/* Menu de Navegação */}
        <nav className="bg-[#002b45] border-b border-[#33ccff]/30 px-6 py-3">
          <div className="container mx-auto max-w-6xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#00b7eb] w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-[#00112b] font-bold">C</span>
              </div>
              <span className="font-bold text-white">CHECAR FROTA</span>
            </div>
            <div className="flex gap-4">
              <Link 
                to="/veiculos" 
                className="px-4 py-2 rounded-full hover:bg-[#0052cc] transition-colors"
              >
                📋 Veículos
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

        {/* Rotas da Aplicação */}
        <Routes>
          <Route path="/" element={<BuscarVeiculos />} />
          <Route path="/veiculos" element={<BuscarVeiculos />} />
          <Route path="/upload" element={<UploadFotos />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;