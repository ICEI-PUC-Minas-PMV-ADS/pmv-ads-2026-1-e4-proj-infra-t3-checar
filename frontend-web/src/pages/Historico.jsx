import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Camera, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { extractList, extractPageMeta } from '../utils/apiPayload';

const TABS = ['Inspeções', 'Checklists'];

function BadgeConformidade({ valor }) {
  if (!valor) return <span className="text-white/40">—</span>;
  const conforme = valor === 'Conforme' || valor === true || valor === 'true';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        conforme
          ? 'bg-green-500/20 text-green-400'
          : 'bg-red-500/20 text-red-400'
      }`}
    >
      {conforme ? 'Conforme' : 'Não Conforme'}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Historico() {
  const [tabAtiva, setTabAtiva] = useState(0);

  // Filtros comuns
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtros Inspeções
  const [placaInsp, setPlacaInsp] = useState('');

  // Filtros Checklists
  const [veiculoId, setVeiculoId] = useState('');
  const [conformidade, setConformidade] = useState('');

  // Estado de resultado
  const [resultados, setResultados] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [buscado, setBuscado] = useState(false);

  const buscar = async (novaPagina = 1) => {
    setLoading(true);
    setErro('');
    setBuscado(true);
    try {
      let res;
      if (tabAtiva === 0) {
        // Inspeções
        const params = { page: novaPagina, limit };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const placa = placaInsp.trim().toUpperCase();
        if (!placa) {
          setErro('Informe a placa para buscar inspeções.');
          setLoading(false);
          return;
        }
        res = await api.get(`/inspecoes/historico/${placa}`, { params });
      } else {
        // Checklists
        const params = { page: novaPagina, limit };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (veiculoId.trim()) params.veiculoId = veiculoId.trim();
        if (conformidade) params.conformidade = conformidade;
        res = await api.get('/checklists/historico', { params });
      }
      const { data, total: tot, totalPages: tp } = extractPageMeta(res.data);
      setResultados(data);
      setTotal(tot);
      setTotalPages(tp);
      setPage(novaPagina);
    } catch (err) {
      setErro(err.message || 'Erro ao buscar histórico.');
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    buscar(1);
  };

  const irPagina = (p) => {
    if (p < 1 || p > totalPages) return;
    buscar(p);
  };

  // Resetar resultados ao trocar de aba
  const trocarTab = (idx) => {
    setTabAtiva(idx);
    setResultados([]);
    setTotal(0);
    setPage(1);
    setTotalPages(1);
    setErro('');
    setBuscado(false);
    setVeiculoId('');
    setConformidade('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Histórico</h1>
        <p className="mt-1 text-sm text-white/50">Consulte o histórico de inspeções e checklists.</p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Tipo de histórico"
        className="flex gap-1 rounded-xl border border-[#33ccff]/20 bg-[#002b45]/50 p-1 w-fit"
      >
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            role="tab"
            aria-selected={tabAtiva === idx}
            onClick={() => trocarTab(idx)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              tabAtiva === idx
                ? 'bg-[#0052cc] text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <form
        role="tabpanel"
        onSubmit={handleSubmit}
        className="rounded-xl border border-[#33ccff]/30 bg-[#002b45]/50 p-5 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tabAtiva === 0 && (
            <div className="space-y-1">
              <label className="text-xs text-white/60" htmlFor="filtro-placa">Placa</label>
              <input
                id="filtro-placa"
                type="text"
                value={placaInsp}
                onChange={(e) => setPlacaInsp(e.target.value)}
                placeholder="Ex: ABC1234"
                aria-label="Filtrar por placa"
                className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#00b7eb] transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-white/60" htmlFor="filtro-data-inicio">Data início</label>
            <input
              id="filtro-data-inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Data de início"
              className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-3 py-2 text-sm text-white outline-none focus:border-[#00b7eb] transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/60" htmlFor="filtro-data-fim">Data fim</label>
            <input
              id="filtro-data-fim"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Data de fim"
              className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-3 py-2 text-sm text-white outline-none focus:border-[#00b7eb] transition-colors [color-scheme:dark]"
            />
          </div>

          {tabAtiva === 1 && (
            <div className="space-y-1">
              <label className="text-xs text-white/60" htmlFor="filtro-veiculo-id">ID do veículo</label>
              <input
                id="filtro-veiculo-id"
                type="text"
                value={veiculoId}
                onChange={(e) => setVeiculoId(e.target.value)}
                placeholder="Cole o ID copiado da busca"
                aria-label="Filtrar por ID do veículo"
                className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#00b7eb] transition-colors font-mono"
              />
            </div>
          )}

          {tabAtiva === 1 && (
            <div className="space-y-1">
              <label className="text-xs text-white/60" htmlFor="filtro-conformidade">Conformidade</label>
              <select
                id="filtro-conformidade"
                value={conformidade}
                onChange={(e) => setConformidade(e.target.value)}
                aria-label="Filtrar por conformidade"
                className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-3 py-2 text-sm text-white outline-none focus:border-[#00b7eb] transition-colors"
              >
                <option value="">Todos</option>
                <option value="Conforme">Conforme</option>
                <option value="Não Conforme">Não Conforme</option>
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          aria-label="Botão buscar"
          className="flex items-center gap-2 rounded-lg bg-[#0052cc] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00b7eb] hover:text-[#00112b]"
        >
          <Search size={15} />
          Buscar
        </button>
      </form>

      {/* Erro */}
      {erro && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={16} /> {erro}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div role="status" className="flex items-center justify-center py-16 text-white/50">
          <Loader2 size={28} className="animate-spin mr-3" aria-hidden="true" />
          Carregando...
        </div>
      )}

      {/* Resultados */}
      {!loading && buscado && !erro && (
        <>
          <div className="text-xs text-white/40 px-1">{total} resultado(s) encontrado(s)</div>

          {resultados.length === 0 ? (
            <div role="status" className="rounded-xl border border-[#33ccff]/20 bg-[#002b45]/50 py-16 text-center text-white/40">
              Nenhum resultado encontrado.
            </div>
          ) : (
            <div className="rounded-xl border border-[#33ccff]/30 bg-[#002b45]/50 overflow-hidden">
              <table
                className="w-full text-sm"
                aria-label={tabAtiva === 0 ? 'Histórico de inspeções' : 'Histórico de checklists'}
              >
                <thead>
                  <tr className="border-b border-[#33ccff]/20 text-white/50 text-xs uppercase tracking-wider">
                    {tabAtiva === 0 ? (
                      <>
                        <th scope="col" className="px-4 py-3 text-left">Placa</th>
                        <th scope="col" className="px-4 py-3 text-left">Data</th>
                        <th scope="col" className="px-4 py-3 text-left">Fotos</th>
                        <th scope="col" className="px-4 py-3 text-left">Ações</th>
                      </>
                    ) : (
                      <>
                        <th scope="col" className="px-4 py-3 text-left">Data</th>
                        <th scope="col" className="px-4 py-3 text-left">Veículo</th>
                        <th scope="col" className="px-4 py-3 text-left">Conformidade</th>
                        <th scope="col" className="px-4 py-3 text-left">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#33ccff]/10">
                  {resultados.map((item) => (
                    <tr key={item._id} className="hover:bg-[#0052cc]/10 transition-colors">
                      {tabAtiva === 0 ? (
                        <>
                          <td className="px-4 py-3 font-mono font-semibold text-[#00b7eb]">
                            {item.placa ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-white/70">{formatDate(item.createdAt ?? item.data)}</td>
                          <td className="px-4 py-3 text-white/70">
                            <span className="flex items-center gap-1.5">
                              <Camera size={14} className="text-white/40" />
                              {Object.values(item.fotos || {}).filter(Boolean).length || item.qtdFotos || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={`/upload?placa=${item.placa ?? ''}`}
                              className="text-xs text-[#00b7eb] hover:underline"
                            >
                              Ver fotos
                            </a>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-white/70">{formatDate(item.createdAt ?? item.data)}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-[#00b7eb]">
                            {item.veiculo?.placa ?? item.placa ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <BadgeConformidade valor={item.conformidade} />
                          </td>
                          <td className="px-4 py-3 text-white/60 capitalize">
                            {item.status ?? '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => irPagina(page - 1)}
                disabled={page <= 1}
                aria-label="Página anterior"
                className="flex items-center gap-1 rounded-lg border border-[#33ccff]/30 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-[#0052cc]/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={15} /> Anterior
              </button>
              <span className="text-sm text-white/50">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => irPagina(page + 1)}
                disabled={page >= totalPages}
                aria-label="Próxima página"
                className="flex items-center gap-1 rounded-lg border border-[#33ccff]/30 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-[#0052cc]/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Próxima <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Historico;
