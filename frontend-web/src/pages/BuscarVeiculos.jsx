import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Car, Plus, RefreshCw, Copy, Check } from 'lucide-react';
import api from '../services/api';
import { extractList, getApiErrorMessage } from '../utils/apiPayload';

const BuscarVeiculos = () => {
  const navigate = useNavigate();
  const [veiculos, setVeiculos]   = useState([]);
  const [busca, setBusca]         = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]           = useState('');
  const [copiadoId, setCopiadoId] = useState(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await api.get('/vehicles');
      const dadosVeiculos = extractList(response.data);
      setVeiculos(dadosVeiculos.map((v) => ({
        _id: v._id,
        nome: v.model,
        placa: v.plate,
        status: v.operationalStatus === 'active' ? 'OK' : 'ALERTA',
        ano: v.year,
        quilometragem: v.mileage,
        observacao: v.observation,
      })));
    } catch (error) {
      const status = error.response?.status;
      console.error('[Checar] GET /api/vehicles falhou', {
        endpoint: '/api/vehicles',
        status: status ?? 'sem resposta (erro de rede)',
        data: error.response?.data,
        message: error.message,
      });
      setErro(getApiErrorMessage(error, 'Não foi possível carregar os veículos. Verifique a conexão.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const copiarId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiadoId(id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  const veiculosFiltrados = veiculos.filter((v) => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;
    const termoPlaca = termo.replace(/[^a-z0-9]/g, '');
    const termoId = termo.replace(/[^a-f0-9]/g, '');
    const placa = (v.placa || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const nome  = (v.nome  || '').toLowerCase();
    const id = (v._id || '').toLowerCase();
    return (
      (termoPlaca && placa.includes(termoPlaca))
      || nome.includes(termo)
      || (termoId && id.includes(termoId))
    );
  });

  return (
    <div className="min-h-screen bg-[#00112b] text-white font-sans antialiased">
      <div className="mx-auto flex h-screen max-w-2xl flex-col p-4 md:p-6">

        {/* Header */}
        <header className="relative mb-6 flex flex-col items-center shrink-0">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Buscar Veículo por <span className="text-[#00b7eb]">Placa</span>
          </h1>
          <Link
            to="/upload"
            className="absolute right-0 top-0 flex items-center gap-1 rounded-full bg-[#00b7eb] px-3 py-1.5 text-xs font-black text-[#00112b] hover:bg-white"
          >
            <Plus size={14} /> Novo
          </Link>
        </header>

        {/* Search */}
        <div className="relative mb-4 shrink-0">
          <input
            type="text"
            placeholder="Placa, modelo ou ID…"
            className="w-full rounded-2xl border border-white/10 bg-[#0099cc]/20 py-3.5 pl-5 pr-14 text-white placeholder-blue-300/50 backdrop-blur-sm transition focus:outline-none focus:ring-2 focus:ring-[#00b7eb]"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-[#00b7eb] p-2.5 shadow-lg">
            <Search size={18} className="text-white" />
          </div>
        </div>

        {/* Error */}
        {erro && !carregando && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300 flex items-start justify-between gap-3">
            <span>{erro}</span>
            <button
              onClick={carregarDados}
              className="flex shrink-0 items-center gap-1 rounded-md bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <RefreshCw size={12} /> Tentar novamente
            </button>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto pr-1">
          {!carregando && !erro && (
            <p className="mb-4 ml-1 text-[10px] uppercase tracking-widest opacity-40">
              {veiculosFiltrados.length} resultado(s) encontrado(s)
            </p>
          )}

          <div className="flex flex-col gap-3.5">
            {carregando ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-[#00b7eb] border-white/10" />
                <span className="text-sm font-medium">Sincronizando dados…</span>
              </div>
            ) : veiculosFiltrados.length > 0 ? (
              veiculosFiltrados.map((veiculo) => (
                <div
                  key={veiculo._id}
                  className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-[#0052cc] to-[#0041a3] p-3 shadow-lg transition-all duration-300 hover:border-[#00b7eb]/50 hover:scale-[1.01] active:scale-[0.99] md:p-4"
                >
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white shadow-inner md:h-24 md:w-24">
                    <Car className="h-10 w-10 text-[#00112b]/20" />
                    <div className={`absolute left-0 top-0 h-full w-1 ${veiculo.status === 'OK' ? 'bg-green-400' : 'bg-red-500'}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-black uppercase leading-tight transition-colors group-hover:text-[#00b7eb] md:text-base">
                      {veiculo.nome}
                    </h2>
                    <p className="font-mono text-xs font-bold tracking-tighter text-[#00b7eb] md:text-sm">
                      {veiculo.placa}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] uppercase tracking-wider opacity-40 shrink-0">ID</span>
                      <span className="font-mono text-[10px] opacity-70 truncate" title={veiculo._id}>
                        {veiculo._id}
                      </span>
                      <button
                        type="button"
                        onClick={() => copiarId(veiculo._id)}
                        className="shrink-0 rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-[#00b7eb]"
                        title="Copiar ID do veículo"
                        aria-label="Copiar ID do veículo"
                      >
                        {copiadoId === veiculo._id ? (
                          <Check size={12} className="text-green-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-2 text-[10px] opacity-60 md:text-xs">
                      <span>{veiculo.ano}</span>
                      <span>•</span>
                      <span>{veiculo.quilometragem?.toLocaleString()} km</span>
                    </div>
                    <Link
                      to={`/modelos?vehicleId=${veiculo._id}`}
                      className="mt-2 inline-flex rounded-lg bg-[#00b7eb] px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter text-[#00112b] transition-colors hover:bg-white"
                    >
                      Iniciar Checklist
                    </Link>
                  </div>

                  <div className="flex shrink-0 flex-col items-end">
                    <div className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter ${
                      veiculo.status === 'ALERTA'
                        ? 'animate-pulse border-red-500/50 bg-red-500/20 text-red-400'
                        : 'border-green-500/50 bg-green-500/20 text-green-400'
                    }`}>
                      {veiculo.status}
                    </div>
                    {veiculo.observacao && veiculo.status === 'ALERTA' && (
                      <span className="mt-1 max-w-[80px] truncate text-right text-[9px] italic text-red-300/70">
                        {veiculo.observacao}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-20 text-center">
                <p className="text-3xl opacity-50">🚜</p>
                <p className="mt-2 text-sm opacity-50">Nenhum veículo na frota.</p>
                <Link
                  to="/upload"
                  className="mt-4 inline-flex rounded-xl bg-[#00b7eb] px-4 py-2 text-sm font-black text-[#00112b]"
                >
                  + Cadastrar primeiro veículo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuscarVeiculos;
