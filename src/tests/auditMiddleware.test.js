import { jest } from '@jest/globals';

// Mock AuditLog before importing the middleware
jest.mock('../models/AuditLog.js', () => ({
  __esModule: true,
  default: { create: jest.fn().mockResolvedValue({}) },
}));

import auditMiddleware from '../middlewares/auditMiddleware.js';
import AuditLog from '../models/AuditLog.js';

const buildRes = (statusCode = 200) => {
  const res = {
    statusCode,
    json: null,
    _body: null,
  };
  res.json = jest.fn((body) => { res._body = body; return res; });
  return res;
};

const buildReq = (method, path, body = {}, headers = {}) => ({
  method,
  path,
  originalUrl: path,
  body,
  headers,
});

describe('auditMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not intercept GET requests', () => {
    const req  = buildReq('GET', '/vehicles');
    const res  = buildRes(200);
    const next = jest.fn();

    auditMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    // GET should never trigger AuditLog
    res.json({ some: 'data' });
    expect(AuditLog.create).not.toHaveBeenCalled();
  });

  it('logs POST as CREATE on 2xx response', async () => {
    const req  = buildReq('POST', '/checklists', { conformidade: true });
    const res  = buildRes(201);
    const next = jest.fn();

    auditMiddleware(req, res, next);
    res.json({ _id: '123' });

    // Wait for async create
    await new Promise((r) => setTimeout(r, 10));

    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        acao: 'CREATE',
        entidade: 'checklists',
        metodo: 'POST',
        statusCode: 201,
      })
    );
  });

  it('logs PUT as UPDATE', async () => {
    const req  = buildReq('PUT', '/vehicles/507f1f77bcf86cd799439011', { model: 'Uno' });
    const res  = buildRes(200);
    const next = jest.fn();

    auditMiddleware(req, res, next);
    res.json({ _id: '507f1f77bcf86cd799439011', model: 'Uno' });

    await new Promise((r) => setTimeout(r, 10));

    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        acao: 'UPDATE',
        entidade: 'vehicles',
        entidadeId: '507f1f77bcf86cd799439011',
      })
    );
  });

  it('logs DELETE as DELETE', async () => {
    const req  = buildReq('DELETE', '/vehicles/507f1f77bcf86cd799439011');
    const res  = buildRes(204);
    const next = jest.fn();

    auditMiddleware(req, res, next);
    res.json({});

    await new Promise((r) => setTimeout(r, 10));

    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ acao: 'DELETE' })
    );
  });

  it('does NOT log failed mutations (4xx/5xx)', async () => {
    const req  = buildReq('POST', '/checklists', {});
    const res  = buildRes(400);
    const next = jest.fn();

    auditMiddleware(req, res, next);
    res.json({ erro: 'bad request' });

    await new Promise((r) => setTimeout(r, 10));

    expect(AuditLog.create).not.toHaveBeenCalled();
  });

  it('strips sensitive fields (senha, token) before logging', async () => {
    const req  = buildReq('POST', '/usuarios', { email: 'a@b.com', senha: 'secret', nome: 'Ana' });
    const res  = buildRes(201);
    const next = jest.fn();

    auditMiddleware(req, res, next);
    res.json({ _id: '1' });

    await new Promise((r) => setTimeout(r, 10));

    const callArgs = AuditLog.create.mock.calls[0][0];
    expect(callArgs.dados).not.toHaveProperty('senha');
    expect(callArgs.dados).toHaveProperty('email', 'a@b.com');
    expect(callArgs.dados).toHaveProperty('nome', 'Ana');
  });

  it('extracts usuarioId from X-User-Id header', async () => {
    const req  = buildReq('POST', '/checklists', {}, { 'x-user-id': 'user-abc' });
    const res  = buildRes(201);
    const next = jest.fn();

    auditMiddleware(req, res, next);
    res.json({});

    await new Promise((r) => setTimeout(r, 10));

    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 'user-abc' })
    );
  });
});
