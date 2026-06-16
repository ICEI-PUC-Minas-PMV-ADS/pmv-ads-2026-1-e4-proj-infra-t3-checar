import { jest } from '@jest/globals';

// ── Mocks (must come before any imports that use these modules) ──────────────

jest.mock('../models/Usuario.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../models/Notificacao.js', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock('../models/FcmToken.js', () => ({
  __esModule: true,
  default: {
    deleteMany: jest.fn(),
  },
}));

// checklist.js is the Mongoose model used in LGPD /meus-dados
jest.mock('../checklist.js', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

// Inspecao is used in /meus-dados
jest.mock('../models/Inspecao.js', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

// ── Imports ──────────────────────────────────────────────────────────────────

import express from 'express';
import request from 'supertest';
import router from '../api_lgpd.js';
import Usuario from '../models/Usuario.js';
import Notificacao from '../models/Notificacao.js';
import FcmToken from '../models/FcmToken.js';
import Checklist from '../checklist.js';
import Inspecao from '../models/Inspecao.js';

// ── App factory ──────────────────────────────────────────────────────────────

/**
 * Creates an Express app that injects req.user before the LGPD router,
 * simulating a successfully authenticated user.
 */
const buildAppWithUser = (userId = 'test-user-id') => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = { id: userId };
    next();
  });
  app.use(router);
  return app;
};

/**
 * Creates an Express app without injecting req.user,
 * simulating an unauthenticated request.
 */
const buildAppWithoutUser = () => {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
};

// ── Mock data ────────────────────────────────────────────────────────────────

const mockUsuario = {
  _id: 'test-user-id',
  nome: 'João Silva',
  email: 'joao@example.com',
  tipoUsuario: 'Motorista',
  aceitouTermos: true,
  dataAceiteTermos: new Date('2025-01-01').toISOString(),
  versaoTermos: '1.0',
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('api_lgpd', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── GET /meus-dados ──────────────────────────────────────────────────────

  describe('GET /meus-dados', () => {
    it('retorna 401 quando não há usuário autenticado', async () => {
      const res = await request(buildAppWithoutUser()).get('/meus-dados');

      expect(res.status).toBe(401);
      expect(res.body.erro).toBe('Não autenticado');
    });

    it('retorna 200 com dados do usuário, checklists, notificações e totalInspecoes', async () => {
      const mockChecklists = [{ _id: 'ck1', conformidade: true }];
      const mockNotificacoes = [{ _id: 'n1', mensagem: 'alerta' }];
      const mockInspecoes = [{ _id: 'i1', placa: 'ABC1234' }, { _id: 'i2', placa: 'XYZ9999' }];

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUsuario),
        }),
      });
      Checklist.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockChecklists) });
      Inspecao.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockInspecoes) });
      Notificacao.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockNotificacoes) });

      const res = await request(buildAppWithUser()).get('/meus-dados');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario.email).toBe('joao@example.com');
      expect(res.body).toHaveProperty('checklists');
      expect(res.body.checklists).toHaveLength(1);
      expect(res.body).toHaveProperty('notificacoes');
      expect(res.body.notificacoes).toHaveLength(1);
      expect(res.body).toHaveProperty('totalInspecoes', 2);
      expect(res.body).toHaveProperty('exportadoEm');
    });

    it('retorna 404 quando usuário não é encontrado no banco', async () => {
      Usuario.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });
      Checklist.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      Inspecao.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      Notificacao.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      const res = await request(buildAppWithUser()).get('/meus-dados');

      expect(res.status).toBe(404);
      expect(res.body.erro).toBe('Usuário não encontrado');
    });

    it('retorna 500 quando o banco falha', async () => {
      Usuario.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('Timeout de conexão')),
        }),
      });
      Checklist.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      Inspecao.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      Notificacao.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      const res = await request(buildAppWithUser()).get('/meus-dados');

      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro ao exportar dados');
    });
  });

  // ── DELETE /me ───────────────────────────────────────────────────────────

  describe('DELETE /me', () => {
    it('retorna 401 quando não há usuário autenticado', async () => {
      const res = await request(buildAppWithoutUser()).delete('/me');

      expect(res.status).toBe(401);
      expect(res.body.erro).toBe('Não autenticado');
    });

    it('retorna 200 e anonimiza os dados pessoais do usuário', async () => {
      Usuario.findByIdAndUpdate.mockResolvedValue({});
      FcmToken.deleteMany.mockResolvedValue({ deletedCount: 1 });
      Notificacao.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const res = await request(buildAppWithUser('test-user-id')).delete('/me');

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Dados pessoais removidos conforme LGPD');
    });

    it('confirma que nome e email são anonimizados com timestamp', async () => {
      Usuario.findByIdAndUpdate.mockResolvedValue({});
      FcmToken.deleteMany.mockResolvedValue({});
      Notificacao.deleteMany.mockResolvedValue({});

      await request(buildAppWithUser('test-user-id')).delete('/me');

      expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          nome: expect.stringMatching(/^\[removido-\d+\]$/),
          email: expect.stringMatching(/^removido-\d+@anonimizado\.local$/),
          aceitouTermos: false,
          dataAceiteTermos: null,
        })
      );
    });

    it('remove tokens FCM e notificações do usuário', async () => {
      Usuario.findByIdAndUpdate.mockResolvedValue({});
      FcmToken.deleteMany.mockResolvedValue({ deletedCount: 2 });
      Notificacao.deleteMany.mockResolvedValue({ deletedCount: 5 });

      await request(buildAppWithUser('test-user-id')).delete('/me');

      expect(FcmToken.deleteMany).toHaveBeenCalledWith({ usuarioId: 'test-user-id' });
      expect(Notificacao.deleteMany).toHaveBeenCalledWith({ usuarioId: 'test-user-id' });
    });

    it('retorna 500 quando o banco falha', async () => {
      Usuario.findByIdAndUpdate.mockRejectedValue(new Error('Falha no banco'));

      const res = await request(buildAppWithUser()).delete('/me');

      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro ao remover dados');
    });
  });

  // ── POST /aceitar-termos ─────────────────────────────────────────────────

  describe('POST /aceitar-termos', () => {
    it('retorna 401 quando não há usuário autenticado', async () => {
      const res = await request(buildAppWithoutUser())
        .post('/aceitar-termos')
        .send({ versaoTermos: '1.0' });

      expect(res.status).toBe(401);
      expect(res.body.erro).toBe('Não autenticado');
    });

    it('retorna 200 e registra consentimento com a versão fornecida', async () => {
      Usuario.findByIdAndUpdate.mockResolvedValue({});

      const res = await request(buildAppWithUser('test-user-id'))
        .post('/aceitar-termos')
        .send({ versaoTermos: '2.0' });

      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe('Consentimento registrado');
    });

    it('atualiza aceitouTermos, dataAceiteTermos e versaoTermos no usuário', async () => {
      Usuario.findByIdAndUpdate.mockResolvedValue({});

      await request(buildAppWithUser('test-user-id'))
        .post('/aceitar-termos')
        .send({ versaoTermos: '2.0' });

      expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          aceitouTermos: true,
          dataAceiteTermos: expect.any(Date),
          versaoTermos: '2.0',
        })
      );
    });

    it('usa versao 1.0 como padrão quando versaoTermos não é enviado', async () => {
      Usuario.findByIdAndUpdate.mockResolvedValue({});

      await request(buildAppWithUser('test-user-id'))
        .post('/aceitar-termos')
        .send({});

      expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          versaoTermos: '1.0',
        })
      );
    });

    it('retorna 500 quando o banco falha', async () => {
      Usuario.findByIdAndUpdate.mockRejectedValue(new Error('Falha no banco'));

      const res = await request(buildAppWithUser())
        .post('/aceitar-termos')
        .send({ versaoTermos: '1.0' });

      expect(res.status).toBe(500);
      expect(res.body.erro).toBe('Erro ao registrar consentimento');
    });
  });
});
