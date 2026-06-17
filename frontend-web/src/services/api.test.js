import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetIdToken = vi.fn();
let mockCurrentUser = null;

vi.mock('firebase/auth', () => ({
  getIdToken: (...args) => mockGetIdToken(...args),
}));

vi.mock('./firebaseConfig', () => ({
  auth: {
    get currentUser() {
      return mockCurrentUser;
    },
  },
}));

vi.mock('./authState', () => ({
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
import { triggerUnauthorized } from './authState';

import './api.js';
const axiosInstance = axios.create.mock.results[0].value;

const requestInterceptorFn = axiosInstance.interceptors.request.use.mock.calls[0][0];
const [responseSuccessFn, responseErrorFn] =
  axiosInstance.interceptors.response.use.mock.calls[0];

describe('frontend-web api service', () => {
  beforeEach(() => {
    mockCurrentUser = null;
    mockGetIdToken.mockReset();
    triggerUnauthorized.mockReset();
  });

  describe('request interceptor', () => {
    it('uses fresh Firebase token when currentUser is signed in', async () => {
      mockCurrentUser = { uid: 'firebase-uid-123' };
      mockGetIdToken.mockResolvedValue('fresh-token-xyz');

      const config = { headers: {} };
      const result = await requestInterceptorFn(config);

      expect(result.headers['Authorization']).toBe('Bearer fresh-token-xyz');
      expect(result.headers['X-User-Id']).toBe('firebase-uid-123');
    });

    it('does not attach Authorization when no Firebase user', async () => {
      const config = { headers: {} };
      const result = await requestInterceptorFn(config);

      expect(result.headers['Authorization']).toBeUndefined();
    });
  });

  describe('response interceptor (error path)', () => {
    const makeError = (status, data = {}) => ({
      response: { status, data },
      message: 'Request failed',
    });

    it('calls triggerUnauthorized on 401 when user is signed in', async () => {
      mockCurrentUser = { uid: 'u1' };
      const error = makeError(401, { erro: 'Falha na autenticação.' });

      await expect(responseErrorFn(error)).rejects.toBeDefined();
      expect(triggerUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('does NOT logout on 401 when token was missing', async () => {
      mockCurrentUser = { uid: 'u1' };
      const error = makeError(401, { erro: 'Token de autenticação obrigatório.' });

      await expect(responseErrorFn(error)).rejects.toBeDefined();
      expect(triggerUnauthorized).not.toHaveBeenCalled();
    });
  });

  describe('response interceptor (success path)', () => {
    it('passes the response through unchanged', () => {
      const response = { status: 200, data: { id: 1 } };
      expect(responseSuccessFn(response)).toBe(response);
    });
  });
});
