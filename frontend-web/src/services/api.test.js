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

import './api.js';
const axiosInstance = axios.create.mock.results[0].value;

const requestInterceptorFn = axiosInstance.interceptors.request.use.mock.calls[0][0];

const [responseSuccessFn, responseErrorFn] =
  axiosInstance.interceptors.response.use.mock.calls[0];

describe('frontend-web api service', () => {
  beforeEach(() => {
    mockCurrentUser = null;
    mockGetIdToken.mockReset();
    getCurrentUser.mockReset();
    getCurrentUser.mockReturnValue(null);
    triggerUnauthorized.mockReset();
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

  describe('request interceptor', () => {
    it('uses fresh Firebase token when currentUser is signed in', async () => {
      const firebaseUser = { uid: 'firebase-uid-123' };
      mockCurrentUser = firebaseUser;
      mockGetIdToken.mockResolvedValue('fresh-token-xyz');

      const config = { headers: {} };
      const result = await requestInterceptorFn(config);

      expect(mockGetIdToken).toHaveBeenCalledWith(firebaseUser);
      expect(result.headers['X-User-Id']).toBe('firebase-uid-123');
      expect(result.headers['Authorization']).toBe('Bearer fresh-token-xyz');
    });

    it('falls back to authState when Firebase has no currentUser', async () => {
      getCurrentUser.mockReturnValue({ uid: 'cached-uid', token: 'cached-token' });

      const config = { headers: {} };
      const result = await requestInterceptorFn(config);

      expect(result.headers['X-User-Id']).toBe('cached-uid');
      expect(result.headers['Authorization']).toBe('Bearer cached-token');
    });

    it('leaves headers unchanged when no user is authenticated', async () => {
      const config = { headers: {} };
      const result = await requestInterceptorFn(config);

      expect(result.headers['X-User-Id']).toBeUndefined();
      expect(result.headers['Authorization']).toBeUndefined();
    });
  });

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
  });
});
