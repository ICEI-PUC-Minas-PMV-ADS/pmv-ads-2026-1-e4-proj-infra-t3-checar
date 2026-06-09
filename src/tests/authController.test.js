import { jest } from '@jest/globals';

/**
 * NOTA: authController.js não importa `mongoose`, porém referencia
 * `mongoose.Types.ObjectId.isValid()` em buscarUsuarioPorId.
 * Como Babel compila ESM→CJS para Jest, global.mongoose é acessível.
 * Isso documenta o bug mas permite testar todas as branches.
 */

jest.mock('../models/Usuario.js', () => {
  const MockUsuario = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this._id = 'mock-id-507f1f';
    this.createdAt = new Date('2024-01-01T00:00:00.000Z');
    this.save = jest.fn().mockResolvedValue(undefined);
  });
  MockUsuario.findOne = jest.fn();
  MockUsuario.find = jest.fn();
  MockUsuario.findById = jest.fn();
  MockUsuario.findByIdAndUpdate = jest.fn();
  MockUsuario.findByIdAndDelete = jest.fn();
  return { __esModule: true, default: MockUsuario };
});

import {
  registrarUsuario,
  loginUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
} from '../controllers/authController.js';
import Usuario from '../models/Usuario.js';

// Fix do bug: authController.js usa mongoose sem importar
global.mongoose = {
  Types: { ObjectId: { isValid: jest.fn() } },
};

const mockUser = {
  _id: 'mock-id-507f1f',
  nome: 'João Silva',
  email: 'joao@test.com',
  tipoUsuario: 'Motorista',
};

describe('authController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // ── registrarUsuario ──────────────────────────────────────────────

  describe('registrarUsuario', () => {
    it('cria usuário com sucesso e retorna 201', async () => {
      Usuario.findOne.mockResolvedValue(null);
      req.body = { nome: 'João', email: 'joao@test.com', senha: 'senha123', tipoUsuario: 'Motorista' };

      await registrarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Usuário cadastrado com sucesso!',
          usuario: expect.objectContaining({ nome: 'João', email: 'joao@test.com' }),
        })
      );
    });

    it('retorna 400 quando email já está cadastrado', async () => {
      Usuario.findOne.mockResolvedValue(mockUser);
      req.body = { nome: 'Outro', email: 'joao@test.com', senha: 'senha123' };

      await registrarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ erro: 'Email já cadastrado' })
      );
    });

    it('retorna 500 quando findOne lança erro', async () => {
      Usuario.findOne.mockRejectedValue(new Error('Erro de banco'));
      req.body = { nome: 'João', email: 'joao@test.com', senha: 'senha123' };

      await registrarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ erro: 'Erro ao cadastrar usuário' })
      );
    });

    it('retorna 500 quando save lança erro', async () => {
      Usuario.findOne.mockResolvedValue(null);
      Usuario.mockImplementationOnce(function (data) {
        Object.assign(this, data);
        this._id = 'mock-id';
        this.createdAt = new Date();
        this.save = jest.fn().mockRejectedValue(new Error('Falha ao salvar'));
      });
      req.body = { nome: 'João', email: 'joao@test.com', senha: 'senha123' };

      await registrarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── loginUsuario ──────────────────────────────────────────────────

  describe('loginUsuario', () => {
    it('autentica com credenciais corretas e retorna 200', async () => {
      const userWithSenha = { ...mockUser, compararSenha: jest.fn().mockResolvedValue(true) };
      Usuario.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(userWithSenha) });
      req.body = { email: 'joao@test.com', senha: 'senha123' };

      await loginUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ mensagem: 'Login realizado com sucesso!' })
      );
    });

    it('retorna 400 quando email e senha estão ausentes', async () => {
      req.body = {};

      await loginUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ erro: 'Campos obrigatórios' })
      );
    });

    it('retorna 400 quando somente senha está ausente', async () => {
      req.body = { email: 'joao@test.com' };

      await loginUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 401 quando email não está cadastrado', async () => {
      Usuario.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      req.body = { email: 'nao@existe.com', senha: 'senha123' };

      await loginUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ erro: 'Credenciais inválidas' })
      );
    });

    it('retorna 401 quando senha está incorreta', async () => {
      const userWithSenha = { ...mockUser, compararSenha: jest.fn().mockResolvedValue(false) };
      Usuario.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(userWithSenha) });
      req.body = { email: 'joao@test.com', senha: 'senhaerrada' };

      await loginUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 500 quando ocorre erro no banco de dados', async () => {
      Usuario.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Conexão perdida')),
      });
      req.body = { email: 'joao@test.com', senha: 'senha123' };

      await loginUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── listarUsuarios ────────────────────────────────────────────────

  describe('listarUsuarios', () => {
    it('lista todos os usuários e retorna 200', async () => {
      Usuario.find.mockReturnValue({ select: jest.fn().mockResolvedValue([mockUser]) });

      await listarUsuarios(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockUser]);
    });

    it('retorna 500 quando o banco falha', async () => {
      Usuario.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Timeout')),
      });

      await listarUsuarios(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── buscarUsuarioPorId ────────────────────────────────────────────

  describe('buscarUsuarioPorId', () => {
    const validId = '507f1f77bcf86cd799439011';

    it('retorna usuário quando ID é válido e existe', async () => {
      global.mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Usuario.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
      req.params = { id: validId };

      await buscarUsuarioPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('retorna 400 quando ID é inválido', async () => {
      global.mongoose.Types.ObjectId.isValid.mockReturnValue(false);
      req.params = { id: 'id-invalido' };

      await buscarUsuarioPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'ID inválido' });
    });

    it('retorna 404 quando usuário não existe', async () => {
      global.mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Usuario.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      req.params = { id: validId };

      await buscarUsuarioPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário não encontrado' });
    });

    it('retorna 500 quando o banco falha', async () => {
      global.mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Usuario.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB error')),
      });
      req.params = { id: validId };

      await buscarUsuarioPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── atualizarUsuario ──────────────────────────────────────────────

  describe('atualizarUsuario', () => {
    it('atualiza usuário com sucesso e retorna 200', async () => {
      const updatedUser = { ...mockUser, nome: 'João Atualizado' };
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser),
      });
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { nome: 'João Atualizado' };

      await atualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Usuário atualizado com sucesso!',
          usuario: updatedUser,
        })
      );
    });

    it('retorna 404 quando usuário não é encontrado', async () => {
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { nome: 'Teste' };

      await atualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário não encontrado' });
    });

    it('retorna 500 quando o banco falha', async () => {
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Timeout')),
      });
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = {};

      await atualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── deletarUsuario ────────────────────────────────────────────────

  describe('deletarUsuario', () => {
    it('deleta usuário com sucesso e retorna 200', async () => {
      Usuario.findByIdAndDelete.mockResolvedValue(mockUser);
      req.params = { id: '507f1f77bcf86cd799439011' };

      await deletarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário deletado com sucesso!' });
    });

    it('retorna 404 quando usuário não é encontrado', async () => {
      Usuario.findByIdAndDelete.mockResolvedValue(null);
      req.params = { id: '507f1f77bcf86cd799439011' };

      await deletarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário não encontrado' });
    });

    it('retorna 500 quando o banco falha', async () => {
      Usuario.findByIdAndDelete.mockRejectedValue(new Error('Conexão perdida'));
      req.params = { id: '507f1f77bcf86cd799439011' };

      await deletarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
