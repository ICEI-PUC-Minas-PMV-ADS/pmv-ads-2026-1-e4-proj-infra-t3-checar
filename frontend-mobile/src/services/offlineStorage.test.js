import AsyncStorage from '@react-native-async-storage/async-storage';
import { set, get, remove, clear, KEYS, TTL } from './offlineStorage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('offlineStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('set / get', () => {
    it('stores and retrieves a value within TTL', async () => {
      await set('vehicles', [{ plate: 'ABC123' }], 60000);
      const result = await get('vehicles');
      expect(result).toEqual([{ plate: 'ABC123' }]);
    });

    it('returns null for unknown key', async () => {
      const result = await get('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when TTL has expired', async () => {
      // Store with a TTL in the past
      const entry = { data: 'stale', expiresAt: Date.now() - 1000 };
      await AsyncStorage.setItem('@checar_cache_expired', JSON.stringify(entry));

      const result = await get('expired');
      expect(result).toBeNull();
    });

    it('handles corrupt JSON gracefully', async () => {
      await AsyncStorage.setItem('@checar_cache_bad', 'not-json{{{');
      const result = await get('bad');
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('removes a stored key', async () => {
      await set('tmp', 'value', 60000);
      await remove('tmp');
      const result = await get('tmp');
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('removes all cache keys without touching non-cache keys', async () => {
      await set(KEYS.VEICULOS, [{ plate: 'XYZ' }], TTL.VEICULOS);
      await set(KEYS.MODELOS, [{ nome: 'Diário' }], TTL.MODELOS);
      await AsyncStorage.setItem('non_cache_key', 'preserved');

      await clear();

      expect(await get(KEYS.VEICULOS)).toBeNull();
      expect(await get(KEYS.MODELOS)).toBeNull();
      expect(await AsyncStorage.getItem('non_cache_key')).toBe('preserved');
    });
  });

  describe('KEYS / TTL constants', () => {
    it('exports expected cache keys', () => {
      expect(KEYS.VEICULOS).toBeDefined();
      expect(KEYS.MODELOS).toBeDefined();
      expect(KEYS.INSPECOES_RECENTES).toBeDefined();
    });

    it('TTL for modelos is longer than for inspecoes', () => {
      expect(TTL.MODELOS).toBeGreaterThan(TTL.INSPECOES_RECENTES);
    });
  });
});
