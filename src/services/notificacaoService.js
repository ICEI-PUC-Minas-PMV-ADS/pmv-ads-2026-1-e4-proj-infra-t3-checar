import { admin, initFirebase } from '../config/firebase.js';
import Notificacao from '../models/Notificacao.js';
import FcmToken from '../models/FcmToken.js';

/**
 * Cria uma notificação no banco e envia push FCM para todos os tokens do usuário.
 * Se as credenciais FCM não estiverem configuradas, salva no banco sem push.
 */
const enviarNotificacao = async ({ tipo, mensagem, checklistId, veiculoId, usuarioId }) => {
  // 1 — Persistir no banco independente do push
  const notificacao = await Notificacao.create({
    tipo,
    mensagem,
    checklistId,
    veiculoId,
    usuarioId,
  });

  // 2 — Tentar enviar push (reutiliza inicialização centralizada de src/config/firebase.js)
  if (!initFirebase()) return notificacao;

  try {
    const tokens = await FcmToken.find({ usuarioId: String(usuarioId) }).lean();
    if (tokens.length === 0) return notificacao;

    const tokenStrings = tokens.map((t) => t.token);
    const payload = {
      notification: { title: 'Checar — Falha Crítica', body: mensagem },
      data: {
        tipo,
        checklistId: String(checklistId || ''),
        veiculoId:   String(veiculoId   || ''),
      },
      tokens: tokenStrings,
    };

    const response = await admin.messaging().sendEachForMulticast(payload);

    // Remove tokens inválidos automaticamente
    const invalidos = response.responses
      .map((r, i) => (!r.success ? tokenStrings[i] : null))
      .filter(Boolean);

    if (invalidos.length > 0) {
      await FcmToken.deleteMany({ token: { $in: invalidos } });
    }

    await notificacao.updateOne({ pushEnviado: true });
  } catch (err) {
    console.error('[FCM] Erro ao enviar push:', err.message);
  }

  return notificacao;
};

/**
 * Dispara notificação de falha crítica quando checklist tem itens não conformes.
 */
const notificarFalhaCritica = async ({ checklistId, veiculoId, usuarioId, placa }) => {
  return enviarNotificacao({
    tipo: 'FALHA_CRITICA',
    mensagem: `Checklist com itens NÃO CONFORMES registrado para o veículo ${placa || ''}`.trim(),
    checklistId,
    veiculoId,
    usuarioId,
  });
};

export { enviarNotificacao, notificarFalhaCritica };
