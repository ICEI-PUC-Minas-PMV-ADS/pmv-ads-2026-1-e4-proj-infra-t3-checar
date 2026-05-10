import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, Car } from 'lucide-react';

const BuscarVeiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const response = await axios.get('/api/vehicles');
        const dadosVeiculos = response.data?.data || [];
        
        const veiculosFormatados = dadosVeiculos.map(veiculo => ({
          _id: veiculo._id,
          nome: veiculo.model,
          placa: veiculo.plate,
          status: veiculo.operationalStatus === 'active' ? 'OK' : 'ALERTA',
          ano: veiculo.year,
          quilometragem: veiculo.mileage,
          fotoUrl: null,
          observacao: veiculo.observation
        }));
        
        setVeiculos(veiculosFormatados);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setVeiculos([]);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, []);

  const veiculosFiltrados = veiculos.filter(v => 
    v.placa?.toLowerCase().includes(busca.toLowerCase()) ||
    v.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#00112b] text-white font-sans antialiased selection:bg-[#00b7eb]/30">
      <div className="w-full max-w-2xl mx-auto p-4 md:p-6 flex flex-col h-screen">
        
        {/* Cabeçalho Compacto */}
        <header className="flex flex-col items-center relative mb-6 shrink-0">
          <button className="absolute left-0 top-1 p-2 hover:bg-white/10 rounded-full transition-all">
            <ChevronLeft size={24} />
          </button>
          <span className="bg-[#002b45] px-3 py-0.5 rounded-full text-[9px] uppercase border border-[#003d5c] mb-1 font-bold tracking-[0.2em] text-[#00b7eb]">
            Controle de Frota
          </span>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Gestão de <span className="text-[#00b7eb]">Veículos</span>
          </h1>
        </header>

        {/* Busca Otimizada */}
        <div className="relative mb-6 shrink-0">
          <input
            type="text"
            placeholder="Placa ou modelo..."
            className="w-full bg-[#0099cc]/20 rounded-2xl py-3.5 pl-5 pr-14 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-[#00b7eb] border border-white/10 transition-all backdrop-blur-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#00b7eb] p-2.5 rounded-xl shadow-lg shadow-[#00b7eb]/20">
            <Search size={18} className="text-white" />
          </div>
        </div>

        {/* Listagem com Scroll Suave */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {!carregando && (
            <p className="text-[10px] uppercase tracking-widest opacity-40 mb-4 ml-1">
              {veiculosFiltrados.length} resultados encontrados
            </p>
          )}

          <div className="flex flex-col gap-3.5">
            {carregando ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40 animate-pulse">
                <div className="w-12 h-12 border-4 border-t-[#00b7eb] border-white/10 rounded-full animate-spin mb-4"></div>
                <span className="text-sm font-medium">Sincronizando dados...</span>
              </div>
            ) : veiculosFiltrados.length > 0 ? (
              veiculosFiltrados.map((veiculo) => (
                <div 
                  key={veiculo._id} 
                  className="group bg-gradient-to-r from-[#0052cc] to-[#0041a3] rounded-3xl p-3 md:p-4 flex items-center gap-4 border border-white/10 hover:border-[#00b7eb]/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                >
                  {/* Foto/Ícone */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shrink-0 overflow-hidden flex items-center justify-center shadow-inner border border-white/20">
                    {veiculo.fotoUrl ? (
                      <img src={veiculo.fotoUrl} alt={veiculo.nome} className="object-cover w-full h-full" />
                    ) : (
                      <Car className="text-[#00112b]/20 w-10 h-10" />
                    )}
                    <div className={`absolute top-0 left-0 w-1 h-full ${veiculo.status === 'OK' ? 'bg-green-400' : 'bg-red-500'}`} />
                  </div>

                  {/* Infos Principais - Tamanho Reduzido para Caber */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm md:text-base font-black leading-tight uppercase truncate group-hover:text-[#00b7eb] transition-colors">
                      {veiculo.nome}
                    </h2>
                    <p className="text-xs md:text-sm font-mono font-bold text-[#00b7eb] tracking-tighter">
                      {veiculo.placa}
                    </p>
                    <div className="flex flex-wrap gap-x-2 mt-1 opacity-60 text-[10px] md:text-xs">
                      <span>{veiculo.ano}</span>
                      <span>•</span>
                      <span>{veiculo.quilometragem?.toLocaleString()} km</span>
                    </div>
                  </div>

                  {/* Status Minimalista */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter uppercase ${
                      veiculo.status === 'ALERTA' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                        : 'bg-green-500/20 text-green-400 border border-green-500/50'
                    }`}>
                      {veiculo.status}
                    </div>
                    {veiculo.observacao && veiculo.status === 'ALERTA' && (
                      <span className="text-[9px] text-red-300/70 mt-1 max-w-[80px] truncate text-right italic">
                        {veiculo.observacao}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <div className="text-3xl mb-2 grayscale opacity-50">🚜</div>
                <p className="text-sm opacity-50">Nenhum veículo na frota.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default BuscarVeiculos;