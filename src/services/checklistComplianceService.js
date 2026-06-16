import ItemChecklist from '../itemchecklist.js';
import Checklist from '../checklist.js';
import Vehicle from '../models/Vehicle.js';
import { enqueueNotificacao } from '../queues/notificationQueue.js';

export const calcularConformidade = async (checklistId) => {
    const itens = await ItemChecklist.find({ checklistId });
    if (itens.length === 0) return;

    const conforme = itens.every((i) => i.status === 'Conforme');
    const status   = conforme ? ['disponivel'] : ['com problema'];

    const checklist = await Checklist.findByIdAndUpdate(
        checklistId,
        { conformidade: conforme, status },
        { new: true }
    );

    if (!checklist || conforme) return;

    let placa = '';
    if (checklist.veiculoId) {
        const veiculo = await Vehicle.findById(checklist.veiculoId).lean();
        placa = veiculo?.plate || '';
    }

    enqueueNotificacao({
        tipo:        'FALHA_CRITICA',
        mensagem:    `Checklist com itens NÃO CONFORMES registrado para o veículo ${placa || ''}`.trim(),
        checklistId: checklist._id,
        veiculoId:   checklist.veiculoId,
        usuarioId:   checklist.usuarioId,
        placa,
    }).catch((err) => console.error('[Notificação] Erro ao enfileirar:', err.message));
};
