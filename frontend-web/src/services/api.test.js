import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock axios before importing the module under test
vi.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      request: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
    },
  };
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

import axios from 'axios';
import apiModule from './api.js';

describe('frontend-web api service', () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  it('creates axios instance with correct base config', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '/api',
        timeout: 15000,
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('registers a request interceptor', () => {
    const instance = axios.create.mock.results[0].value;
    expect(instance.interceptors.request.use).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  describe('request interceptor', () => {
    let interceptorFn;

    beforeEach(() => {
      const instance = axios.create.mock.results[0].value;
      interceptorFn = instance.interceptors.request.use.mock.calls[0][0];
    });

    it('attaches X-User-Id header when user is in sessionStorage', () => {
      sessionStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 'user-123', nome: 'Test' }));

      const config = { headers: {} };
      const result = interceptorFn(config);

      expect(result.headers['X-User-Id']).toBe('user-123');
    });

    it('leaves headers unchanged when sessionStorage has no user', () => {
      sessionStorageMock.getItem.mockReturnValue(null);

      const config = { headers: {} };
      const result = interceptorFn(config);

      expect(result.headers['X-User-Id']).toBeUndefined();
    });

    it('ignores malformed JSON in sessionStorage without throwing', () => {
      sessionStorageMock.getItem.mockReturnValue('not-valid-json');

      const config = { headers: {} };
      expect(() => interceptorFn(config)).not.toThrow();
      expect(config.headers['X-User-Id']).toBeUndefined();
    });

    it('does not attach header when parsed user has no id field', () => {
      sessionStorageMock.getItem.mockReturnValue(JSON.stringify({ nome: 'Test' }));

      const config = { headers: {} };
      const result = interceptorFn(config);

      expect(result.headers['X-User-Id']).toBeUndefined();
    });

    it('returns the config object unchanged', () => {
      sessionStorageMock.getItem.mockReturnValue(null);

      const config = { headers: {}, url: '/usuarios' };
      const result = interceptorFn(config);

      expect(result).toBe(config);
    });
  });
});
