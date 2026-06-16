import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, CheckCircle, XCircle, Loader, AlertCircle, Car } from 'lucide-react';
import api from '../services/api';

const FOTO_TIPOS = [
  { id: 'frente',          label: 'Frontal',        icon: '🚗', required: true },
  { id: 'lateralEsquerda', label: 'Lateral Esquerda', icon: '⬅️', required: true },
  { id: 'lateralDireita',  label: 'Lateral Direita',  icon: '➡️', required: true },
  { id: 'traseira',        label: 'Traseira',         icon: '🔙', required: true },
  { id: 'topo',            label: 'Topo / Céu',       icon: '☁️', required: true },
];

const INITIAL_FOTOS = { frente: null, lateralEsquerda: null, lateralDireita: null, traseira: null, topo: null };

const UploadFotos = () => {
  const navigate = useNavigate();

  const [novoVeiculo, setNovoVeiculo] = useState({
    placa: '',
    model: '',
    year: String(new Date().getFullYear()),
    marca: '',
    cor: '',
  });

  const [fotos,     setFotos]    = useState(INITIAL_FOTOS);
  const [previews,  setPreviews] = useState(INITIAL_FOTOS);
  const [loading,   setLoading]  = useState(false);
  const [sucesso,   setSucesso]  = useState(false);
  const [erroGeral, setErroGeral] = useState(null);

  const fileInputRefs = Object.fromEntries(
    FOTO_TIPOS.map(({ id }) => [id, useRef(null)])
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoVeiculo((prev) => ({
      ...prev,
      [name]: name === 'placa' ? value.toUpperCase() : value,
    }));
  };

  const handleFileSelect = (tipo, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErroGeral('Selecione apenas imagens (JPEG, PNG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErroGeral('Imagem deve ter no máximo 10 MB.');
      return;
    }

    setFotos((prev) => ({ ...prev, [tipo]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviews((prev) => ({ ...prev, [tipo]: reader.result }));
    reader.readAsDataURL(file);
  };

  const removeFoto = (tipo) => {
    setFotos((prev)    => ({ ...prev, [tipo]: null }));
    setPreviews((prev) => ({ ...prev, [tipo]: null }));
    if (fileInputRefs[tipo].current) fileInputRefs[tipo].current.value = '';
  };

  const handleSalvarTudo = async () => {
    setErroGeral(null);

    if (!novoVeiculo.placa.trim()) {
      setErroGeral('Insira uma placa válida.');
      return;
    }
    if (!novoVeiculo.model.trim()) {
      setErroGeral('Insira o modelo do veículo.');
      return;
    }

    const faltando = FOTO_TIPOS.filter((t) => t.required && !fotos[t.id]);
    if (faltando.length > 0) {
      setErroGeral(`Faltam fotos: ${faltando.map((f) => f.label).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Step 1 — Register vehicle
      await api.post('/vehicles', {
        plate: novoVeiculo.placa,
        model: novoVeiculo.model,
        year: parseInt(novoVeiculo.year, 10),
        mileage: 0,
        vehicleType: 'car',
        operationalStatus: 'active',
        observation: null,
        marca: novoVeiculo.marca || null,
        cor: novoVeiculo.cor || null,
      });

      // Step 2 — Upload photos
      const formData = new FormData();
      formData.append('placa', novoVeiculo.placa);
      FOTO_TIPOS.forEach(({ id }) => {
        if (fotos[id]) formData.append(id, fotos[id]);
      });

      await api.post('/inspecao/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSucesso(true);
      setTimeout(() => navigate('/veiculos'), 2000);
    } catch (error) {
      const msg =
        error.response?.data?.erro ||
        error.response?.data?.mensagem ||
        error.message ||
        'Erro ao salvar. Verifique se o veículo já existe.';
      setErroGeral(msg);
    } finally {
      setLoading(false);
    }
  };

  const totalSelecionadas = Object.values(fotos).filter(Boolean).length;
  const isCompleto = totalSelecionadas === 5;

  return (
    <div className="min-h-screen bg-[#00112b] p-5 text-white">
      <div className="container mx-auto max-w-4xl">

        <button
          onClick={() => navigate('/veiculos')}
          aria-label="Voltar para a lista de veículos"
          className="mb-6 flex items-center gap-2 rounded-full bg-[#002b45] px-4 py-2 transition-colors hover:bg-[#003d5c]"
        >
          <ChevronLeft size={20} /> Voltar
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Cadastrar <span className="text-[#00b7eb]">Veículo</span>
          </h1>
          <p className="mt-2 text-gray-400">Preencha os dados e tire as 5 fotos obrigatórias</p>
        </div>

        {/* Vehicle data */}
        <div className="mb-8 rounded-2xl border border-[#33ccff]/30 bg-[#002b45]/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Car size={20} /> Dados do Veículo
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              name="placa"
              placeholder="PLACA (ex: ABC1234)"
              className="rounded-xl border border-[#33ccff]/30 bg-[#00112b] px-4 py-3 uppercase outline-none transition-colors focus:border-[#00b7eb] disabled:opacity-50"
              value={novoVeiculo.placa}
              onChange={handleInputChange}
              disabled={loading}
              maxLength={8}
              aria-label="Placa do veículo"
            />
            <input
              name="model"
              placeholder="MODELO (ex: Fiat Strada)"
              className="rounded-xl border border-[#33ccff]/30 bg-[#00112b] px-4 py-3 outline-none transition-colors focus:border-[#00b7eb] disabled:opacity-50"
              value={novoVeiculo.model}
              onChange={handleInputChange}
              disabled={loading}
              aria-label="Modelo do veículo"
            />
            <input
              name="year"
              type="number"
              placeholder="ANO"
              className="rounded-xl border border-[#33ccff]/30 bg-[#00112b] px-4 py-3 outline-none transition-colors focus:border-[#00b7eb] disabled:opacity-50"
              value={novoVeiculo.year}
              onChange={handleInputChange}
              disabled={loading}
              min="1886"
              max={new Date().getFullYear() + 1}
              aria-label="Ano do veículo"
            />
            <input
              name="marca"
              placeholder="MARCA (ex: Fiat)"
              className="rounded-xl border border-[#33ccff]/30 bg-[#00112b] px-4 py-3 outline-none transition-colors focus:border-[#00b7eb] disabled:opacity-50"
              value={novoVeiculo.marca}
              onChange={handleInputChange}
              disabled={loading}
              aria-label="Marca do veículo"
            />
            <input
              name="cor"
              placeholder="COR (ex: Branco)"
              className="rounded-xl border border-[#33ccff]/30 bg-[#00112b] px-4 py-3 outline-none transition-colors focus:border-[#00b7eb] disabled:opacity-50"
              value={novoVeiculo.cor}
              onChange={handleInputChange}
              disabled={loading}
              aria-label="Cor do veículo"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm">
            <span>Progresso das Fotos</span>
            <span className="font-bold">{totalSelecionadas}/5</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#00112b]">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${isCompleto ? 'bg-green-500' : 'bg-[#00b7eb]'}`}
              style={{ width: `${(totalSelecionadas / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Photos grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FOTO_TIPOS.map(({ id, label, icon }) => (
            <div
              key={id}
              className={`rounded-2xl border-2 bg-[#0052cc]/20 p-4 transition-all ${fotos[id] ? 'border-green-500' : 'border-[#33ccff]/30 hover:border-[#33ccff]'}`}
            >
              <div className="mb-3 flex items-center justify-between text-sm font-bold uppercase">
                <span>{icon} {label} *</span>
                {previews[id] && (
                  <button onClick={() => removeFoto(id)} aria-label={`Remover foto ${label}`} className="text-red-400 hover:text-red-300">
                    <XCircle size={18} />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRefs[id]}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => handleFileSelect(id, e)}
                disabled={loading}
              />

              {previews[id] ? (
                <img
                  src={previews[id]}
                  className="h-48 w-full rounded-xl border border-[#33ccff] object-cover"
                  alt={`Preview ${label}`}
                />
              ) : (
                <button
                  onClick={() => fileInputRefs[id].current?.click()}
                  aria-label={`Selecionar foto ${label}`}
                  className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#33ccff]/50 bg-[#00112b] transition-all hover:border-[#33ccff] group disabled:opacity-50"
                  disabled={loading}
                >
                  <Camera size={40} className="text-[#33ccff]/50 group-hover:text-[#33ccff]" />
                  <span className="text-sm opacity-70">Selecionar Foto</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {sucesso && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500 bg-green-500/20 p-4">
            <CheckCircle size={20} className="text-green-400" />
            <p className="text-sm">Veículo cadastrado e fotos enviadas! Redirecionando…</p>
          </div>
        )}

        {erroGeral && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500 bg-red-500/20 p-4">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-sm">{erroGeral}</p>
          </div>
        )}

        <button
          onClick={handleSalvarTudo}
          disabled={loading || !isCompleto}
          aria-label="Cadastrar veículo e enviar fotos"
          className={`w-full rounded-2xl py-4 text-xl font-bold transition-all ${
            loading || !isCompleto
              ? 'cursor-not-allowed bg-gray-600 opacity-50'
              : 'bg-gradient-to-r from-[#00b7eb] to-[#0099cc] shadow-lg hover:scale-[1.02]'
          }`}
        >
          {loading ? (
            <Loader className="mx-auto animate-spin" size={24} />
          ) : sucesso ? (
            '✅ CADASTRADO COM SUCESSO!'
          ) : (
            `📸 CADASTRAR E ENVIAR FOTOS (${totalSelecionadas}/5)`
          )}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          * Todas as 5 fotos são obrigatórias · Formatos: JPG, PNG, WEBP · Máx. 10 MB por foto
        </p>
      </div>
    </div>
  );
};

export default UploadFotos;
