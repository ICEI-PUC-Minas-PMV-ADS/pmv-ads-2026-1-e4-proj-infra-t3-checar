import { jest } from '@jest/globals';

// Mock mongoose so no real DB connection is needed
jest.mock('mongoose', () => {
  const schema = {
    _indexes: [],
    index: jest.fn(function (fields, options) {
      this._indexes.push({ fields, options });
      return this;
    }),
    pre: jest.fn(),
    methods: {},
    statics: {},
  };

  const Schema = jest.fn(() => schema);
  Schema.Types = { Mixed: 'Mixed', ObjectId: 'ObjectId' };

  return {
    __esModule: true,
    default: {
      Schema,
      model: jest.fn(() => ({})),
      models: {},
    },
  };
});

import mongoose from 'mongoose';

describe('AuditLog schema', () => {
  let capturedSchema;
  let capturedIndexes;

  beforeAll(async () => {
    // Capture the schema instance created when the module loads
    const schemaInstance = {
      _indexes: [],
      index: jest.fn(function (fields, options) {
        this._indexes.push({ fields, options });
        return this;
      }),
      pre: jest.fn(),
      methods: {},
      statics: {},
    };

    mongoose.Schema.mockReturnValue(schemaInstance);

    // Import the model — this executes the module code
    await import('../models/AuditLog.js');

    capturedSchema = schemaInstance;
    capturedIndexes = schemaInstance._indexes;
  });

  it('o schema AuditLog é construído com timestamps habilitado', () => {
    // Schema constructor should have been called with timestamps: true
    expect(mongoose.Schema).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ timestamps: true })
    );
  });

  it('o schema define os campos obrigatórios: acao e entidade', () => {
    const schemaFields = mongoose.Schema.mock.calls[0][0];
    expect(schemaFields).toHaveProperty('acao');
    expect(schemaFields.acao.required).toBe(true);
    expect(schemaFields).toHaveProperty('entidade');
    expect(schemaFields.entidade.required).toBe(true);
  });

  it('o schema define o campo usuarioId', () => {
    const schemaFields = mongoose.Schema.mock.calls[0][0];
    expect(schemaFields).toHaveProperty('usuarioId');
  });

  it('o schema define o campo dados como Mixed', () => {
    const schemaFields = mongoose.Schema.mock.calls[0][0];
    expect(schemaFields).toHaveProperty('dados');
  });

  it('o schema define o campo acao com enum CREATE, UPDATE, DELETE', () => {
    const schemaFields = mongoose.Schema.mock.calls[0][0];
    expect(schemaFields.acao.enum).toEqual(['CREATE', 'UPDATE', 'DELETE']);
  });

  it('tem índice TTL configurado em createdAt (expireAfterSeconds = 1 ano)', () => {
    const ttlIndex = capturedIndexes.find(
      (idx) => idx.options && typeof idx.options.expireAfterSeconds === 'number'
    );

    expect(ttlIndex).toBeDefined();
    // 1 year in seconds
    expect(ttlIndex.options.expireAfterSeconds).toBe(365 * 24 * 60 * 60);
    // Must be on createdAt field
    expect(ttlIndex.fields).toHaveProperty('createdAt');
  });

  it('tem índice composto por entidade + createdAt', () => {
    const idx = capturedIndexes.find(
      (entry) => entry.fields.entidade !== undefined && entry.fields.createdAt !== undefined
    );
    expect(idx).toBeDefined();
  });

  it('tem índice composto por usuarioId + createdAt', () => {
    const idx = capturedIndexes.find(
      (entry) => entry.fields.usuarioId !== undefined && entry.fields.createdAt !== undefined
    );
    expect(idx).toBeDefined();
  });

  it('registra exatamente 3 índices no schema', () => {
    expect(capturedIndexes).toHaveLength(3);
  });
});
