import React, { useState, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, Camera, CheckCircle, XCircle, Loader, AlertCircle, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadFotos = () => {
  const navigate = useNavigate();
  
  const [novoVeiculo, setNovoVeiculo] = useState({
    placa: '',
    model: '',        // Corrigido: 'model' ao invés de 'modelo'
    year: new Date().getFullYear().toString()
  });

  const [fotos, setFotos] = useState({
    frente: null,
    lateralEsquerda: null,
    lateralDireita: null,
    traseira: null,
    topo: null
  });

  const [previews, setPreviews] = useState({
    frente: null,
    lateralEsquerda: null,
    lateralDireita: null,
    traseira: null,
    topo: null
  });

  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroGeral, setErroGeral] = useState(null);

  const fileInputRefs = {
    frente: useRef(null),
    lateralEsquerda: useRef(null),
    lateralDireita: useRef(null),
    traseira: useRef(null),
    topo: useRef(null)
  };

  const fotoTipos = [
    { id: 'frente', label: 'Frontal', icon: '🚗', required: true },
    { id: 'lateralEsquerda', label: 'Lateral Esquerda', icon: '⬅️', required: true },
    { id: 'lateralDireita', label: 'Lateral Direita', icon: '➡️', required: true },
    { id: 'traseira', label: 'Traseira', icon: '🔙', required: true },
    { id: 'topo', label: 'Topo / Céu', icon: '☁️', required: true }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoVeiculo(prev => ({ 
      ...prev, 
      [name]: name === 'placa' ? value.toUpperCase() : value 
    }));
  };

  const handleFileSelect = (tipo, event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Selecione apenas imagens');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem deve ter no máximo 5MB');
      return;
    }
    
    setFotos(prev => ({ ...prev, [tipo]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviews(prev => ({ ...prev, [tipo]: reader.result }));
    reader.readAsDataURL(file);
  };

  const removeFoto = (tipo) => {
    setFotos(prev => ({ ...prev, [tipo]: null }));
    setPreviews(prev => ({ ...prev, [tipo]: null }));
  };

  const cadastrarVeiculo = async () => {
    const vehicleData = {
      plate: novoVeiculo.placa,
      model: novoVeiculo.model,
      year: parseInt(novoVeiculo.year),
      mileage: 0,
      vehicleType: 'car',
      operationalStatus: 'active',
      observation: null
    };

    const response = await axios.post('http://localhost:3000/vehicles', vehicleData);
    return response.data;
  };

  // Função para enviar fotos
  const enviarFotos = async (placa) => {
    const formData = new FormData();
    formData.append('placa', placa);
    
    Object.entries(fotos).forEach(([tipo, file]) => {
      if (file) formData.append(tipo, file);
    });

    const response = await axios.post('http://localhost:3000/inspecao/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  };

  const handleSalvarTudo = async () => {
    // Validações
    if (!novoVeiculo.placa || novoVeiculo.placa.trim() === '') {
      setErroGeral("Insira uma placa válida.");
      return;
    }

    if (!novoVeiculo.model || novoVeiculo.model.trim() === '') {
      setErroGeral("Insira o modelo do veículo.");
      return;
    }

    const faltando = fotoTipos.filter(t => t.required && !fotos[t.id]);
    if (faltando.length > 0) {
      setErroGeral(`Faltam fotos: ${faltando.map(f => f.label).join(', ')}`);
      return;
    }

    setLoading(true);
    setErroGeral(null);

    try {
      // Passo 1: Cadastrar veículo
      console.log('Cadastrando veículo...');
      const veiculoCadastrado = await cadastrarVeiculo();
      console.log('Veículo cadastrado:', veiculoCadastrado);
      
      // Passo 2: Enviar fotos
      console.log('Enviando fotos...');
      await enviarFotos(novoVeiculo.placa);
      
      setSucesso(true);
      setTimeout(() => navigate('/veiculos'), 2000);
      
    } catch (error) {
      console.error('Erro completo:', error);
      
      const mensagem = error.response?.data?.erro || 
                       error.response?.data?.mensagem || 
                       error.response?.data?.message ||
                       error.message ||
                       "Erro ao salvar. Verifique se o veículo já existe.";
      
      setErroGeral(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const totalSelecionadas = Object.values(fotos).filter(f => f !== null).length;
  const isCompleto = totalSelecionadas === 5;

  return (
    <div className="min-h-screen bg-[#00112b] text-white p-5">
      <div className="container mx-auto max-w-4xl">
        
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate('/veiculos')} 
          className="flex items-center gap-2 bg-[#002b45] hover:bg-[#003d5c] px-4 py-2 rounded-full mb-6 transition-colors"
        >
          <ChevronLeft size={20} /> Voltar
        </button>

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Cadastrar <span className="text-[#00b7eb]">Veículo</span>
          </h1>
          <p className="text-gray-400 mt-2">Preencha os dados e tire as 5 fotos obrigatórias</p>
        </div>

        {/* Dados do Veículo */}
        <div className="bg-[#002b45]/50 rounded-2xl p-6 mb-8 border border-[#33ccff]/30">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Car size={20} /> Dados do Veículo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="placa"
              placeholder="PLACA (ex: ABC1234)"
              className="bg-[#00112b] rounded-xl py-3 px-4 border border-[#33ccff]/30 outline-none focus:border-[#00b7eb] transition-colors uppercase"
              value={novoVeiculo.placa}
              onChange={handleInputChange}
              disabled={loading}
            />
            <input
              name="model"
              placeholder="MODELO (ex: Fiat Strada)"
              className="bg-[#00112b] rounded-xl py-3 px-4 border border-[#33ccff]/30 outline-none focus:border-[#00b7eb] transition-colors"
              value={novoVeiculo.model}
              onChange={handleInputChange}
              disabled={loading}
            />
            <input
              name="year"
              type="number"
              placeholder="ANO"
              className="bg-[#00112b] rounded-xl py-3 px-4 border border-[#33ccff]/30 outline-none focus:border-[#00b7eb] transition-colors"
              value={novoVeiculo.year}
              onChange={handleInputChange}
              disabled={loading}
              min="1886"
              max={new Date().getFullYear() + 1}
            />
          </div>
        </div>

        {/* Progresso */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso das Fotos</span>
            <span className="font-bold">{totalSelecionadas}/5</span>
          </div>
          <div className="w-full bg-[#00112b] rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isCompleto ? 'bg-green-500' : 'bg-[#00b7eb]'
              }`}
              style={{ width: `${(totalSelecionadas / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Grid de Fotos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {fotoTipos.map(({ id, label, icon }) => (
            <div 
              key={id} 
              className={`bg-[#0052cc]/20 rounded-2xl border-2 p-4 transition-all
                ${fotos[id] ? 'border-green-500' : 'border-[#33ccff]/30 hover:border-[#33ccff]'}
              `}
            >
              <div className="flex justify-between items-center mb-3 text-sm font-bold uppercase">
                <span>{icon} {label} {fotoTipos.find(t => t.id === id)?.required && '*'}</span>
                {previews[id] && (
                  <button onClick={() => removeFoto(id)} className="text-red-400 hover:text-red-300">
                    <XCircle size={18} />
                  </button>
                )}
              </div>
              
              <input 
                ref={fileInputRefs[id]} 
                type="file" 
                accept="image/jpeg,image/png,image/jpg" 
                className="hidden" 
                onChange={(e) => handleFileSelect(id, e)} 
                disabled={loading}
              />
              
              {previews[id] ? (
                <img 
                  src={previews[id]} 
                  className="w-full h-48 object-cover rounded-xl border border-[#33ccff]" 
                  alt={`Preview ${label}`} 
                />
              ) : (
                <button 
                  onClick={() => fileInputRefs[id].current?.click()} 
                  className="w-full h-48 bg-[#00112b] rounded-xl border-2 border-dashed border-[#33ccff]/50 hover:border-[#33ccff] transition-all flex flex-col items-center justify-center gap-2 group"
                  disabled={loading}
                >
                  <Camera size={40} className="text-[#33ccff]/50 group-hover:text-[#33ccff]" />
                  <span className="text-sm opacity-70">Tirar Foto</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Mensagem de Sucesso */}
        {sucesso && (
          <div className="mb-6 bg-green-500/20 border border-green-500 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-400" />
            <div>
              <h4 className="font-bold text-green-400">Sucesso!</h4>
              <p className="text-sm">Veículo cadastrado e fotos enviadas! Redirecionando...</p>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {erroGeral && (
          <div className="mb-6 bg-red-500/20 border border-red-500 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <div>
              <h4 className="font-bold text-red-400">Erro!</h4>
              <p className="text-sm">{erroGeral}</p>
            </div>
          </div>
        )}

        {/* Botão Salvar */}
        <button
          onClick={handleSalvarTudo}
          disabled={loading || !isCompleto}
          className={`
            w-full py-4 rounded-2xl font-bold text-xl transition-all
            ${loading || !isCompleto 
              ? 'bg-gray-600 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-r from-[#00b7eb] to-[#0099cc] hover:scale-[1.02] shadow-lg'
            }
          `}
        >
          {loading ? (
            <Loader className="animate-spin mx-auto" size={24} />
          ) : sucesso ? (
            <span>✅ CADASTRADO COM SUCESSO!</span>
          ) : (
            <span>📸 CADASTRAR E ENVIAR FOTOS ({totalSelecionadas}/5)</span>
          )}
        </button>
        
        {/* Dica */}
        <p className="text-xs text-center text-gray-500 mt-4">
          * Todas as 5 fotos são obrigatórias • Formatos: JPG, PNG • Máx. 5MB por foto
        </p>
      </div>
    </div>
  );
};

export default UploadFotos;