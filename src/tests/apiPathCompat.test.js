import { jest } from '@jest/globals';

const makeReq = (path, headers = {}, method = 'GET') => ({
  path,
  url: path,
  method,
  headers,
});

describe('apiPathCompat', () => {
  let apiPathCompat;
  let next;

  beforeAll(async () => {
    ({ default: apiPathCompat } = await import('../middlewares/apiPathCompat.js'));
  });

  beforeEach(() => {
    next = jest.fn();
  });

  const runCompat = (req) => {
    req.app = { handle: jest.fn() };
    apiPathCompat(req, {}, next);
    return req;
  };

  it('rewrites /vehicles to /api/vehicles for JSON requests', () => {
    const req = runCompat(makeReq('/vehicles', { accept: 'application/json' }));
    expect(req.url).toBe('/api/vehicles');
    expect(req.app.handle).toHaveBeenCalled();
  });

  it('does not rewrite when path already has /api', () => {
    const req = runCompat(makeReq('/api/vehicles', { accept: 'application/json' }));
    expect(req.url).toBe('/api/vehicles');
    expect(next).toHaveBeenCalled();
    expect(req.app.handle).not.toHaveBeenCalled();
  });

  it('does not rewrite browser navigation to /vehicles (HTML accept)', () => {
    const req = runCompat(makeReq('/vehicles', { accept: 'text/html,application/json' }));
    expect(req.url).toBe('/vehicles');
    expect(next).toHaveBeenCalled();
  });

  it('rewrites when Authorization Bearer is present', () => {
    const req = runCompat(makeReq('/modelochecklists', { authorization: 'Bearer token' }));
    expect(req.url).toBe('/api/modelochecklists');
    expect(req.app.handle).toHaveBeenCalled();
  });
});
