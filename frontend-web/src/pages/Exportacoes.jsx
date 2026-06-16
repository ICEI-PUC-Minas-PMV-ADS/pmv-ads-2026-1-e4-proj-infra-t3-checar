import { useState } from 'react';
import { Download, Table, CheckCircle } from 'lucide-react';

function Exportacoes() {
  const [placaInsp, setPlacaInsp] = useState('');
  const [clicadoVeiculos, setClicadoVeiculos] = useState(false);
  const [clicadoInspecoes, setClicadoInspecoes] = useState(false);

  const feedbackTemporario = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const exportarVeiculos = () => {
    window.open('/api/exportacoes/vehicles/csv', '_blank');
    feedbackTemporario(setClicadoVeiculos);
  };

  const exportarInspecoes = () => {
    const placa = placaInsp.trim().toUpperCase();
    const url = placa
      ? `/api/exportacoes/inspecoes/csv?placa=${encodeURIComponent(placa)}`
      : '/api/exportacoes/inspecoes/csv';
    window.open(url, '_blank');
    feedbackTemporario(setClicadoInspecoes);
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

          <button
            onClick={exportarVeiculos}
            aria-label="Baixar CSV de veículos"
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all ${
              clicadoVeiculos
                ? 'bg-green-600/80 text-white'
                : 'bg-[#0052cc] text-white hover:bg-[#00b7eb] hover:text-[#00112b]'
            }`}
          >
            {clicadoVeiculos ? (
              <>
                <CheckCircle size={16} />
                Download iniciado!
              </>
            ) : (
              <>
                <Download size={16} />
                Baixar CSV
              </>
            )}
          </button>

          <div role="status" aria-live="assertive" aria-atomic="true">
            {clicadoVeiculos && (
              <span className="sr-only">Download de veículos iniciado.</span>
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

          <button
            onClick={exportarInspecoes}
            aria-label="Baixar CSV de inspeções"
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-all ${
              clicadoInspecoes
                ? 'bg-green-600/80 text-white'
                : 'bg-[#0052cc] text-white hover:bg-[#00b7eb] hover:text-[#00112b]'
            }`}
          >
            {clicadoInspecoes ? (
              <>
                <CheckCircle size={16} />
                Download iniciado!
              </>
            ) : (
              <>
                <Download size={16} />
                Baixar CSV
              </>
            )}
          </button>

          <div role="status" aria-live="assertive" aria-atomic="true">
            {clicadoInspecoes && (
              <span className="sr-only">Download de inspeções iniciado.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exportacoes;
