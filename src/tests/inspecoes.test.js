import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

import router from '../api_inspecoes.js';
import Inspecao from '../models/Inspecao.js';

const inspecaoId = '507f1f77bcf86cd799439011';

const createApp = () => {
  const app = express();
  app.use(router);
  return app;
};

const mockInspecao = {
  _id: inspecaoId,
  placa: 'ABC1234',
  fotos: {
    frente: 'uploads/frente.jpg',
    traseira: 'uploads/traseira.jpg',
    lateralEsquerda: 'uploads/esquerda.jpg',
    lateralDireita: 'uploads/direita.jpg',
    topo: 'uploads/topo.jpg',
  },
  dataInspecao: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

// ── POST /inspecao/upload — validation only ────────────────────────

test('/inspecao/upload - post: rejeita placa ausente', async () => {
  mock.restoreAll();

  const response = await request(createApp())
    .post('/inspecao/upload')
    .send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'Placa obrigatória');
});

test('/inspecao/upload - post: rejeita placa vazia', async () => {
  mock.restoreAll();

  const response = await request(createApp())
    .post('/inspecao/upload')
    .field('placa', '   ');

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'Placa obrigatória');
});

test('/inspecao/upload - post: rejeita quando fotos não são enviadas', async () => {
  mock.restoreAll();

  // Send placa via JSON (non-multipart) — multer passes through, req.files stays undefined
  const response = await request(createApp())
    .post('/inspecao/upload')
    .send({ placa: 'ABC1234' });

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'Fotos obrigatórias');
});

// ── GET /inspecoes ────────────────────────────────────────────────

test('/inspecoes - get: lista todas as inspeções', async () => {
  mock.restoreAll();
  mock.method(Inspecao, 'find', () => ({ sort: async () => [mockInspecao] }));

  const response = await request(createApp()).get('/inspecoes');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].placa, 'ABC1234');
});

test('/inspecoes - get: retorna lista vazia quando não há inspeções', async () => {
  mock.restoreAll();
  mock.method(Inspecao, 'find', () => ({ sort: async () => [] }));

  const response = await request(createApp()).get('/inspecoes');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

// ── GET /inspecoes/historico/:placa ───────────────────────────────

test('/inspecoes/historico/:placa - get: retorna histórico por placa', async () => {
  mock.restoreAll();
  mock.method(Inspecao, 'find', () => ({ sort: async () => [mockInspecao] }));

  const response = await request(createApp()).get('/inspecoes/historico/ABC1234');

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.equal(response.body[0].placa, 'ABC1234');
});

test('/inspecoes/historico/:placa - get: retorna 404 quando placa não tem inspeções', async () => {
  mock.restoreAll();
  mock.method(Inspecao, 'find', () => ({ sort: async () => [] }));

  const response = await request(createApp()).get('/inspecoes/historico/XYZ9999');

  assert.equal(response.status, 404);
  assert.ok(response.body.mensagem.includes('XYZ9999'));
});

// ── DELETE /inspecoes/placa/:placa ────────────────────────────────

test('/inspecoes/placa/:placa - delete: remove inspeções por placa', async () => {
  mock.restoreAll();
  mock.method(Inspecao, 'deleteMany', async () => ({ deletedCount: 2 }));

  const response = await request(createApp()).delete('/inspecoes/placa/ABC1234');

  assert.equal(response.status, 200);
  assert.equal(response.body.totalDeletado, 2);
  assert.ok(response.body.mensagem.includes('2'));
});

test('/inspecoes/placa/:placa - delete: retorna 404 quando placa não tem inspeções', async () => {
  mock.restoreAll();
  mock.method(Inspecao, 'deleteMany', async () => ({ deletedCount: 0 }));

  const response = await request(createApp()).delete('/inspecoes/placa/XYZ9999');

  assert.equal(response.status, 404);
  assert.ok(response.body.mensagem.includes('XYZ9999'));
});

// ── DELETE /inspecoes/:id ─────────────────────────────────────────

test('/inspecoes/:id - delete: remove inspeção por ID', async () => {
  mock.restoreAll();
  mock.method(Inspecao, 'findByIdAndDelete', async () => mockInspecao);

  const response = await request(createApp()).delete('/inspecoes/' + inspecaoId);

  assert.equal(response.status, 200);
  assert.equal(response.body.mensagem, 'Inspeção deletada com sucesso');
  assert.ok(response.body.inspecao);
});

test('/inspecoes/:id - delete: retorna 400 para ID inválido', async () => {
  mock.restoreAll();

  const response = await request(createApp()).delete('/inspecoes/id-invalido');

  assert.equal(response.status, 400);
  assert.equal(response.body.erro, 'ID inválido');
});

test('/inspecoes/:id - delete: retorna 404 quando inspeção não existe', async () => {
  mock.restoreAll();
  mock.method(Inspecao, 'findByIdAndDelete', async () => null);

  const response = await request(createApp()).delete('/inspecoes/' + inspecaoId);

  assert.equal(response.status, 404);
  assert.equal(response.body.mensagem, 'Inspeção não encontrada');
});
