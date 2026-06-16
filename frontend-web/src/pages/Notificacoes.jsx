import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Bell, Info, ChevronLeft, ChevronRight, CheckCheck, Loader2 } from 'lucide-react';
import api from '../services/api';
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function IconeTipo({ tipo }) {
  if (tipo === 'FALHA_CRITICA')
    return <AlertTriangle size={18} className="text-red-400 shrink-0" />;
  if (tipo === 'ALERTA')
    return <Bell size={18} className="text-yellow-400 shrink-0" />;
  return <Info size={18} className="text-[#00b7eb] shrink-0" />;
}

const limit = 20;

function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const carregar = useCallback(async (novaPagina = 1) => {
    setLoading(true);
    setErro('');
    try {
      const res = await api.get('/notificacoes', { params: { page: novaPagina, limit } });
      const { data, total: tot, totalPages: tp } = res.data;
      setNotificacoes(data ?? []);
      setTotal(tot ?? 0);
      setTotalPages(tp ?? 1);
      setPage(novaPagina);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar notificações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar(1);
  }, [carregar]);

  const marcarLida = async (id) => {
    try {
      await api.patch(`/notificacoes/${id}/lida`);
      await carregar(page);
    } catch {
      // silencioso — usuário pode clicar novamente
    }
  };

  const marcarTodasLidas = async () => {
    setMarcandoTodas(true);
    try {
      await api.patch('/notificacoes/lida/todas');
      await carregar(page);
    } catch (err) {
      setErro(err.message || 'Erro ao marcar todas como lidas.');
    } finally {
      setMarcandoTodas(false);
    }
  };

  const irPagina = (p) => {
    if (p < 1 || p > totalPages) return;
    carregar(p);
  };

  const naoPaginas = total === 0 && !loading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notificações</h1>
          <p className="mt-1 text-sm text-white/50">
            {total > 0 ? `${total} notificação(ões) no total` : 'Acompanhe os alertas do sistema.'}
          </p>
        </div>
        <button
          onClick={marcarTodasLidas}
          disabled={marcandoTodas || naoPaginas}
          aria-label="Marcar todas as notificações como lidas"
          className="flex items-center gap-2 rounded-lg border border-[#33ccff]/30 px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-[#0052cc]/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {marcandoTodas ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CheckCheck size={15} />
          )}
          Marcar todas como lidas
        </button>
      </div>

      {/* Erro */}
      <div aria-live="polite">
        {erro && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertTriangle size={16} /> {erro}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div role="status" aria-busy="true" className="flex items-center justify-center py-20 text-white/50">
          <Loader2 size={28} className="animate-spin mr-3" aria-hidden="true" />
          Carregando...
        </div>
      )}

      {/* Lista vazia */}
      {!loading && naoPaginas && !erro && (
        <div className="rounded-xl border border-[#33ccff]/20 bg-[#002b45]/50 py-20 text-center">
          <Bell size={40} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">Nenhuma notificação</p>
        </div>
      )}

      {/* Lista de notificações */}
      {!loading && notificacoes.length > 0 && (
        <ul role="list" className="space-y-2" aria-label="Lista de notificações">
          {notificacoes.map((n) => (
            <li key={n._id} role="listitem">
              <button
                onClick={() => !n.lida && marcarLida(n._id)}
                aria-label={`Notificação ${n.tipo ?? 'INFO'}: ${n.mensagem ?? ''}. ${n.lida ? 'Lida' : 'Não lida'}`}
                className={`w-full text-left rounded-xl border px-5 py-4 transition-colors ${
                  n.lida
                    ? 'border-[#33ccff]/15 bg-[#002b45]/30 cursor-default'
                    : 'border-[#33ccff]/40 bg-[#002b45]/70 hover:bg-[#0052cc]/20 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <IconeTipo tipo={n.tipo} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm ${n.lida ? 'text-white/50' : 'text-white font-medium'}`}>
                        {n.mensagem}
                      </p>
                      {!n.lida && (
                        <span className="inline-flex items-center rounded-full bg-[#00b7eb]/20 px-2 py-0.5 text-xs font-bold text-[#00b7eb]">
                          Nova
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-white/30">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
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
    </div>
  );
}

export default Notificacoes;
