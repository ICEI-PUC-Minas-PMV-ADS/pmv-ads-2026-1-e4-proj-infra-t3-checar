import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ChevronLeft } from 'lucide-react';

const BuscarVeiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Integração com o Backend (Node + MongoDB Atlas)
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        
        // Usando o endpoint correto que funciona
        const response = await axios.get('/api/vehicles');
        
        console.log('Dados recebidos da API:', response.data);
        
        // A API retorna { status: "success", count: 6, data: [...] }
        const dadosVeiculos = response.data?.data || [];
        
        // Formata os dados para o formato esperado pelo frontend
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
        
        console.log('Veículos formatados:', veiculosFormatados);
        setVeiculos(veiculosFormatados);
        
      } catch (error) {
        console.error("Erro detalhado ao conectar com o banco:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        });
        
        setVeiculos([]);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarDados();
  }, []);

  // Lógica de busca em tempo real
  const veiculosFiltrados = veiculos.filter(v => 
    v.placa?.toLowerCase().includes(busca.toLowerCase()) ||
    v.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#00112b] text-white flex justify-center font-sans">
      <div className="w-full max-w-2xl p-5 flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center relative mb-6">
          <button className="absolute left-0 top-1 hover:opacity-70 transition-opacity cursor-pointer">
            <ChevronLeft size={28} />
          </button>
          <div className="bg-[#002b45] rounded-full px-5 py-1 text-[10px] uppercase border border-[#003d5c] mb-2 font-bold tracking-widest">
            Controle da Frota
          </div>
          <h1 className="text-2xl font-semibold">
            Gestão de <span className="text-[#00b7eb]">Veículos</span>
          </h1>
        </div>

        {/* Campo de Busca */}
        <div className="relative mb-8 px-2">
          <input
            type="text"
            placeholder="Buscar por placa ou modelo.."
            className="w-full bg-[#0099cc] rounded-full py-3 px-6 text-white placeholder-blue-100 focus:outline-none text-md shadow-lg border-2 border-transparent focus:border-white/30 transition-all cursor-text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#00112b] p-2 rounded-full border border-[#0099cc] shadow-md cursor-pointer hover:bg-[#003d5c] transition-colors">
            <Search size={18} className="text-white" />
          </div>
        </div>

        {/* Contador de resultados */}
        {!carregando && veiculos.length > 0 && (
          <div className="text-xs text-center mb-2 opacity-60">
            {veiculosFiltrados.length} de {veiculos.length} veículo(s)
          </div>
        )}

        {/* Lista de Veículos */}
        <div className="flex flex-col gap-4 overflow-y-auto pb-10" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {carregando ? (
            <div className="text-center py-10 opacity-50 animate-pulse">
              <div className="mb-2">🔍</div>
              Acessando banco de dados...
            </div>
          ) : veiculosFiltrados.length > 0 ? (
            veiculosFiltrados.map((veiculo) => (
              <div 
                key={veiculo._id} 
                // Adicionado cursor-pointer para indicar que é clicável
                className="bg-[#0052cc] border-2 border-white rounded-[2.2rem] p-4 flex items-center shadow-xl relative overflow-hidden transition-all duration-200 hover:shadow-2xl hover:border-[#33ccff] cursor-pointer"
                onClick={() => {
                  // Aqui você pode adicionar a ação ao clicar no card
                  console.log('Veículo clicado:', veiculo);
                  // Exemplo: navegar para detalhes do veículo
                  // window.location.href = `/veiculo/${veiculo._id}`;
                }}
              >
                {/* Indicador lateral de status */}
                <div className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-md ${
                  veiculo.status === 'OK' ? 'bg-green-400' : 'bg-red-500'
                }`}></div>

                {/* Foto do Veículo */}
                <div className="bg-white rounded-2xl p-1 w-32 h-20 flex items-center justify-center border-2 border-[#33ccff] mr-4 shrink-0 shadow-inner overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                  <img 
                    src={veiculo.fotoUrl || 'https://via.placeholder.com/150?text=Sem+Foto'} 
                    alt={veiculo.nome}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Sem+Foto';
                    }}
                  />
                </div>

                {/* Informações principais */}
                <div className="flex-1 min-w-0 cursor-pointer">
                  <h2 className="text-lg font-bold uppercase leading-tight break-words hover:text-[#00b7eb] transition-colors">
                    {veiculo.nome}
                  </h2>
                  <p className="text-md font-bold tracking-widest opacity-95 font-mono">
                    {veiculo.placa}
                  </p>
                  {veiculo.ano && (
                    <p className="text-xs opacity-70 mt-1">
                      {veiculo.ano} • {veiculo.quilometragem?.toLocaleString()} km
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="text-right shrink-0 ml-3">
                  <span className="block text-[9px] font-bold uppercase opacity-70">Status:</span>
                  <span className={`text-xs font-black px-3 py-1 rounded whitespace-nowrap ${
                    veiculo.status === 'ALERTA' 
                      ? 'bg-red-500 text-white animate-pulse cursor-pointer hover:bg-red-600 transition-colors' 
                      : 'bg-green-500 text-white cursor-pointer hover:bg-green-600 transition-colors'
                  }`}>
                    {veiculo.status || 'OK'}
                  </span>
                  {veiculo.observacao && veiculo.status === 'ALERTA' && (
                    <p className="text-[8px] opacity-70 mt-1 max-w-[100px] truncate cursor-help" title={veiculo.observacao}>
                      {veiculo.observacao}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 opacity-40">
              <div className="text-4xl mb-2">🚗</div>
              Nenhum veículo encontrado.
              {busca && <div className="text-xs mt-2">Tente outra busca</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuscarVeiculos;