import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks must be declared before any imports that use the mocked modules
vi.mock('./authState', () => ({
  getCurrentUser:      vi.fn(() => null),
  triggerUnauthorized: vi.fn(),
  setOnUnauthorized:   vi.fn(),
}));

vi.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: { create: vi.fn(() => mockInstance) } };
});

import axios from 'axios';
import { getCurrentUser, triggerUnauthorized } from './authState';

// Importing api.js triggers axios.create() + interceptor registration at module load.
// Capture references NOW, before any beforeEach can wipe mock state.
import './api.js';
const axiosInstance = axios.create.mock.results[0].value;

const requestInterceptorFn = axiosInstance.interceptors.request.use.mock.calls[0][0];

const [responseSuccessFn, responseErrorFn] =
  axiosInstance.interceptors.response.use.mock.calls[0];

describe('frontend-web api service', () => {
  beforeEach(() => {
    // Only reset the mocks we actually mutate per-test.
    // Do NOT use clearAllMocks — it wipes axios.create.mock.results.
    getCurrentUser.mockReset();
    getCurrentUser.mockReturnValue(null);
    triggerUnauthorized.mockReset();
  });

  // ── Instance creation ────────────────────────────────────────────────────

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
    expect(axiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
    expect(axiosInstance.interceptors.request.use).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('registers exactly one response interceptor', () => {
    expect(axiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
    expect(axiosInstance.interceptors.response.use).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function)
    );
  });

  // ── Request interceptor ──────────────────────────────────────────────────

  describe('request interceptor', () => {
    it('attaches X-User-Id and Authorization when user is authenticated', () => {
      getCurrentUser.mockReturnValue({ uid: 'firebase-uid-123', token: 'jwt-token-abc' });

      const config = { headers: {} };
      const result = requestInterceptorFn(config);

      expect(result.headers['X-User-Id']).toBe('firebase-uid-123');
      expect(result.headers['Authorization']).toBe('Bearer jwt-token-abc');
    });

    it('attaches only X-User-Id when token is absent', () => {
      getCurrentUser.mockReturnValue({ uid: 'firebase-uid-123', token: null });

      const config = { headers: {} };
      const result = requestInterceptorFn(config);

      expect(result.headers['X-User-Id']).toBe('firebase-uid-123');
      expect(result.headers['Authorization']).toBeUndefined();
    });

    it('leaves headers unchanged when no user is authenticated', () => {
      getCurrentUser.mockReturnValue(null);

      const config = { headers: {} };
      const result = requestInterceptorFn(config);

      expect(result.headers['X-User-Id']).toBeUndefined();
      expect(result.headers['Authorization']).toBeUndefined();
    });

    it('leaves headers unchanged when getCurrentUser returns undefined', () => {
      getCurrentUser.mockReturnValue(undefined);

      const config = { headers: {} };
      const result = requestInterceptorFn(config);

      expect(result.headers['X-User-Id']).toBeUndefined();
    });

    it('returns the same config object reference', () => {
      const config = { headers: {}, url: '/veiculos' };
      const result = requestInterceptorFn(config);

      expect(result).toBe(config);
    });
  });

  // ── Response interceptor ─────────────────────────────────────────────────

  describe('response interceptor (success path)', () => {
    it('passes the response through unchanged', () => {
      const response = { status: 200, data: { id: 1 } };
      expect(responseSuccessFn(response)).toBe(response);
    });
  });

  describe('response interceptor (error path)', () => {
    const makeError = (status, data = {}) => ({
      response: { status, data },
      message: 'Request failed',
    });

    it('calls triggerUnauthorized on 401', async () => {
      const error = makeError(401, { mensagem: 'Token expirado' });

      await expect(responseErrorFn(error)).rejects.toMatchObject({ response: { status: 401 } });
      expect(triggerUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('does NOT call triggerUnauthorized on other 4xx errors', async () => {
      const error = makeError(403, { mensagem: 'Proibido' });

      await expect(responseErrorFn(error)).rejects.toBeDefined();
      expect(triggerUnauthorized).not.toHaveBeenCalled();
    });

    it('normalizes error.message from backend "mensagem" field', async () => {
      const error = makeError(422, { mensagem: 'Campo obrigatório' });

      await expect(responseErrorFn(error)).rejects.toMatchObject({
        message: 'Campo obrigatório',
      });
    });

    it('normalizes error.message from backend "erro" field', async () => {
      const error = makeError(400, { erro: 'Dados inválidos' });

      await expect(responseErrorFn(error)).rejects.toMatchObject({
        message: 'Dados inválidos',
      });
    });

    it('normalizes error.message from backend "message" field', async () => {
      const error = makeError(500, { message: 'Internal server error' });

      await expect(responseErrorFn(error)).rejects.toMatchObject({
        message: 'Internal server error',
      });
    });

    it('prefers "mensagem" over "erro" when both are present', async () => {
      const error = makeError(400, { mensagem: 'Mensagem', erro: 'Erro' });

      await expect(responseErrorFn(error)).rejects.toMatchObject({
        message: 'Mensagem',
      });
    });

    it('sets network error message when there is no response', async () => {
      const error = { message: 'Network Error' }; // no .response property

      await expect(responseErrorFn(error)).rejects.toMatchObject({
        message: 'Erro de conexão. Verifique sua rede.',
      });
    });

    it('keeps original axios message when server returns no message fields', async () => {
      const error = makeError(500, {}); // data has no mensagem/erro/message

      await expect(responseErrorFn(error)).rejects.toMatchObject({
        message: 'Request failed', // original preserved
      });
    });
  });
});
