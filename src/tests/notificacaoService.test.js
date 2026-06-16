import { jest } from '@jest/globals';

// Mock firebase-admin before importing the service
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  messaging: jest.fn(() => ({
    sendEachForMulticast: jest.fn().mockResolvedValue({
      responses: [{ success: true }],
    }),
  })),
}));

jest.mock('../models/Notificacao.js', () => ({
  __esModule: true,
  default: {
    create:    jest.fn(),
    updateOne: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../models/FcmToken.js', () => ({
  __esModule: true,
  default: {
    find:        jest.fn(),
    deleteMany:  jest.fn().mockResolvedValue({}),
  },
}));

import { enviarNotificacao, notificarFalhaCritica } from '../services/notificacaoService.js';
import Notificacao from '../models/Notificacao.js';
import FcmToken from '../models/FcmToken.js';

describe('notificacaoService', () => {
  const notificacaoMock = {
    _id: 'nid1',
    tipo: 'FALHA_CRITICA',
    mensagem: 'Falha',
    updateOne: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Notificacao.create.mockResolvedValue(notificacaoMock);
    FcmToken.find.mockResolvedValue([]);
  });

  describe('enviarNotificacao', () => {
    it('persists notification in DB regardless of push', async () => {
      const result = await enviarNotificacao({
        tipo: 'ALERTA',
        mensagem: 'Teste',
        usuarioId: 'uid1',
      });

      expect(Notificacao.create).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'ALERTA', mensagem: 'Teste' })
      );
      expect(result).toBe(notificacaoMock);
    });

    it('does not attempt FCM push when no tokens registered', async () => {
      FcmToken.find.mockResolvedValue([]);

      await enviarNotificacao({ tipo: 'INFO', mensagem: 'ok', usuarioId: 'uid1' });

      // No FCM call expected (no tokens)
      expect(Notificacao.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('notificarFalhaCritica', () => {
    it('creates FALHA_CRITICA notification with vehicle plate in message', async () => {
      await notificarFalhaCritica({
        checklistId: 'cid1',
        veiculoId:   'vid1',
        usuarioId:   'uid1',
        placa:       'ABC1234',
      });

      expect(Notificacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'FALHA_CRITICA',
          mensagem: expect.stringContaining('ABC1234'),
          checklistId: 'cid1',
          veiculoId:   'vid1',
        })
      );
    });

    it('returns the created notification', async () => {
      const result = await notificarFalhaCritica({
        checklistId: 'cid1',
        placa: 'XYZ9999',
      });

      expect(result).toBe(notificacaoMock);
    });
  });
});
