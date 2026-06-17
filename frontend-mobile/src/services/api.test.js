// Tests for getBaseUrl() logic and axios config in api.js.
// Uses require() (not dynamic import) because jest-expo uses Babel (ESM→CJS).
// jest.resetModules() clears the module cache so each test gets a fresh evaluation.

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('axios', () => ({
  create: jest.fn(() => ({})),
}));

describe('api service — getBaseUrl', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    console.warn.mockRestore();
  });

  it('retorna EXPO_PUBLIC_API_URL quando a variável de ambiente está definida', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.100:3000';

    const { BASE_URL } = require('./api.js');

    expect(BASE_URL).toBe('http://192.168.1.100:3000');
  });

  it('retorna endereço do emulador Android quando plataforma é android e sem env var', () => {
    const rn = require('react-native');
    rn.Platform.OS = 'android';

    const { BASE_URL } = require('./api.js');

    expect(BASE_URL).toBe('http://10.0.2.2:3000');
  });

  it('retorna localhost quando plataforma é ios e sem env var', () => {
    const rn = require('react-native');
    rn.Platform.OS = 'ios';

    const { BASE_URL } = require('./api.js');

    expect(BASE_URL).toBe('http://localhost:3000');
  });

  it('cria instância axios com timeout e Content-Type corretos', () => {
    const axios = require('axios');

    require('./api.js');

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 15000,
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('usa EXPO_PUBLIC_API_URL como baseURL na instância axios', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://10.0.0.5:3000';
    const axios = require('axios');

    require('./api.js');

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'http://10.0.0.5:3000/api' })
    );
  });
});
