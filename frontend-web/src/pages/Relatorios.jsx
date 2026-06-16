import { useState } from 'react';
import { FileText, Download, AlertCircle } from 'lucide-react';

function Relatorios() {
  const [checklistId, setChecklistId] = useState('');
  const [placa, setPlaca] = useState('');
  const [erroChecklist, setErroChecklist] = useState('');
  const [erroPlaca, setErroPlaca] = useState('');

  const handleGerarPdfChecklist = () => {
    if (!checklistId.trim()) {
      setErroChecklist('Informe o ID do checklist.');
      return;
    }
    setErroChecklist('');
    window.open(`/api/relatorios/checklists/${checklistId.trim()}/pdf`, '_blank');
  };

  const handleGerarPdfInspecoes = () => {
    if (!placa.trim()) {
      setErroPlaca('Informe a placa do veículo.');
      return;
    }
    setErroPlaca('');
    window.open(`/api/relatorios/inspecoes/${placa.trim().toUpperCase()}/pdf`, '_blank');
  };

  return (
    <section role="main" className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios PDF</h1>
        <p className="mt-1 text-white/50 text-sm">Gere e baixe relatórios em formato PDF.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: PDF do Checklist */}
        <div className="rounded-xl border border-[#33ccff]/30 bg-[#002b45]/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0052cc]/40">
              <FileText size={20} className="text-[#00b7eb]" />
            </div>
            <div>
              <h2 className="font-semibold text-white">PDF do Checklist</h2>
              <p className="text-xs text-white/50">Gera o relatório de um checklist pelo ID</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-white/70" htmlFor="input-checklist-id">
              ID do Checklist
            </label>
            <input
              id="input-checklist-id"
              type="text"
              value={checklistId}
              onChange={(e) => {
                setChecklistId(e.target.value);
                if (erroChecklist) setErroChecklist('');
              }}
              placeholder="Ex: 664f1a2b3c4d5e6f7a8b9c0d"
              aria-label="ID do checklist"
              className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#00b7eb] transition-colors"
            />
            <div aria-live="polite">
              {erroChecklist && (
                <p className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle size={14} /> {erroChecklist}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleGerarPdfChecklist}
            aria-label="Gerar PDF do checklist"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0052cc] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#00b7eb] hover:text-[#00112b]"
          >
            <Download size={16} />
            Gerar PDF do Checklist
          </button>
        </div>

        {/* Card: PDF de Inspeções por Placa */}
        <div className="rounded-xl border border-[#33ccff]/30 bg-[#002b45]/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0052cc]/40">
              <FileText size={20} className="text-[#00b7eb]" />
            </div>
            <div>
              <h2 className="font-semibold text-white">PDF de Inspeções</h2>
              <p className="text-xs text-white/50">Gera o relatório de inspeções por placa</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-white/70" htmlFor="input-placa-relatorio">
              Placa do Veículo
            </label>
            <input
              id="input-placa-relatorio"
              type="text"
              value={placa}
              onChange={(e) => {
                setPlaca(e.target.value);
                if (erroPlaca) setErroPlaca('');
              }}
              placeholder="Ex: ABC1234"
              aria-label="Placa do veículo"
              className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#00b7eb] transition-colors"
            />
            <div aria-live="polite">
              {erroPlaca && (
                <p className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle size={14} /> {erroPlaca}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleGerarPdfInspecoes}
            aria-label="Gerar PDF de inspeções por placa"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0052cc] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#00b7eb] hover:text-[#00112b]"
          >
            <Download size={16} />
            Gerar PDF de Inspeções
          </button>
        </div>
      </div>
    </section>
  );
}

export default Relatorios;
