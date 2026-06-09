import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

import router from '../api_usuarios.js';
import Usuario from '../models/Usuario.js';

const userId = '507f1f77bcf86cd799439011';

const createApp = () => {
  const app = express();
  app.use(router);
  return app;
};

const mockUsuario = {
  _id: userId,
  nome: 'João Silva',
  email: 'joao@test.com',
  tipoUsuario: 'Motorista',
};

// ── POST /usuarios ────────────────────────────────────────────────

test('/usuarios - post: cria usuário com sucesso', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findOne', async () => null);
  mock.method(Usuario.prototype, 'save', async function () { return this; });

  const body = { nome: 'João Silva', email: 'joao@test.com', senha: 'senha123' };
  const response = await request(createApp()).post('/usuarios').send(body);

  assert.equal(response.status, 201);
  assert.equal(response.body.mensagem, 'Usuário criado com sucesso!');
  assert.equal(response.body.usuario.nome, 'João Silva');
  assert.equal(response.body.usuario.tipoUsuario, 'Motorista');
});

test('/usuarios - post: normaliza tipoUsuario para Gestor', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findOne', async () => null);
  mock.method(Usuario.prototype, 'save', async function () { return this; });

  const body = { nome: 'Maria', email: 'maria@test.com', senha: 'senha123', tipoUsuario: 'gestor' };
  const response = await request(createApp()).post('/usuarios').send(body);

  assert.equal(response.status, 201);
  assert.equal(response.body.usuario.tipoUsuario, 'Gestor');
});

test('/usuarios - post: rejeita quando campos obrigatórios estão ausentes', async () => {
  mock.restoreAll();

  const response = await request(createApp()).post('/usuarios').send({ email: 'joao@test.com' });

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'Campos obrigatórios');
});

test('/usuarios - post: rejeita email já cadastrado', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findOne', async () => mockUsuario);

  const body = { nome: 'Outro', email: 'joao@test.com', senha: 'senha123' };
  const response = await request(createApp()).post('/usuarios').send(body);

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'Email já cadastrado');
});

// ── GET /usuarios ─────────────────────────────────────────────────

test('/usuarios - get: lista todos os usuários', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'find', () => ({ select: async () => [mockUsuario] }));

  const response = await request(createApp()).get('/usuarios');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0]._id, userId);
});

test('/usuarios - get: retorna lista vazia quando não há usuários', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'find', () => ({ select: async () => [] }));

  const response = await request(createApp()).get('/usuarios');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

// ── GET /usuarios/:id ─────────────────────────────────────────────

test('/usuarios/:id - get: retorna usuário por ID válido', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findById', () => ({ select: async () => mockUsuario }));

  const response = await request(createApp()).get('/usuarios/' + userId);

  assert.equal(response.status, 200);
  assert.equal(response.body._id, userId);
  assert.equal(response.body.nome, 'João Silva');
});

test('/usuarios/:id - get: retorna 400 para ID inválido', async () => {
  mock.restoreAll();

  const response = await request(createApp()).get('/usuarios/id-invalido');

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'ID inválido');
});

test('/usuarios/:id - get: retorna 404 quando usuário não existe', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findById', () => ({ select: async () => null }));

  const response = await request(createApp()).get('/usuarios/' + userId);

  assert.equal(response.status, 404);
  assert.equal(response.body.mensagem, 'Usuário não encontrado');
});

// ── PUT /usuarios/:id ─────────────────────────────────────────────

test('/usuarios/:id - put: atualiza nome com sucesso', async () => {
  mock.restoreAll();
  const usuarioComSave = { ...mockUsuario, save: async function () { return this; } };
  mock.method(Usuario, 'findById', () => ({ select: async () => usuarioComSave }));

  const body = { nome: 'João Atualizado' };
  const response = await request(createApp()).put('/usuarios/' + userId).send(body);

  assert.equal(response.status, 200);
  assert.equal(response.body.mensagem, 'Usuário atualizado com sucesso!');
});

test('/usuarios/:id - put: retorna 400 para ID inválido', async () => {
  mock.restoreAll();

  const response = await request(createApp()).put('/usuarios/id-invalido').send({ nome: 'Teste' });

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'ID inválido');
});

test('/usuarios/:id - put: retorna 404 quando usuário não existe', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findById', () => ({ select: async () => null }));

  const response = await request(createApp()).put('/usuarios/' + userId).send({ nome: 'Teste' });

  assert.equal(response.status, 404);
  assert.equal(response.body.mensagem, 'Usuário não encontrado');
});

test('/usuarios/:id - put: rejeita email duplicado ao atualizar', async () => {
  mock.restoreAll();
  const usuarioComSave = { ...mockUsuario, email: 'joao@test.com', save: async function () { return this; } };
  mock.method(Usuario, 'findById', () => ({ select: async () => usuarioComSave }));
  mock.method(Usuario, 'findOne', async () => ({ _id: 'outro-id', email: 'novo@test.com' }));

  const body = { email: 'novo@test.com' };
  const response = await request(createApp()).put('/usuarios/' + userId).send(body);

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'Email já cadastrado');
});

// ── DELETE /usuarios/:id ──────────────────────────────────────────

test('/usuarios/:id - delete: remove usuário com sucesso', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findByIdAndDelete', async () => mockUsuario);

  const response = await request(createApp()).delete('/usuarios/' + userId);

  assert.equal(response.status, 200);
  assert.equal(response.body.mensagem, 'Usuário deletado com sucesso!');
});

test('/usuarios/:id - delete: retorna 400 para ID inválido', async () => {
  mock.restoreAll();

  const response = await request(createApp()).delete('/usuarios/id-invalido');

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'ID inválido');
});

test('/usuarios/:id - delete: retorna 404 quando usuário não existe', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findByIdAndDelete', async () => null);

  const response = await request(createApp()).delete('/usuarios/' + userId);

  assert.equal(response.status, 404);
  assert.equal(response.body.mensagem, 'Usuário não encontrado');
});

// ── POST /login ───────────────────────────────────────────────────

test('/login - post: autentica com credenciais corretas', async () => {
  mock.restoreAll();
  const usuarioComSenha = {
    ...mockUsuario,
    senha: '$2b$10$hashed',
    compararSenha: async () => true,
  };
  mock.method(Usuario, 'findOne', () => ({ select: async () => usuarioComSenha }));

  const body = { email: 'joao@test.com', senha: 'senha123' };
  const response = await request(createApp()).post('/login').send(body);

  assert.equal(response.status, 200);
  assert.equal(response.body.mensagem, 'Login realizado com sucesso!');
  assert.ok(response.body.usuario);
  assert.equal(response.body.usuario.email, 'joao@test.com');
});

test('/login - post: rejeita senha incorreta', async () => {
  mock.restoreAll();
  const usuarioComSenha = {
    ...mockUsuario,
    senha: '$2b$10$hashed',
    compararSenha: async () => false,
  };
  mock.method(Usuario, 'findOne', () => ({ select: async () => usuarioComSenha }));

  const body = { email: 'joao@test.com', senha: 'senhaerrada' };
  const response = await request(createApp()).post('/login').send(body);

  assert.equal(response.status, 401);
  assert.equal(response.body.erro, 'Credenciais inválidas');
});

test('/login - post: rejeita email não cadastrado', async () => {
  mock.restoreAll();
  mock.method(Usuario, 'findOne', () => ({ select: async () => null }));

  const body = { email: 'naoexiste@test.com', senha: 'senha123' };
  const response = await request(createApp()).post('/login').send(body);

  assert.equal(response.status, 401);
  assert.equal(response.body.erro, 'Credenciais inválidas');
});

test('/login - post: rejeita quando campos obrigatórios estão ausentes', async () => {
  mock.restoreAll();

  const response = await request(createApp()).post('/login').send({ email: 'joao@test.com' });

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'Campos obrigatórios');
});
