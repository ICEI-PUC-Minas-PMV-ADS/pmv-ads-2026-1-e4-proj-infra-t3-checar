import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import api from '../services/api';

const sortByOrder = (a, b) => (a.ordem || 0) - (b.ordem || 0);
const isActive = (item) => item.ativo !== false;

const mapModeloToSections = (modeloChecklist) => {
  const secoes = modeloChecklist?.secoes || [];
  return secoes
    .filter(isActive)
    .sort(sortByOrder)
    .map((secao) => ({
      id: secao._id || secao.titulo,
      title: secao.titulo,
      description: secao.descricao || '',
      items: (secao.campos || [])
        .filter(isActive)
        .sort(sortByOrder)
        .map((campo) => ({
          id: campo._id || `${secao.titulo}-${campo.nome}`,
          label: campo.nome,
          status: 'Conforme',
        })),
    }));
};

function ChecklistExecution() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { modeloId } = useParams();

  // State may come from navigation OR we load it from the API by modeloId
  const [vehicleId,      setVehicleId]      = useState(location.state?.vehicleId || null);
  const [vehicle,        setVehicle]        = useState(location.state?.vehicle   || null);
  const [modeloChecklist, setModeloChecklist] = useState(location.state?.modeloChecklist || null);
  const usuarioId = location.state?.usuarioId || null;

  const [pageLoading,  setPageLoading]  = useState(!modeloChecklist);
  const [statusByItem, setStatusByItem] = useState({});
  const [notes,        setNotes]        = useState({});
  const [visibleNotes, setVisibleNotes] = useState({});
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState({ type: '', text: '' });

  // Load modelo from API if not passed via state (e.g. direct URL access / page refresh)
  useEffect(() => {
    if (modeloChecklist) {
      setPageLoading(false);
      return;
    }
    if (!modeloId) {
      setPageLoading(false);
      return;
    }

    const loadModelo = async () => {
      try {
        const res = await api.get(`/modelochecklists/${modeloId}`);
        setModeloChecklist(res.data);
      } catch {
        // modelo not found — will show "select modelo" screen
      } finally {
        setPageLoading(false);
      }
    };
    loadModelo();
  }, [modeloId, modeloChecklist]);

  const sections = useMemo(() =>
    mapModeloToSections(modeloChecklist).map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        status: statusByItem[item.id] || item.status,
      })),
    })),
  [modeloChecklist, statusByItem]);

  const allItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const handleStatusChange = (itemId, status) => {
    setStatusByItem((cur) => ({ ...cur, [itemId]: status }));
  };

  const handleNoteChange = (itemId, value) => {
    setNotes((cur) => ({ ...cur, [itemId]: value }));
  };

  const showNote = (itemId) => {
    setVisibleNotes((cur) => ({ ...cur, [itemId]: true }));
  };

  const handleSave = async () => {
    if (!modeloChecklist || allItems.length === 0) {
      setMessage({ type: 'error', text: 'Selecione um modelo com itens antes de salvar.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const isConforme = allItems.every((item) => item.status === 'Conforme');

      // 1 — Create checklist header
      const checklistPayload = {
        data: new Date().toISOString(),
        conformidade: isConforme,
        observacao: Object.values(notes).filter(Boolean).join('\n'),
        status: isConforme ? ['disponivel'] : ['com problema'],
        modeloId: modeloChecklist._id,
        ...(vehicleId  ? { veiculoId:  vehicleId  } : {}),
        ...(usuarioId  ? { usuarioId:  usuarioId  } : {}),
      };

      const checklistRes = await api.post('/checklists', checklistPayload);
      const checklistId  = checklistRes.data._id;

      // 2 — Save all items sequentially to avoid overwhelming the server
      for (const item of allItems) {
        await api.post('/itemchecklists', {
          checklistId,
          descricao: item.label,
          status: item.status,
          ...(notes[item.id]?.trim() ? { observacao: notes[item.id].trim() } : {}),
        });
      }

      setMessage({ type: 'success', text: 'Inspeção registrada com sucesso!' });
      // Redirect to vehicles after short delay
      setTimeout(() => navigate('/veiculos'), 2000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Falha ao registrar checklist: ${err.response?.data?.erro || err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-3xl place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00b7eb] border-t-transparent" />
      </section>
    );
  }

  if (!modeloChecklist) {
    return (
      <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-3xl place-items-center text-center">
        <div className="rounded-lg border border-white/20 bg-[#004aad] p-8">
          <h1 className="text-2xl font-bold">Nenhum modelo selecionado</h1>
          <p className="mt-3 text-white/80">Escolha um modelo antes de iniciar o checklist.</p>
          <Link
            to="/modelos"
            className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#00b4d8] px-5 font-extrabold text-[#001233]"
          >
            Selecionar modelo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 pb-24">
      <header className="border-b border-white/10 pb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-3xl font-bold">
          Checklist <span className="text-[#00b4d8]">em andamento</span>
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-base text-white/90">
          <span><strong className="text-[#00b4d8]">Veículo</strong> {vehicle?.model || '-'}</span>
          <span><strong className="text-[#00b4d8]">Placa</strong> {vehicle?.plate || '-'}</span>
          <span><strong className="text-[#00b4d8]">Modelo</strong> {modeloChecklist.nome}</span>
        </div>
      </header>

      {message.text && (
        <p className={`rounded-lg border px-4 py-3 ${
          message.type === 'success'
            ? 'border-green-500/50 bg-green-950/40 text-green-100'
            : 'border-red-500/50 bg-red-950/40 text-red-100'
        }`}>
          {message.text}
        </p>
      )}

      <div className="grid gap-5">
        {sections.map((section) => (
          <section key={section.id} className="rounded-lg border border-white/60 bg-[#004aad] p-5">
            <h2 className="text-2xl font-extrabold text-[#00b4d8]">{section.title}</h2>
            {section.description && <p className="mt-2 text-white/80">{section.description}</p>}

            <div className="mt-5 grid gap-5">
              {section.items.map((item) => (
                <div key={item.id} className="grid gap-3 border-b border-white/10 pb-5 last:border-0 last:pb-0">
                  <div className="grid gap-3 md:grid-cols-[1fr_minmax(280px,360px)] md:items-center">
                    <span className="text-lg text-white">{item.label}</span>
                    <div className="grid min-h-11 grid-cols-2 overflow-hidden rounded-lg border-2 border-[#00b4d8]">
                      {['Conforme', 'Nao Conforme'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(item.id, status)}
                          disabled={loading}
                          className={`px-3 text-sm font-bold transition ${
                            item.status === status
                              ? 'bg-[#00b4d8] text-[#001233]'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          {status === 'Conforme' ? 'Conforme' : 'Não conforme'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {visibleNotes[item.id] ? (
                    <input
                      type="text"
                      value={notes[item.id] || ''}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                      disabled={loading}
                      placeholder="Adicione observações"
                      className="min-h-11 rounded-lg border-2 border-[#00b4d8] bg-[#001233] px-4 text-white outline-none placeholder:text-white/45"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => showNote(item.id)}
                      disabled={loading}
                      className="inline-flex w-fit min-h-9 items-center gap-2 text-sm font-bold text-[#5bc4f1]"
                    >
                      Adicionar observação
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#001233] px-5 py-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7a0800] px-4 font-bold text-white disabled:opacity-60"
          >
            <X size={20} /> Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#00b4d8] px-4 font-extrabold text-[#001233] disabled:opacity-60"
          >
            <Save size={20} />
            {loading ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </footer>
    </section>
  );
}

export default ChecklistExecution;
