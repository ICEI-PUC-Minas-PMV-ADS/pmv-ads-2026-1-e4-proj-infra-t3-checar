import { Resend } from 'resend';

const FROM = process.env.EMAIL_FROM || 'notificacoes@checar.app';

const getClient = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    return new Resend(key);
};

/**
 * Envia e-mail de falha crítica ao gestor.
 * Se RESEND_API_KEY não estiver configurada, loga e retorna sem erro (fallback dev).
 *
 * @param {object} opts
 * @param {string} opts.to        — e-mail do destinatário
 * @param {string} opts.placa     — placa do veículo
 * @param {string} opts.motorista — nome do motorista
 * @param {string} opts.checklistId
 */
const enviarEmailFalhaCritica = async ({ to, placa, motorista, checklistId }) => {
    const client = getClient();
    if (!client) {
        console.log(`[Email] (dev) Falha crítica — ${placa} — ${motorista}`);
        return;
    }

    await client.emails.send({
        from: FROM,
        to,
        subject: `[CHECAR] Falha crítica no veículo ${placa}`,
        html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;">
        <div style="background:#004aad;padding:24px 32px;border-radius:8px 8px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;">CHECAR — Alerta de Falha Crítica</h1>
        </div>
        <div style="background:#f9fafb;padding:24px 32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
          <p style="color:#111827;font-size:15px;">
            Um checklist com <strong style="color:#dc2626;">itens NÃO CONFORMES</strong> foi registrado.
          </p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="color:#6b7280;padding:6px 0;font-size:13px;">Veículo:</td>
                <td style="color:#111827;font-weight:bold;font-size:13px;">${placa}</td></tr>
            <tr><td style="color:#6b7280;padding:6px 0;font-size:13px;">Motorista:</td>
                <td style="color:#111827;font-size:13px;">${motorista || '—'}</td></tr>
            <tr><td style="color:#6b7280;padding:6px 0;font-size:13px;">Checklist ID:</td>
                <td style="color:#111827;font-size:13px;font-family:monospace;">${checklistId}</td></tr>
          </table>
          <p style="color:#6b7280;font-size:12px;margin-top:24px;">
            CHECAR — Sistema de Gestão de Frotas
          </p>
        </div>
      </div>`,
    });
};

export { enviarEmailFalhaCritica };
