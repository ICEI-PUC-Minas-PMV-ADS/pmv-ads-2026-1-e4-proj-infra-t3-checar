// Tests for getBaseUrl() logic in api.js
// Verifies platform detection and EXPO_PUBLIC_API_URL override

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
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
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns EXPO_PUBLIC_API_URL when defined', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.100:3000';

    const { BASE_URL } = await import('./api.js');

    expect(BASE_URL).toBe('http://192.168.1.100:3000');
  });

  it('returns Android emulator address when platform is android and no env var', async () => {
    const { Platform } = require('react-native');
    Platform.OS = 'android';

    const { BASE_URL } = await import('./api.js');

    expect(BASE_URL).toBe('http://10.0.2.2:3000');
  });

  it('returns localhost when platform is ios and no env var', async () => {
    const { Platform } = require('react-native');
    Platform.OS = 'ios';

    const { BASE_URL } = await import('./api.js');

    expect(BASE_URL).toBe('http://localhost:3000');
  });

  it('creates axios instance with correct base config', async () => {
    const axios = require('axios');
    axios.create.mockReturnValue({});

    await import('./api.js');

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 15000,
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('uses EXPO_PUBLIC_API_URL as baseURL in axios instance', async () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://10.0.0.5:3000';
    const axios = require('axios');
    axios.create.mockReturnValue({});

    await import('./api.js');

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'http://10.0.0.5:3000' })
    );
  });
});
