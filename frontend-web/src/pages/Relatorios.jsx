import { useState } from 'react';
import { FileText, Download, AlertCircle, Loader2 } from 'lucide-react';
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

function Relatorios() {
  const [checklistId, setChecklistId] = useState('');
  const [placa, setPlaca] = useState('');

  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [loadingInspecoes, setLoadingInspecoes] = useState(false);

  const [erroChecklist, setErroChecklist] = useState('');
  const [erroInspecoes, setErroInspecoes] = useState('');

  const handleGerarPdfChecklist = async () => {
    if (!checklistId.trim()) {
      setErroChecklist('Informe o ID do checklist.');
      return;
    }
    setErroChecklist('');
    setLoadingChecklist(true);
    try {
      await downloadBlob(
        `/relatorios/checklists/${checklistId.trim()}/pdf`,
        `checklist_${checklistId.trim()}.pdf`
      );
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? 'Apenas Gestores podem baixar relatórios.'
          : err.response?.status === 404
          ? 'Checklist não encontrado.'
          : 'Erro ao gerar o PDF. Tente novamente.';
      setErroChecklist(msg);
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleGerarPdfInspecoes = async () => {
    if (!placa.trim()) {
      setErroInspecoes('Informe a placa do veículo.');
      return;
    }
    setErroInspecoes('');
    setLoadingInspecoes(true);
    try {
      const placaUpper = placa.trim().toUpperCase();
      await downloadBlob(
        `/relatorios/inspecoes/${placaUpper}/pdf`,
        `inspecoes_${placaUpper}.pdf`
      );
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? 'Apenas Gestores podem baixar relatórios.'
          : err.response?.status === 404
          ? 'Nenhuma inspeção encontrada para esta placa.'
          : 'Erro ao gerar o PDF. Tente novamente.';
      setErroInspecoes(msg);
    } finally {
      setLoadingInspecoes(false);
    }
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
            disabled={loadingChecklist}
            aria-label="Gerar PDF do checklist"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0052cc] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#00b7eb] hover:text-[#00112b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingChecklist ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {loadingChecklist ? 'Gerando...' : 'Gerar PDF do Checklist'}
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
                if (erroInspecoes) setErroInspecoes('');
              }}
              placeholder="Ex: ABC1234"
              aria-label="Placa do veículo"
              className="w-full rounded-lg border border-[#33ccff]/30 bg-[#00112b] px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#00b7eb] transition-colors"
            />
            <div aria-live="polite">
              {erroInspecoes && (
                <p className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle size={14} /> {erroInspecoes}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleGerarPdfInspecoes}
            disabled={loadingInspecoes}
            aria-label="Gerar PDF de inspeções por placa"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0052cc] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#00b7eb] hover:text-[#00112b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingInspecoes ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {loadingInspecoes ? 'Gerando...' : 'Gerar PDF de Inspeções'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Relatorios;
