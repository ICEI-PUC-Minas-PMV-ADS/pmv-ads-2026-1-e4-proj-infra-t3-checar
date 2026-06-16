import { jest } from '@jest/globals';

// Inline factories avoid the jest.mock hoisting / TDZ problem
jest.mock('../models/Notificacao.js', () => ({
  __esModule: true,
  default: {
    find:              jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany:        jest.fn(),
    countDocuments:    jest.fn(),
    create:            jest.fn(),
  },
}));

jest.mock('../models/FcmToken.js', () => ({
  __esModule: true,
  default: {
    findOneAndUpdate: jest.fn(),
    deleteOne:        jest.fn(),
  },
}));

import express from 'express';
import request from 'supertest';
import router from '../api_notificacoes.js';
import Notificacao from '../models/Notificacao.js';
import FcmToken from '../models/FcmToken.js';

// Simulates authMiddleware: sets req.user so routes don't return 401
const fakeAuth = (req, _res, next) => {
  req.user = { id: 'uid1', uid: 'fb-uid1' };
  next();
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use(fakeAuth);
  app.use(router);
  return app;
};

describe('api_notificacoes', () => {
  let app;

  beforeAll(() => { app = buildApp(); });
  beforeEach(() => jest.clearAllMocks());

  // ── FCM Tokens ──────────────────────────────────────────────────

  describe('POST /fcm-tokens', () => {
    it('returns 400 when token missing', async () => {
      const res = await request(app).post('/fcm-tokens').send({});
      expect(res.status).toBe(400);
    });

    it('registers token using req.user.id and returns 200', async () => {
      FcmToken.findOneAndUpdate.mockResolvedValue({});
      const res = await request(app).post('/fcm-tokens').send({ token: 'tok1', plataforma: 'android' });
      expect(res.status).toBe(200);
      expect(FcmToken.findOneAndUpdate).toHaveBeenCalledWith(
        { token: 'tok1' },
        { usuarioId: 'uid1', token: 'tok1', plataforma: 'android' },
        { upsert: true, new: true }
      );
    });

    it('returns 500 on DB error', async () => {
      FcmToken.findOneAndUpdate.mockRejectedValue(new Error('DB'));
      const res = await request(app).post('/fcm-tokens').send({ token: 'tok1' });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /fcm-tokens/:token', () => {
    it('removes token and returns 200', async () => {
      FcmToken.deleteOne.mockResolvedValue({});
      const res = await request(app).delete('/fcm-tokens/mytoken123');
      expect(res.status).toBe(200);
      expect(FcmToken.deleteOne).toHaveBeenCalledWith({ token: 'mytoken123' });
    });
  });

  // ── Notificações ────────────────────────────────────────────────

  describe('GET /notificacoes', () => {
    const makeChain = (data) => {
      const chain = {
        sort:  jest.fn(),
        skip:  jest.fn(),
        limit: jest.fn(),
        lean:  jest.fn().mockResolvedValue(data),
      };
      chain.sort.mockReturnValue(chain);
      chain.skip.mockReturnValue(chain);
      chain.limit.mockReturnValue(chain);
      return chain;
    };

    it('returns paginated list filtered by authenticated user', async () => {
      const data = [{ _id: 'n1', mensagem: 'falha' }];
      Notificacao.find.mockReturnValue(makeChain(data));
      Notificacao.countDocuments.mockResolvedValue(1);

      const res = await request(app).get('/notificacoes?lida=false');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('totalPages');
      // Verifica que o filtro usa req.user.id, não query param
      expect(Notificacao.find).toHaveBeenCalledWith(
        expect.objectContaining({ usuarioId: 'uid1' })
      );
    });

    it('returns 500 on DB error', async () => {
      Notificacao.find.mockImplementation(() => { throw new Error('DB'); });
      const res = await request(app).get('/notificacoes');
      expect(res.status).toBe(500);
    });
  });

  describe('PATCH /notificacoes/:id/lida', () => {
    it('marks notification as read', async () => {
      Notificacao.findByIdAndUpdate.mockResolvedValue({ _id: 'n1', lida: true });
      const res = await request(app).patch('/notificacoes/n1/lida');
      expect(res.status).toBe(200);
      expect(Notificacao.findByIdAndUpdate).toHaveBeenCalledWith('n1', { lida: true }, { new: true });
    });

    it('returns 404 when not found', async () => {
      Notificacao.findByIdAndUpdate.mockResolvedValue(null);
      const res = await request(app).patch('/notificacoes/missing/lida');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /notificacoes/lida/todas', () => {
    it('marks all as read for authenticated user without body usuarioId', async () => {
      Notificacao.updateMany.mockResolvedValue({ modifiedCount: 3 });
      const res = await request(app).patch('/notificacoes/lida/todas').send({});
      expect(res.status).toBe(200);
      // Confirma que usuarioId vem de req.user.id, nunca do body
      expect(Notificacao.updateMany).toHaveBeenCalledWith(
        { usuarioId: 'uid1', lida: false },
        { lida: true }
      );
    });

    it('returns 500 on DB error', async () => {
      Notificacao.updateMany.mockRejectedValue(new Error('DB'));
      const res = await request(app).patch('/notificacoes/lida/todas').send({});
      expect(res.status).toBe(500);
    });
  });
});
