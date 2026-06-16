import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { enviarNotificacao } from '../services/notificacaoService.js';
import { enviarEmailFalhaCritica } from '../services/emailService.js';
import Usuario from '../models/Usuario.js';

const QUEUE_NAME = 'notifications';

// Conexão Redis — obrigatória para BullMQ.
// Se REDIS_URL não estiver configurada, a fila não é criada e as notificações
// são enviadas de forma síncrona como fallback.
const createConnection = () => {
    const url = process.env.REDIS_URL;
    if (!url) return null;
    return new IORedis(url, { maxRetriesPerRequest: null });
};

let queue = null;
let worker = null;

export const initNotificationQueue = () => {
    const connection = createConnection();
    if (!connection) {
        console.log('[Queue] REDIS_URL ausente — notificações serão enviadas de forma direta.');
        return;
    }

    queue = new Queue(QUEUE_NAME, { connection });

    worker = new Worker(
        QUEUE_NAME,
        async (job) => {
            const { tipo, checklistId, veiculoId, usuarioId, placa } = job.data;

            // 1 — Persistir no banco + push FCM
            await enviarNotificacao({ tipo, mensagem: job.data.mensagem, checklistId, veiculoId, usuarioId });

            // 2 — E-mail ao gestor (se configurado)
            if (process.env.GESTOR_EMAIL) {
                const motorista = usuarioId
                    ? await Usuario.findById(usuarioId).select('nome').lean()
                    : null;
                await enviarEmailFalhaCritica({
                    to: process.env.GESTOR_EMAIL,
                    placa,
                    motorista: motorista?.nome,
                    checklistId,
                }).catch((err) => console.error('[Email] Erro:', err.message));
            }
        },
        { connection, concurrency: 5 }
    );

    worker.on('failed', (job, err) => {
        console.error(`[Queue] Job ${job?.id} falhou:`, err.message);
    });

    console.log('[Queue] Fila de notificações iniciada.');
};

/**
 * Enfileira uma notificação de falha crítica.
 * Se Redis não estiver disponível, envia diretamente.
 */
export const enqueueNotificacao = async (payload) => {
    if (!queue) {
        // Fallback sem Redis: envia diretamente
        await enviarNotificacao(payload);
        return;
    }
    await queue.add('falha-critica', payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
    });
};
