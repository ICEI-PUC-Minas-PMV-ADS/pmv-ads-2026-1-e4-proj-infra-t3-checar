import { jest } from '@jest/globals';
import { set, get, del, delByPrefix } from '../services/memoryCache.js';

describe('memoryCache', () => {
  beforeEach(() => {
    // Clear any residual cache between tests
    delByPrefix('');
  });

  describe('set / get', () => {
    it('stores and retrieves a value within TTL', async () => {
      set('key1', { data: 42 }, 5000);
      const result = get('key1');
      expect(result).toEqual({ data: 42 });
    });

    it('returns null for unknown key', () => {
      expect(get('nonexistent')).toBeNull();
    });

    it('returns null after TTL expires', async () => {
      jest.useFakeTimers();
      set('key2', 'value', 100);

      jest.advanceTimersByTime(200);

      expect(get('key2')).toBeNull();
      jest.useRealTimers();
    });

    it('overwrites existing key with new value', () => {
      set('key3', 'first', 5000);
      set('key3', 'second', 5000);
      expect(get('key3')).toBe('second');
    });
  });

  describe('del', () => {
    it('removes a specific key', () => {
      set('delme', 'value', 5000);
      del('delme');
      expect(get('delme')).toBeNull();
    });

    it('does not throw for unknown key', () => {
      expect(() => del('unknown')).not.toThrow();
    });
  });

  describe('delByPrefix', () => {
    it('removes all keys matching prefix', () => {
      set('grupo:a', 1, 5000);
      set('grupo:b', 2, 5000);
      set('outro:c', 3, 5000);

      delByPrefix('grupo:');

      expect(get('grupo:a')).toBeNull();
      expect(get('grupo:b')).toBeNull();
      expect(get('outro:c')).toBe(3); // unaffected
    });

    it('removes nothing when prefix does not match', () => {
      set('abc', 'stays', 5000);
      delByPrefix('xyz');
      expect(get('abc')).toBe('stays');
    });
  });
});
