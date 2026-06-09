import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Check, Plus, RefreshCw, Trash2, X } from 'lucide-react';

const TIPO_OPTIONS = ['Diario', 'Preventivo'];
const INITIAL_SECTIONS = [
  {
    id: 'motor',
    titulo: 'MOTOR',
    campos: [
      { id: 'nivel-oleo', nome: 'Nível de óleo' },
      { id: 'vazamentos-aparentes', nome: 'Vazamentos aparentes' },
    ],
  },
  {
    id: 'pneus',
    titulo: 'PNEUS',
    campos: [
      { id: 'calibragem', nome: 'Calibragem' },
      { id: 'desgastes', nome: 'Desgastes' },
      { id: 'estepe', nome: 'Estepe' },
    ],
  },
  {
    id: 'seguranca',
    titulo: 'SEGURANÇA',
    campos: [
      { id: 'freios', nome: 'Freios' },
      { id: 'luzes', nome: 'Luzes' },
      { id: 'cinto', nome: 'Cinto' },
    ],
  },
];

const cloneInitialSections = () => INITIAL_SECTIONS.map((section) => ({
  ...section,
  campos: section.campos.map((field) => ({ ...field })),
}));

const createLocalId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const sortByOrder = (a, b) => (a.ordem || 0) - (b.ordem || 0);
const orderByOrder = (items = []) => [...items].sort(sortByOrder);

const mapFieldToForm = (field) => ({
  id: field._id || createLocalId('campo'),
  nome: field.nome || '',
});

const mapSectionToForm = (section) => ({
  id: section._id || createLocalId('secao'),
  titulo: section.titulo || '',
  campos: orderByOrder(section.campos).map(mapFieldToForm),
});

const mapModeloToFormSections = (modelo) => {
  const secoes = modelo?.secoes || [];

  if (secoes.length === 0) {
    return cloneInitialSections();
  }

  return orderByOrder(secoes).map(mapSectionToForm);
};

function ModeloChecklistEdit() {
  const navigate = useNavigate();
  const { modeloId } = useParams();
  const isEditing = Boolean(modeloId);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: TIPO_OPTIONS[0],
    descricao: '',
  });
  const [sections, setSections] = useState(cloneInitialSections);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const carregarModelo = async () => {
      if (!isEditing) {
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        setMessage({ type: '', text: '' });
        const response = await api.get(`/modelochecklists/${modeloId}`);
        const modelo = response.data;

        setFormData({
          nome: modelo.nome || '',
          tipo: modelo.tipo || TIPO_OPTIONS[0],
          descricao: modelo.descricao || '',
        });
        setSections(mapModeloToFormSections(modelo));
      } catch (err) {
        setMessage({ type: 'error', text: `Falha ao carregar modelo: ${err.response?.data?.erro || err.message}` });
      } finally {
        setPageLoading(false);
      }
    };

    carregarModelo();
  }, [isEditing, modeloId]);

  const secoesPayload = useMemo(() =>
    sections
      .map((section, sectionIndex) => ({
        titulo: section.titulo.trim(),
        ordem: sectionIndex,
        campos: section.campos
          .map((field, fieldIndex) => ({
            nome: field.nome.trim(),
            ordem: fieldIndex,
          }))
          .filter((field) => field.nome),
      }))
      .filter((section) => section.titulo && section.campos.length > 0),
  [sections]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSectionChange = (sectionId, value) => {
    setSections((current) =>
      current.map((section) => section.id === sectionId ? { ...section, titulo: value } : section)
    );
  };

  const handleFieldChange = (sectionId, fieldId, value) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          campos: section.campos.map((field) =>
            field.id === fieldId ? { ...field, nome: value } : field
          ),
        };
      })
    );
  };

  const addSection = () => {
    setSections((current) => [
      ...current,
      { id: createLocalId('secao'), titulo: '', campos: [{ id: createLocalId('campo'), nome: '' }] },
    ]);
  };

  const removeSection = (sectionId) => {
    setSections((current) => current.filter((section) => section.id !== sectionId));
  };

  const addField = (sectionId) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, campos: [...section.campos, { id: createLocalId('campo'), nome: '' }] }
          : section
      )
    );
  };

  const removeField = (sectionId, fieldId) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, campos: section.campos.filter((field) => field.id !== fieldId) }
          : section
      )
    );
  };

  const resetDraft = () => {
    setFormData({ nome: '', tipo: TIPO_OPTIONS[0], descricao: '' });
    setSections(cloneInitialSections());
    setMessage({ type: '', text: '' });
  };

  const validate = () => {
    if (!formData.nome.trim()) return 'Preencha o nome do modelo.';
    if (!formData.tipo) return 'Selecione o tipo do modelo.';
    if (!formData.descricao.trim()) return 'Preencha a descrição do modelo.';
    if (secoesPayload.length === 0) return 'Adicione pelo menos uma seção com itens.';

    const hasBlankField = sections.some(
      (section) => !section.titulo.trim() || section.campos.some((field) => !field.nome.trim())
    );

    if (hasBlankField) return 'Preencha todas as seções e itens antes de salvar.';
    return '';
  };

  const handleSave = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setMessage({ type: 'error', text: validationMessage });
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      descricao: formData.descricao.trim(),
      secoes: secoesPayload,
      ativo: true,
    };

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      if (isEditing) {
        await api.put(`/modelochecklists/${modeloId}`, payload);
      } else {
        await api.post('/modelochecklists', payload);
      }

      setMessage({ type: 'success', text: 'Modelo salvo com sucesso.' });
      setTimeout(() => navigate('/modelos'), 500);
    } catch (err) {
      setMessage({ type: 'error', text: `Falha ao salvar modelo: ${err.response?.data?.erro || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-5xl place-items-center text-white/70">
        Carregando modelo...
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
          {isEditing ? 'Editar Modelo' : 'Novo Modelo'} <span className="text-[#00b4d8]">de Checklist</span>
        </h1>
        <p className="mt-2 max-w-2xl text-white/80">
          Estruture inspeções padronizadas para diferentes cenários.
        </p>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <div className="grid gap-6">
          <label className="grid gap-2">
            <span className="font-bold text-[#00b4d8]">Nome</span>
            <input
              type="text"
              value={formData.nome}
              onChange={(event) => handleChange('nome', event.target.value)}
              disabled={loading}
              placeholder="Checklist da frota"
              className="min-h-12 rounded-lg border-2 border-[#00b4d8] bg-[#004aad] px-4 text-white outline-none placeholder:text-white/45"
            />
          </label>

          <div className="grid gap-2">
            <span className="font-bold text-[#00b4d8]">Tipo</span>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border-2 border-[#00b4d8] bg-[#004aad]">
              {TIPO_OPTIONS.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleChange('tipo', tipo)}
                  disabled={loading}
                  className={`min-h-12 font-bold transition ${
                    formData.tipo === tipo ? 'bg-[#00b4d8] text-[#001233]' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {tipo === 'Diario' ? 'Diário' : tipo}
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-2">
            <span className="font-bold text-[#00b4d8]">Descrição</span>
            <textarea
              value={formData.descricao}
              onChange={(event) => handleChange('descricao', event.target.value)}
              disabled={loading}
              placeholder="Descreva quando e como este modelo será usado"
              className="min-h-32 resize-y rounded-lg border-2 border-[#00b4d8] bg-[#004aad] px-4 py-3 text-white outline-none placeholder:text-white/45"
            />
          </label>

          <div className="grid gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-light">
                  Seções <span className="font-extrabold text-[#00b4d8]">do Checklist</span>
                </h2>
                <p className="mt-1 text-white/75">Organize os itens por categorias.</p>
              </div>
              <button
                type="button"
                onClick={addSection}
                disabled={loading}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#00b4d8] text-white transition hover:bg-[#5bc4f1]"
                aria-label="Adicionar seção"
              >
                <Plus size={22} />
              </button>
            </div>

            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="rounded-lg border border-white/60 bg-[#004aad] p-4">
                <div className="mb-3 grid grid-cols-[1fr_auto] gap-3">
                  <input
                    type="text"
                    value={section.titulo}
                    onChange={(event) => handleSectionChange(section.id, event.target.value)}
                    disabled={loading}
                    placeholder={`Seção ${sectionIndex + 1}`}
                    className="min-h-11 rounded-lg border-2 border-[#00b4d8] bg-[#003b8a] px-3 font-extrabold text-white outline-none placeholder:text-white/45"
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    disabled={loading || sections.length === 1}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#7a0800] text-white disabled:opacity-40"
                    aria-label="Remover seção"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid gap-3">
                  {section.campos.map((field, fieldIndex) => (
                    <div key={field.id} className="grid grid-cols-[1fr_auto] gap-3">
                      <input
                        type="text"
                        value={field.nome}
                        onChange={(event) => handleFieldChange(section.id, field.id, event.target.value)}
                        disabled={loading}
                        placeholder={`Item ${fieldIndex + 1}`}
                        className="min-h-10 rounded-lg border-2 border-[#00b4d8] bg-[#003b8a] px-3 text-white outline-none placeholder:text-white/45"
                      />
                      <button
                        type="button"
                        onClick={() => removeField(section.id, field.id)}
                        disabled={loading || section.campos.length === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0057c2] text-white disabled:opacity-40"
                        aria-label="Remover item"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addField(section.id)}
                  disabled={loading}
                  className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm font-bold text-[#5bc4f1]"
                >
                  <Plus size={18} />
                  Adicionar item
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-white/60 bg-[#004aad] p-5">
          <h2 className="text-2xl font-light">
            Modelo <span className="font-extrabold text-[#00b4d8]">do Checklist</span>
          </h2>
          <p className="mt-2 text-white/80">
            {formData.descricao || 'A descrição do modelo aparece aqui para revisão antes de salvar.'}
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <dt className="font-extrabold text-[#00b4d8]">NOME</dt>
              <dd className="mt-1 text-white">{formData.nome || 'Checklist da frota'}</dd>
            </div>
            <div>
              <dt className="font-extrabold text-[#00b4d8]">TIPO</dt>
              <dd className="mt-1 text-white">{formData.tipo === 'Diario' ? 'Diário' : formData.tipo}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-4">
            {secoesPayload.map((section) => (
              <div key={section.titulo}>
                <h3 className="font-extrabold text-[#00b4d8]">{section.titulo}</h3>
                <ul className="mt-2 grid gap-1 text-white/90">
                  {section.campos.map((field) => (
                    <li key={field.nome}>{field.nome}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#001233] px-5 py-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3">
          <button
            type="button"
            onClick={resetDraft}
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#7a0800] px-4 font-bold text-white disabled:opacity-60"
          >
            <RefreshCw size={20} />
            Limpar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#00b4d8] px-4 font-extrabold text-[#001233] disabled:opacity-60"
          >
            <Check size={20} />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </footer>
    </section>
  );
}

export default ModeloChecklistEdit;
