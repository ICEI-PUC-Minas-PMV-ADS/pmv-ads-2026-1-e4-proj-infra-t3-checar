import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList, Plus, Search } from 'lucide-react';
import api from '../services/api';

function ModeloChecklistSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const isChecklistFlow = Boolean(vehicleId);

  const [vehicle,  setVehicle]  = useState(null);
  const [modelos,  setModelos]  = useState([]);
  const [busca,    setBusca]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    let mounted = true;

    const carregarDados = async () => {
      try {
        setLoading(true);
        setError('');

        const [modelosRes, vehicleRes] = await Promise.all([
          api.get('/modelochecklists', { params: { ativo: 'true' } }),
          vehicleId ? api.get(`/vehicles/${vehicleId}`) : Promise.resolve(null),
        ]);

        if (!mounted) return;

        setModelos(modelosRes.data || []);
        // vehicleController returns { status, data: vehicle }
        setVehicle(vehicleRes?.data?.data || vehicleRes?.data || null);
      } catch (err) {
        if (mounted) {
          setError(`Falha ao carregar modelos: ${err.response?.data?.erro || err.message}`);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregarDados();
    return () => { mounted = false; };
  }, [vehicleId]);

  const modelosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return modelos;
    return modelos.filter((m) =>
      [m.nome, m.tipo, m.descricao]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(termo))
    );
  }, [busca, modelos]);

  const selecionarModelo = (modelo) => {
    if (isChecklistFlow) {
      // vehicleId goes in the URL so it survives page refresh — vehicle and modelo
      // are passed via state as a fast-path (avoids extra API calls on navigation)
      navigate(`/checklist/${modelo._id}?vehicleId=${vehicleId}`, {
        state: { vehicle, modeloChecklist: modelo },
      });
      return;
    }
    navigate(`/modelos/${modelo._id}`);
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-4xl flex-col gap-6">
      <header className="border-b border-white/10 pb-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div />
          {!isChecklistFlow && (
            <Link
              to="/modelos/novo"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#00b4d8] bg-[#004aad] px-4 text-sm font-bold text-white transition hover:bg-[#0057c2]"
            >
              <Plus size={18} /> Criar modelo
            </Link>
          )}
        </div>

        <h1 className="text-3xl font-bold">
          {isChecklistFlow ? 'Escolha o ' : 'Modelos '}
          <span className="text-[#00b4d8]">{isChecklistFlow ? 'Modelo' : 'de Checklist'}</span>
        </h1>
        <p className="mt-2 text-white/75">
          {isChecklistFlow
            ? `Veículo: ${vehicle?.model || '-'} | Placa: ${vehicle?.plate || '-'}`
            : 'Selecione um modelo para editar ou crie um novo.'}
        </p>
      </header>

      <div className="relative">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, tipo ou descrição"
          className="min-h-12 w-full rounded-lg border border-[#00b4d8] bg-[#004aad] px-4 pr-12 text-white outline-none placeholder:text-white/50 focus:ring-2 focus:ring-[#00b4d8]"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5bc4f1]" size={20} />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-3 text-red-100">{error}</p>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center text-white/70">
          Carregando modelos…
        </div>
      ) : (
        <div className="grid gap-4">
          {modelosFiltrados.map((modelo) => (
            <button
              key={modelo._id}
              type="button"
              onClick={() => selecionarModelo(modelo)}
              aria-label={`Selecionar modelo ${modelo.nome}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-white/60 bg-[#004aad] p-4 text-left transition hover:border-[#00b4d8] hover:bg-[#0057c2]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#00b4d8] text-white">
                <ClipboardList size={24} />
              </span>
              <span className="min-w-0">
                <span className="block text-xl font-extrabold text-white">{modelo.nome}</span>
                <span className="mt-1 block text-sm font-bold text-[#5bc4f1]">
                  {modelo.tipo === 'Diario' ? 'Diário' : modelo.tipo} | {modelo.secoes?.length || 0} seções
                </span>
                {modelo.descricao && (
                  <span className="mt-2 block text-sm leading-5 text-white/80">{modelo.descricao}</span>
                )}
              </span>
              <span className="text-2xl text-white/80">›</span>
            </button>
          ))}

          {modelosFiltrados.length === 0 && (
            <div className="rounded-lg border border-dashed border-white/25 px-4 py-12 text-center text-white/70">
              Nenhum modelo encontrado.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ModeloChecklistSelection;
