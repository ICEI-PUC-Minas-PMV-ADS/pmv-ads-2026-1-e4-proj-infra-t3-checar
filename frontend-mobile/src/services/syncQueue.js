import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = '@checar_sync_queue';

const loadQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveQueue = async (queue) => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Enfileira uma operação para sync posterior.
 * op: { method: 'POST'|'PUT'|'DELETE', url: string, data?: object }
 */
const enqueue = async (op) => {
  const queue = await loadQueue();
  queue.push({ ...op, enqueuedAt: Date.now() });
  await saveQueue(queue);
};

/**
 * Tenta processar a fila. Usa last-write-wins: executa na ordem de enfileiramento.
 * @param {import('axios').AxiosInstance} apiInstance - instância Axios já configurada
 */
const processar = async (apiInstance) => {
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) return;

  const queue = await loadQueue();
  if (queue.length === 0) return;

  const falhas = [];

  for (const op of queue) {
    try {
      const { method, url, data } = op;
      if (method === 'POST')   await apiInstance.post(url, data);
      else if (method === 'PUT')    await apiInstance.put(url, data);
      else if (method === 'DELETE') await apiInstance.delete(url);
    } catch {
      falhas.push(op);
    }
  }

  await saveQueue(falhas);
};

export { enqueue, processar };
