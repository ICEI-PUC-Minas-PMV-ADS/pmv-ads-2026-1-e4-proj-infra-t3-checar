const store = new Map();

/**
 * Simples cache em memória com TTL.
 * @param {string} key
 * @param {any} value
 * @param {number} ttlMs - tempo de vida em ms (padrão: 60 s)
 */
const set = (key, value, ttlMs = 60_000) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const get = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

const del = (key) => store.delete(key);

const delByPrefix = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

export { set, get, del, delByPrefix };
