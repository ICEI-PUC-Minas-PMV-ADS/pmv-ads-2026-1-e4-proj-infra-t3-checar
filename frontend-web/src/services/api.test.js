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

const mockRequest = vi.fn();
vi.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      request:  { use: vi.fn() },
      response: { use: vi.fn() },
    },
    request: (...args) => mockRequest(...args),
  };
  return { default: { create: vi.fn(() => mockInstance) } };
});

import axios from 'axios';
import { triggerUnauthorized } from './authState';

import './api.js';
const axiosInstance = axios.create.mock.results[0].value;

const requestInterceptorFn = axiosInstance.interceptors.request.use.mock.calls[0][0];
const [, responseErrorFn] = axiosInstance.interceptors.response.use.mock.calls[0];

describe('frontend-web api service', () => {
  beforeEach(() => {
    mockCurrentUser = null;
    mockGetIdToken.mockReset();
    mockRequest.mockReset();
    triggerUnauthorized.mockReset();
  });

  it('attaches Firebase token when user is signed in', async () => {
    mockCurrentUser = { uid: 'uid-1' };
    mockGetIdToken.mockResolvedValue('token-abc');

    const config = { headers: {} };
    const result = await requestInterceptorFn(config);

    expect(result.headers['Authorization']).toBe('Bearer token-abc');
  });

  it('does NOT logout on generic 401', async () => {
    mockCurrentUser = { uid: 'uid-1' };
    mockRequest.mockRejectedValueOnce(new Error('retry failed'));
    const error = {
      config: { headers: {} },
      response: { status: 401, data: { erro: 'Falha na autenticação.' } },
      message: 'Request failed',
    };

    await expect(responseErrorFn(error)).rejects.toBeDefined();
    expect(triggerUnauthorized).not.toHaveBeenCalled();
  });

  it('uses detalhe from backend in error message', async () => {
    mockCurrentUser = { uid: 'uid-1' };
    mockRequest.mockRejectedValueOnce(new Error('retry failed'));
    const error = {
      config: { headers: {}, _authRetry: true },
      response: {
        status: 401,
        data: { erro: 'Falha na autenticação.', detalhe: 'Token expirado.' },
      },
      message: 'Request failed',
    };

    await expect(responseErrorFn(error)).rejects.toMatchObject({
      message: 'Token expirado.',
    });
  });
});
