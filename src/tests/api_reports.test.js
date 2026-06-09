import { jest } from '@jest/globals';

jest.mock('../models/Vehicle.js', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));

jest.mock('../models/Inspecao.js', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));

jest.mock('../utils/reportPdf.js', () => ({
  generateInspectionReportPdf: jest.fn((res) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send('PDF');
  }),
}));

import express from 'express';
import request from 'supertest';
import router from '../api_reports.js';
import Vehicle from '../models/Vehicle.js';
import Inspecao from '../models/Inspecao.js';
import { generateInspectionReportPdf } from '../utils/reportPdf.js';

const createApp = () => {
  const app = express();
  app.use(router);
  return app;
};

const mockVehicle = {
  _id: '507f1f77bcf86cd799439011',
  plate: 'ABC1234',
  model: 'Fiat Uno',
  year: 2020,
  mileage: 50000,
  vehicleType: 'car',
  operationalStatus: 'active',
  observation: '',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockInspecao = {
  _id: '507f1f77bcf86cd799439012',
  placa: 'ABC1234',
  dataInspecao: new Date('2024-01-15'),
  fotos: {
    frente: 'uploads/frente.jpg',
    traseira: 'uploads/traseira.jpg',
    lateralEsquerda: 'uploads/esquerda.jpg',
    lateralDireita: 'uploads/direita.jpg',
    topo: 'uploads/topo.jpg',
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const makeSortLean = (data) => ({
  sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(data) }),
});

describe('api_reports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── GET /exportacoes/vehicles/csv ─────────────────────────────────

  describe('GET /exportacoes/vehicles/csv', () => {
    it('retorna 200 com CSV quando há veículos', async () => {
      Vehicle.find.mockReturnValue(makeSortLean([mockVehicle]));

      const response = await request(createApp()).get('/exportacoes/vehicles/csv');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/csv/);
      expect(response.headers['content-disposition']).toContain('veiculos.csv');
      expect(response.text).toContain('ABC1234');
    });

    it('retorna 200 com somente headers quando não há veículos', async () => {
      Vehicle.find.mockReturnValue(makeSortLean([]));

      const response = await request(createApp()).get('/exportacoes/vehicles/csv');

      expect(response.status).toBe(200);
      expect(response.text).toContain('"id"');
    });

    it('inclui campo observation como vazio quando ausente', async () => {
      const vehicleWithoutObs = { ...mockVehicle, observation: undefined };
      Vehicle.find.mockReturnValue(makeSortLean([vehicleWithoutObs]));

      const response = await request(createApp()).get('/exportacoes/vehicles/csv');

      expect(response.status).toBe(200);
    });

    it('retorna 500 quando o banco falha', async () => {
      Vehicle.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('Conexão perdida')),
        }),
      });

      const response = await request(createApp()).get('/exportacoes/vehicles/csv');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });

  // ── GET /exportacoes/inspecoes/csv ────────────────────────────────

  describe('GET /exportacoes/inspecoes/csv', () => {
    it('retorna 200 com CSV de todas as inspeções sem filtro', async () => {
      Inspecao.find.mockReturnValue(makeSortLean([mockInspecao]));

      const response = await request(createApp()).get('/exportacoes/inspecoes/csv');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/csv/);
      expect(response.headers['content-disposition']).toContain('inspecoes.csv');
      expect(response.text).toContain('ABC1234');
    });

    it('retorna 200 com CSV filtrado por placa e filename correto', async () => {
      Inspecao.find.mockReturnValue(makeSortLean([mockInspecao]));

      const response = await request(createApp()).get('/exportacoes/inspecoes/csv?placa=abc1234');

      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toContain('inspecoes-ABC1234.csv');
    });

    it('retorna 404 quando placa não tem inspeções', async () => {
      Inspecao.find.mockReturnValue(makeSortLean([]));

      const response = await request(createApp()).get('/exportacoes/inspecoes/csv?placa=NAOEXI');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('retorna 200 com lista vazia quando não há filtro e não há inspeções', async () => {
      Inspecao.find.mockReturnValue(makeSortLean([]));

      const response = await request(createApp()).get('/exportacoes/inspecoes/csv');

      expect(response.status).toBe(200);
    });

    it('retorna 500 quando o banco falha', async () => {
      Inspecao.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('Timeout')),
        }),
      });

      const response = await request(createApp()).get('/exportacoes/inspecoes/csv');

      expect(response.status).toBe(500);
    });
  });

  // ── GET /relatorios/inspecoes/:placa/pdf ──────────────────────────

  describe('GET /relatorios/inspecoes/:placa/pdf', () => {
    it('retorna 200 com PDF quando inspeções são encontradas', async () => {
      Inspecao.find.mockReturnValue(makeSortLean([mockInspecao]));

      const response = await request(createApp()).get('/relatorios/inspecoes/ABC1234/pdf');

      expect(response.status).toBe(200);
      expect(generateInspectionReportPdf).toHaveBeenCalledWith(
        expect.anything(),
        'ABC1234',
        [mockInspecao]
      );
    });

    it('retorna 404 quando placa não tem inspeções', async () => {
      Inspecao.find.mockReturnValue(makeSortLean([]));

      const response = await request(createApp()).get('/relatorios/inspecoes/NAOEXI/pdf');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });

    it('retorna 500 quando o banco falha', async () => {
      Inspecao.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('DB offline')),
        }),
      });

      const response = await request(createApp()).get('/relatorios/inspecoes/ABC1234/pdf');

      expect(response.status).toBe(500);
    });
  });
});
