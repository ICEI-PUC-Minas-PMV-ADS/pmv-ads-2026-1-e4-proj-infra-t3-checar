import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useState } from 'react';

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function handleExportarDados() {
    try {
      const res = await api.get('/meus-dados');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meus-dados-checar.json';
      a.click();
      URL.revokeObjectURL(url);
      setMensagem('Seus dados foram exportados com sucesso.');
      setErro('');
    } catch {
      setErro('Erro ao exportar dados. Tente novamente.');
      setMensagem('');
    }
  }

  async function handleSolicitarExclusao() {
    const confirmar = window.confirm(
      'Tem certeza que deseja solicitar a exclusão dos seus dados? Esta ação não pode ser desfeita.'
    );
    if (!confirmar) return;

    try {
      await api.delete('/me');
      setMensagem('Seus dados pessoais foram removidos conforme a LGPD.');
      setErro('');
    } catch {
      setErro('Erro ao solicitar exclusão. Tente novamente.');
      setMensagem('');
    }
  }

  return (
    <div className="min-h-screen bg-[#00112b] text-white px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[#00b7eb] hover:underline text-sm"
        >
          &#8592; Voltar
        </button>

        <h1 className="mb-8 text-3xl font-bold text-white">
          Política de Privacidade — CHECAR
        </h1>

        {mensagem && (
          <div className="mb-6 rounded-lg border border-green-500/40 bg-green-950/30 px-4 py-3 text-sm text-green-300">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        {/* Seção 1 — Dados coletados */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-[#00b7eb]">1. Dados coletados</h2>
          <p className="text-white/80 leading-relaxed">
            O CHECAR coleta os seguintes dados pessoais para o funcionamento da plataforma:
          </p>
          <ul className="mt-3 list-disc pl-6 text-white/80 space-y-1">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Tipo de usuário (Motorista ou Gestor)</li>
            <li>Registros de checklists e inspeções de veículos</li>
            <li>Tokens de dispositivo para notificações push (FCM)</li>
            <li>Registros de auditoria de ações realizadas no sistema</li>
          </ul>
        </section>

        {/* Seção 2 — Como usamos */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-[#00b7eb]">2. Como usamos seus dados</h2>
          <p className="text-white/80 leading-relaxed">
            Seus dados são utilizados exclusivamente para:
          </p>
          <ul className="mt-3 list-disc pl-6 text-white/80 space-y-1">
            <li>Autenticar e identificar você na plataforma</li>
            <li>Permitir o registro e consulta de checklists e inspeções</li>
            <li>Enviar notificações relacionadas às suas atividades</li>
            <li>Garantir a segurança e integridade do sistema por meio de logs de auditoria</li>
            <li>Cumprir obrigações legais e regulatórias</li>
          </ul>
          <p className="mt-3 text-white/80 leading-relaxed">
            Seus dados <strong>não são vendidos</strong> nem compartilhados com terceiros
            sem seu consentimento, exceto quando exigido por lei.
          </p>
        </section>

        {/* Seção 3 — Seus direitos LGPD */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-[#00b7eb]">
            3. Seus direitos (LGPD — Art. 18)
          </h2>
          <p className="text-white/80 leading-relaxed mb-3">
            Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você possui
            os seguintes direitos em relação aos seus dados pessoais:
          </p>
          <ul className="list-disc pl-6 text-white/80 space-y-2">
            <li>
              <strong>Acesso:</strong> obter confirmação da existência de tratamento e acesso
              aos seus dados.
            </li>
            <li>
              <strong>Correção:</strong> solicitar a correção de dados incompletos, inexatos
              ou desatualizados.
            </li>
            <li>
              <strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários,
              excessivos ou tratados em desconformidade com a LGPD.
            </li>
            <li>
              <strong>Portabilidade:</strong> receber seus dados em formato estruturado.
            </li>
            <li>
              <strong>Eliminação:</strong> solicitar a exclusão dos dados tratados com seu
              consentimento.
            </li>
            <li>
              <strong>Revogação do consentimento:</strong> retirar o consentimento dado a
              qualquer momento.
            </li>
            <li>
              <strong>Informação:</strong> ser informado sobre com quem seus dados são
              compartilhados.
            </li>
          </ul>

          {user ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleExportarDados}
                className="rounded-xl bg-[#00b7eb] px-5 py-2.5 font-semibold text-[#00112b] transition hover:bg-white"
              >
                Exportar meus dados
              </button>
              <button
                onClick={handleSolicitarExclusao}
                className="rounded-xl border border-red-500/60 px-5 py-2.5 font-semibold text-red-400 transition hover:bg-red-950/40"
              >
                Solicitar exclusão dos meus dados
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/50">
              Faça{' '}
              <a href="/login" className="text-[#00b7eb] underline">
                login
              </a>{' '}
              para exportar ou solicitar exclusão dos seus dados.
            </p>
          )}
        </section>

        {/* Seção 4 — Contato DPO */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-[#00b7eb]">
            4. Contato — Encarregado de Dados (DPO)
          </h2>
          <p className="text-white/80 leading-relaxed">
            Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento dos seus
            dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados:
          </p>
          <ul className="mt-3 text-white/80 space-y-1">
            <li>
              <strong>E-mail:</strong>{' '}
              <a href="mailto:privacidade@checar.app" className="text-[#00b7eb] underline">
                privacidade@checar.app
              </a>
            </li>
            <li>
              <strong>Prazo de resposta:</strong> até 15 dias úteis, conforme a LGPD.
            </li>
          </ul>
        </section>

        <p className="text-xs text-white/30">
          Última atualização: junho de 2026. Versão 1.0.
        </p>
      </div>
    </div>
  );
}
