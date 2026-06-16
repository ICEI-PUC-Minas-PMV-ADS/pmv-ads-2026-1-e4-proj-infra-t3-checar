import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@checar_cache_';
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const set = async (key, data, ttlMs = DEFAULT_TTL_MS) => {
  const entry = { data, expiresAt: Date.now() + ttlMs };
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
};

const get = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      await AsyncStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
};

const remove = async (key) => {
  await AsyncStorage.removeItem(PREFIX + key);
};

const clear = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith(PREFIX));
  if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
};

// Cache keys usados no app
const KEYS = {
  VEICULOS:          'veiculos',
  MODELOS:           'modelos_checklist',
  INSPECOES_RECENTES:'inspecoes_recentes',
};

const TTL = {
  VEICULOS:           10 * 60 * 1000, // 10 min
  MODELOS:            30 * 60 * 1000, // 30 min (raramente mudam)
  INSPECOES_RECENTES:  5 * 60 * 1000, // 5 min
};

export { set, get, remove, clear, KEYS, TTL };
