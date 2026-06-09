import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks must be declared before any imports that use the mocked modules
vi.mock('./authState', () => ({
  getCurrentUser: vi.fn(() => null),
}));

vi.mock('axios', () => {
  const mockInstance = {
    interceptors: { request: { use: vi.fn() } },
  };
  return { default: { create: vi.fn(() => mockInstance) } };
});

import axios from 'axios';
import { getCurrentUser } from './authState';

// Importing api.js triggers axios.create() + interceptors.request.use() at module load.
// Capture the instance NOW, before any beforeEach can clear the mock state.
import './api.js';
const axiosInstance   = axios.create.mock.results[0].value;
const interceptorFn   = axiosInstance.interceptors.request.use.mock.calls[0][0];

describe('frontend-web api service', () => {
  beforeEach(() => {
    // Only reset getCurrentUser between tests — do NOT clearAllMocks,
    // which would wipe axios.create.mock.results and break the instance ref
    getCurrentUser.mockReset();
    getCurrentUser.mockReturnValue(null);
  });

  // ── Instance creation ────────────────────────────────────────────────

  it('creates axios instance with correct base config', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '/api',
        timeout: 15000,
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('registers exactly one request interceptor', () => {
    expect(axiosInstance.interceptors.request.use).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  // ── Interceptor behaviour ────────────────────────────────────────────

  describe('request interceptor', () => {
    it('attaches X-User-Id and Authorization when user is authenticated', () => {
      getCurrentUser.mockReturnValue({ uid: 'firebase-uid-123', token: 'jwt-token-abc' });

      const config = { headers: {} };
      const result = interceptorFn(config);

      expect(result.headers['X-User-Id']).toBe('firebase-uid-123');
      expect(result.headers['Authorization']).toBe('Bearer jwt-token-abc');
    });

    it('attaches only X-User-Id when token is absent', () => {
      getCurrentUser.mockReturnValue({ uid: 'firebase-uid-123', token: null });

      const config = { headers: {} };
      const result = interceptorFn(config);

      expect(result.headers['X-User-Id']).toBe('firebase-uid-123');
      expect(result.headers['Authorization']).toBeUndefined();
    });

    it('leaves headers unchanged when no user is authenticated', () => {
      getCurrentUser.mockReturnValue(null);

      const config = { headers: {} };
      const result = interceptorFn(config);

      expect(result.headers['X-User-Id']).toBeUndefined();
      expect(result.headers['Authorization']).toBeUndefined();
    });

    it('leaves headers unchanged when getCurrentUser returns undefined', () => {
      getCurrentUser.mockReturnValue(undefined);

      const config = { headers: {} };
      const result = interceptorFn(config);

      expect(result.headers['X-User-Id']).toBeUndefined();
    });

    it('returns the same config object reference', () => {
      const config = { headers: {}, url: '/veiculos' };
      const result = interceptorFn(config);

      expect(result).toBe(config);
    });
  });
});
