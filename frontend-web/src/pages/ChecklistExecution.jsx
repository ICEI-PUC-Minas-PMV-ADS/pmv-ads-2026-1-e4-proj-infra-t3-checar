import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, X } from 'lucide-react';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleId = null, vehicle = null, modeloChecklist = null, usuarioId = null } = location.state || {};

  const [statusByItem, setStatusByItem] = useState({});
  const [notes, setNotes] = useState({});
  const [visibleNotes, setVisibleNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const sections = useMemo(() =>
    mapModeloToSections(modeloChecklist).map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        status: statusByItem[item.id] || item.status,
      })),
    })),
  [modeloChecklist, statusByItem]);

  const allItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);

  const conformity = useMemo(() => {
    if (allItems.length === 0) return 0;
    const conformingItems = allItems.filter((item) => item.status === 'Conforme').length;
    return Math.round((conformingItems / allItems.length) * 100);
  }, [allItems]);

  const handleStatusChange = (itemId, status) => {
    setStatusByItem((current) => ({ ...current, [itemId]: status }));
  };

  const handleNoteChange = (itemId, value) => {
    setNotes((current) => ({ ...current, [itemId]: value }));
  };

  const showNote = (itemId) => {
    setVisibleNotes((current) => ({ ...current, [itemId]: true }));
  };

  const createChecklist = async () => {
    const checklistData = {
      data: new Date().toISOString(),
      conformidade: allItems.every((item) => item.status === 'Conforme'),
      observacao: Object.values(notes).filter(Boolean).join('\n'),
      status: conformity === 100 ? ['disponivel'] : ['com problema'],
      modeloId: modeloChecklist?._id,
    };

    if (vehicleId) checklistData.veiculoId = vehicleId;
    if (usuarioId) checklistData.usuarioId = usuarioId;

    const response = await axios.post('/api/checklists', checklistData);
    return response.data._id;
  };

  const handleSave = async () => {
    if (!modeloChecklist || allItems.length === 0) {
      setMessage({ type: 'error', text: 'Selecione um modelo com itens antes de salvar.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const checklistId = await createChecklist();
      const itemsToSave = allItems.map((item) => {
        const payload = {
          checklistId,
          descricao: item.label,
          status: item.status,
        };

        if (notes[item.id]?.trim()) {
          payload.observacao = notes[item.id].trim();
        }

        return payload;
      });

      await Promise.all(
        itemsToSave.map((itemChecklist) => axios.post('/api/itemchecklists', itemChecklist))
      );
      setMessage({ type: 'success', text: 'Inspeção registrada com sucesso.' });
    } catch (err) {
      setMessage({ type: 'error', text: `Falha ao registrar checklist: ${err.response?.data?.erro || err.message}` });
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold tracking-normal">
          Checklist <span className="text-[#00b4d8]">em Andamento</span>
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-base text-white/90">
          <span>
            <strong className="text-[#00b4d8]">Veiculo</strong> {vehicle?.model || '-'}
          </span>
          <span>
            <strong className="text-[#00b4d8]">Placa</strong> {vehicle?.plate || '-'}
          </span>
          <span>
            <strong className="text-[#00b4d8]">Modelo</strong> {modeloChecklist.nome}
          </span>
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
                <div key={item.id} className="grid gap-3 border-b border-white/10 pb-5 last:border-b-0 last:pb-0">
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
                            item.status === status ? 'bg-[#00b4d8] text-[#001233]' : 'text-white hover:bg-white/10'
                          }`}
                        >
                          {status === 'Conforme' ? 'Conforme' : 'Nao conforme'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {visibleNotes[item.id] ? (
                    <input
                      type="text"
                      value={notes[item.id] || ''}
                      onChange={(event) => handleNoteChange(item.id, event.target.value)}
                      disabled={loading}
                      placeholder="Adicione observacoes"
                      className="min-h-11 rounded-lg border-2 border-[#00b4d8] bg-[#001233] px-4 text-white outline-none placeholder:text-white/45"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => showNote(item.id)}
                      disabled={loading}
                      className="inline-flex w-fit min-h-9 items-center gap-2 text-sm font-bold text-[#5bc4f1]"
                    >
                      Adicionar observacao
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-lg">
        Conformidade atual: <strong className="text-[#00b4d8]">{conformity}%</strong>
      </div>

      {message.text && (
        <p className={`rounded-lg border px-4 py-3 ${
          message.type === 'success'
            ? 'border-green-500/50 bg-green-950/40 text-green-100'
            : 'border-red-500/50 bg-red-950/40 text-red-100'
        }`}>
          {message.text}
        </p>
      )}

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#001233] px-5 py-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7a0800] px-4 font-bold text-white disabled:opacity-60"
          >
            <X size={20} />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#00b4d8] px-4 font-extrabold text-[#001233] disabled:opacity-60"
          >
            <Save size={20} />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </footer>
    </section>
  );
}

export default ChecklistExecution;
