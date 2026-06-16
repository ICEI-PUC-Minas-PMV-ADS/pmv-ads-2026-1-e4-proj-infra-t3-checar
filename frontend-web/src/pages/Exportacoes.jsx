import { useState } from 'react';
import { Download, Table, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const downloadBlob = async (url, filename) => {
  const res = await api.get(url, { responseType: 'blob' });
  const href = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
};

function Exportacoes() {
  const [placaInsp, setPlacaInsp] = useState('');

  const [loadingVeiculos, setLoadingVeiculos] = useState(false);
  const [loadingInspecoes, setLoadingInspecoes] = useState(false);

  const [sucessoVeiculos, setSucessoVeiculos] = useState(false);
  const [sucessoInspecoes, setSucessoInspecoes] = useState(false);

  const [erroVeiculos, setErroVeiculos] = useState('');
  const [erroInspecoes, setErroInspecoes] = useState('');

  const feedbackSucesso = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  const mensagemErro = (err) =>
    err.response?.status === 403
      ? 'Apenas Gestores podem exportar dados.'
      : 'Erro ao exportar. Tente novamente.';

  const exportarVeiculos = async () => {
    setErroVeiculos('');
    setLoadingVeiculos(true);
    try {
      await downloadBlob('/exportacoes/vehicles/csv', 'veiculos.csv');
      feedbackSucesso(setSucessoVeiculos);
    } catch (err) {
      setErroVeiculos(mensagemErro(err));
    } finally {
      setLoadingVeiculos(false);
    }
  };

  const exportarInspecoes = async () => {
    setErroInspecoes('');
    setLoadingInspecoes(true);
    try {
      const placa = placaInsp.trim().toUpperCase();
      const url = placa
        ? `/exportacoes/inspecoes/csv?placa=${encodeURIComponent(placa)}`
        : '/exportacoes/inspecoes/csv';
      const filename = placa ? `inspecoes-${placa}.csv` : 'inspecoes.csv';
      await downloadBlob(url, filename);
      feedbackSucesso(setSucessoInspecoes);
    } catch (err) {
      setErroInspecoes(mensagemErro(err));
    } finally {
      setLoadingInspecoes(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Exportações CSV</h1>
        <p className="mt-1 text-sm text-white/50">
          Baixe os dados do sistema em formato CSV para análise externa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Exportar Veículos */}
        <div className="rounded-xl border border-[#33ccff]/30 bg-[#002b45]/50 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0052cc]/40">
              <Table size={20} className="text-[#00b7eb]" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Exportar Veículos</h2>
              <p className="text-xs text-white/50">Todos os veículos cadastrados no sistema</p>
            </div>
          </div>

          <div className="rounded-lg border border-[#33ccff]/15 bg-[#00112b]/60 px-4 py-3 text-xs text-white/40">
            Exporta a lista completa de veículos com todos os campos disponíveis.
          </div>

          <div aria-live="polite">
            {erroVeiculos && (
              <p className="flex items-center gap-1.5 text-sm text-red-400">
                <AlertCircle size={14} /> {erroVeiculos}
              </p>
            )}
          </div>

          <button
            onClick={exportarVeiculos}
            disabled={loadingVeiculos}
            aria-label="Baixar CSV de veículos"
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all disabled:cursor-not-allowed ${
              sucessoVeiculos
                ? 'bg-green-600/80 text-white'
                : 'bg-[#0052cc] text-white hover:bg-[#00b7eb] hover:text-[#00112b] disabled:opacity-50'
            }`}
          >
            {loadingVeiculos ? (
              <Loader2 size={16} className="animate-spin" />
            ) : sucessoVeiculos ? (
              <CheckCircle size={16} />
            ) : (
              <Download size={16} />
            )}
            {loadingVeiculos
              ? 'Baixando...'
              : sucessoVeiculos
              ? 'Download concluído!'
              : 'Baixar CSV'}
          </button>

          <div role="status" aria-live="assertive" aria-atomic="true">
            {sucessoVeiculos && (
              <span className="sr-only">Download de veículos concluído com sucesso.</span>
            )}
          </div>
        </div>

        {/* Card: Exportar Inspeções */}
        <div className="rounded-xl border border-[#33ccff]/30 bg-[#002b45]/50 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0052cc]/40">
              <Table size={20} className="text-[#00b7eb]" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Exportar Inspeções</h2>
              <p className="text-xs text-white/50">Filtre por placa ou exporte todas as inspeções</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-white/70" htmlFor="placa-exportacao">
              Placa <span className="text-white/30">(opcional)</span>
            </label>
            <input
              id="placa-exportacao"
              type="text"
              value={placaInsp}
              onChange={(e) => setPlacaInsp(e.target.value)}
              placeholder="Ex: ABC1234 — deixe em branco para todas"
              aria-label="Filtrar por placa"
              className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#00b7eb] transition-colors"
            />
          </div>

          <div aria-live="polite">
            {erroInspecoes && (
              <p className="flex items-center gap-1.5 text-sm text-red-400">
                <AlertCircle size={14} /> {erroInspecoes}
              </p>
            )}
          </div>

          <button
            onClick={exportarInspecoes}
            disabled={loadingInspecoes}
            aria-label="Baixar CSV de inspeções"
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all disabled:cursor-not-allowed ${
              sucessoInspecoes
                ? 'bg-green-600/80 text-white'
                : 'bg-[#0052cc] text-white hover:bg-[#00b7eb] hover:text-[#00112b] disabled:opacity-50'
            }`}
          >
            {loadingInspecoes ? (
              <Loader2 size={16} className="animate-spin" />
            ) : sucessoInspecoes ? (
              <CheckCircle size={16} />
            ) : (
              <Download size={16} />
            )}
            {loadingInspecoes
              ? 'Baixando...'
              : sucessoInspecoes
              ? 'Download concluído!'
              : 'Baixar CSV'}
          </button>

          <div role="status" aria-live="assertive" aria-atomic="true">
            {sucessoInspecoes && (
              <span className="sr-only">Download de inspeções concluído com sucesso.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exportacoes;
