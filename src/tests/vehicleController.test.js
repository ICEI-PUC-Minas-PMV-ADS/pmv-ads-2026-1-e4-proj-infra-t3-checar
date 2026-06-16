import { jest } from '@jest/globals';

<<<<<<< HEAD
// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

// Mock the Vehicle model
jest.mock('../models/Vehicle.js', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
=======
jest.mock('mongoose', () => ({
  Types: { ObjectId: { isValid: jest.fn() } },
}));

const makeFindChain = (result) => {
  const chain = {
    sort:  jest.fn(),
    skip:  jest.fn(),
    limit: jest.fn().mockResolvedValue(result),
  };
  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  return chain;
};

jest.mock('../models/Vehicle.js', () => ({
  __esModule: true,
  default: {
    find:              jest.fn(),
    countDocuments:    jest.fn(),
    findById:          jest.fn(),
    create:            jest.fn(),
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import Vehicle from '../models/Vehicle.js';
import mongoose from 'mongoose';

describe('Vehicle Controller', () => {
  let req, res;

  beforeEach(() => {
<<<<<<< HEAD
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
=======
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn(),
      send:   jest.fn(),
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
    };
    jest.clearAllMocks();
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
  });

<<<<<<< HEAD
  describe('getAllVehicles', () => {
    it('should return all vehicles successfully', async () => {
      const mockVehicles = [{ plate: 'ABC123' }, { plate: 'DEF456' }];
      Vehicle.find.mockResolvedValue(mockVehicles);

      await getAllVehicles(req, res);

      expect(Vehicle.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        count: 2,
        data: mockVehicles,
      });
    });

    it('should handle errors', async () => {
      Vehicle.find.mockRejectedValue(new Error('Database error'));
=======
  // ── getAllVehicles ────────────────────────────────────────────────

  describe('getAllVehicles', () => {
    it('returns paginated vehicles with metadata', async () => {
      const mockVehicles = [{ plate: 'ABC123' }, { plate: 'DEF456' }];
      Vehicle.find.mockReturnValue(makeFindChain(mockVehicles));
      Vehicle.countDocuments.mockResolvedValue(2);

      await getAllVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          count: 2,
          total: 2,
          page: 1,
          totalPages: 1,
          data: mockVehicles,
        })
      );
    });

    it('respects page and limit query params', async () => {
      req.query = { page: '2', limit: '5' };
      Vehicle.find.mockReturnValue(makeFindChain([]));
      Vehicle.countDocuments.mockResolvedValue(10);

      await getAllVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, totalPages: 2 })
      );
    });

    it('returns 500 on database error', async () => {
      Vehicle.find.mockImplementation(() => { throw new Error('DB error'); });
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

      await getAllVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
<<<<<<< HEAD
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('getVehicleById', () => {
    it('should return a vehicle by ID', async () => {
      const mockVehicle = { _id: 'validId', plate: 'ABC123' };
      req.params = { id: 'validId' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
=======
    });
  });

  // ── getVehicleById ───────────────────────────────────────────────

  describe('getVehicleById', () => {
    it('returns vehicle by ID', async () => {
      const mockVehicle = { _id: 'validId', plate: 'ABC123' };
      req.params = { id: 'validId' };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      Vehicle.findById.mockResolvedValue(mockVehicle);

      await getVehicleById(req, res);

<<<<<<< HEAD
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validId');
      expect(Vehicle.findById).toHaveBeenCalledWith('validId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockVehicle,
      });
    });

    it('should return 400 for invalid ID', async () => {
      req.params = { id: 'invalidId' };
=======
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: mockVehicle });
    });

    it('returns 400 for invalid ObjectId', async () => {
      req.params = { id: 'bad' };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await getVehicleById(req, res);

<<<<<<< HEAD
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalidId');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid vehicle ID',
      });
    });

    it('should return 404 if vehicle not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
=======
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when vehicle not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      Vehicle.findById.mockResolvedValue(null);

      await getVehicleById(req, res);

<<<<<<< HEAD
      expect(Vehicle.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Vehicle not found',
      });
    });

    it('should handle errors', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Vehicle.findById.mockRejectedValue(new Error('Database error'));
=======
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on database error', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      Vehicle.findById.mockRejectedValue(new Error('DB error'));
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

      await getVehicleById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
<<<<<<< HEAD
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('createVehicle', () => {
    it('should create a vehicle successfully', async () => {
      const mockVehicle = { plate: 'ABC123', model: 'Toyota' };
      req.body = {
        plate: 'ABC123',
        model: 'Toyota',
        year: 2020,
        mileage: 10000,
        vehicleType: 'car',
        operationalStatus: 'active',
      };
=======
    });
  });

  // ── createVehicle ────────────────────────────────────────────────

  describe('createVehicle', () => {
    const baseBody = {
      plate: 'ABC123', model: 'Toyota', year: 2020,
      mileage: 10000, vehicleType: 'car', operationalStatus: 'active',
    };

    it('creates vehicle with all required fields', async () => {
      const mockVehicle = { ...baseBody };
      req.body = { ...baseBody };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      Vehicle.create.mockResolvedValue(mockVehicle);

      await createVehicle(req, res);

<<<<<<< HEAD
      expect(Vehicle.create).toHaveBeenCalledWith({
        plate: 'ABC123',
        model: 'Toyota',
        year: 2020,
        mileage: 10000,
        vehicleType: 'car',
        operationalStatus: 'active',
        observation: null,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockVehicle,
      });
    });

    it('should handle duplicate plate error', async () => {
      req.body = {
        plate: 'ABC123',
        model: 'Toyota',
        year: 2020,
        mileage: 10000,
        vehicleType: 'car',
        operationalStatus: 'active',
      };
      const error = new Error('Duplicate key');
      error.code = 11000;
      Vehicle.create.mockRejectedValue(error);
=======
      expect(Vehicle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          plate: 'ABC123',
          model: 'Toyota',
          year: 2020,
          observation: null,
          marca: null,
          cor: null,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('persists marca and cor when provided', async () => {
      req.body = { ...baseBody, marca: 'Toyota', cor: 'Branco' };
      Vehicle.create.mockResolvedValue({ ...req.body });

      await createVehicle(req, res);

      expect(Vehicle.create).toHaveBeenCalledWith(
        expect.objectContaining({ marca: 'Toyota', cor: 'Branco' })
      );
    });

    it('returns 409 on duplicate plate', async () => {
      req.body = { ...baseBody };
      const err = new Error('Duplicate'); err.code = 11000;
      Vehicle.create.mockRejectedValue(err);
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
<<<<<<< HEAD
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'A vehicle with this plate already exists',
      });
    });

    it('should handle validation errors', async () => {
      req.body = {
        plate: '',
        model: 'Toyota',
        year: 2020,
        mileage: 10000,
        vehicleType: 'car',
        operationalStatus: 'active',
      };
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = { plate: { message: 'Plate is required' } };
      Vehicle.create.mockRejectedValue(error);
=======
    });

    it('returns 400 on validation error', async () => {
      req.body = { ...baseBody };
      const err = new Error('Validation');
      err.name = 'ValidationError';
      err.errors = { plate: { message: 'Plate is required' } };
      Vehicle.create.mockRejectedValue(err);
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
<<<<<<< HEAD
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        errors: ['Plate is required'],
      });
    });

    it('should handle other errors', async () => {
      req.body = {
        plate: 'ABC123',
        model: 'Toyota',
        year: 2020,
        mileage: 10000,
        vehicleType: 'car',
        operationalStatus: 'active',
      };
      Vehicle.create.mockRejectedValue(new Error('Database error'));
=======
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: ['Plate is required'] }));
    });

    it('returns 500 on generic error', async () => {
      req.body = { ...baseBody };
      Vehicle.create.mockRejectedValue(new Error('DB error'));
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
<<<<<<< HEAD
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('updateVehicle', () => {
    it('should update a vehicle successfully', async () => {
      const mockVehicle = { _id: 'validId', plate: 'ABC123', model: 'Honda' };
      req.params = { id: 'validId' };
      req.body = {
        plate: 'ABC123',
        model: 'Honda',
        year: 2021,
        mileage: 15000,
        vehicleType: 'car',
        operationalStatus: 'active',
      };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
=======
    });
  });

  // ── updateVehicle ────────────────────────────────────────────────

  describe('updateVehicle', () => {
    it('updates vehicle and includes marca/cor', async () => {
      const mockVehicle = { _id: 'validId', plate: 'ABC123', marca: 'Fiat', cor: 'Prata' };
      req.params = { id: 'validId' };
      req.body = {
        plate: 'ABC123', model: 'Uno', year: 2021,
        mileage: 15000, vehicleType: 'car', operationalStatus: 'active',
        marca: 'Fiat', cor: 'Prata',
      };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      Vehicle.findByIdAndUpdate.mockResolvedValue(mockVehicle);

      await updateVehicle(req, res);

<<<<<<< HEAD
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validId');
      expect(Vehicle.findByIdAndUpdate).toHaveBeenCalledWith(
        'validId',
        {
          plate: 'ABC123',
          model: 'Honda',
          year: 2021,
          mileage: 15000,
          vehicleType: 'car',
          operationalStatus: 'active',
          observation: null,
        },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockVehicle,
      });
    });

    it('should return 400 for invalid ID', async () => {
      req.params = { id: 'invalidId' };
=======
      expect(Vehicle.findByIdAndUpdate).toHaveBeenCalledWith(
        'validId',
        expect.objectContaining({ marca: 'Fiat', cor: 'Prata' }),
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 400 for invalid ObjectId', async () => {
      req.params = { id: 'bad' };
      req.body = {};
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await updateVehicle(req, res);

<<<<<<< HEAD
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalidId');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid vehicle ID',
      });
    });

    it('should return 404 if vehicle not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { model: 'Honda' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
=======
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when vehicle not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { model: 'Honda' };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      Vehicle.findByIdAndUpdate.mockResolvedValue(null);

      await updateVehicle(req, res);

<<<<<<< HEAD
      expect(Vehicle.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { model: 'Honda', observation: null },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Vehicle not found',
      });
    });

    it('should handle duplicate plate error', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { plate: 'ABC123' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const error = new Error('Duplicate key');
      error.code = 11000;
      Vehicle.findByIdAndUpdate.mockRejectedValue(error);
=======
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 409 on duplicate plate', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { plate: 'XYZ' };
      const err = new Error('Dup'); err.code = 11000;
      Vehicle.findByIdAndUpdate.mockRejectedValue(err);
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
<<<<<<< HEAD
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'A vehicle with this plate already exists',
      });
    });

    it('should handle validation errors', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { year: 1800 };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = { year: { message: 'Year must be greater than or equal to 1886' } };
      Vehicle.findByIdAndUpdate.mockRejectedValue(error);

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        errors: ['Year must be greater than or equal to 1886'],
      });
    });

    it('should handle other errors', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { model: 'Honda' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Vehicle.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
=======
    });

    it('returns 500 on generic error', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { model: 'Honda' };
      Vehicle.findByIdAndUpdate.mockRejectedValue(new Error('DB'));
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
<<<<<<< HEAD
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('deleteVehicle', () => {
    it('should delete a vehicle successfully', async () => {
      const mockVehicle = { _id: 'validId', plate: 'ABC123' };
      req.params = { id: 'validId' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Vehicle.findByIdAndDelete.mockResolvedValue(mockVehicle);

      await deleteVehicle(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('validId');
      expect(Vehicle.findByIdAndDelete).toHaveBeenCalledWith('validId');
=======
    });
  });

  // ── deleteVehicle ────────────────────────────────────────────────

  describe('deleteVehicle', () => {
    it('deletes vehicle and returns 204', async () => {
      req.params = { id: 'validId' };
      Vehicle.findByIdAndDelete.mockResolvedValue({ _id: 'validId' });

      await deleteVehicle(req, res);

>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

<<<<<<< HEAD
    it('should return 400 for invalid ID', async () => {
      req.params = { id: 'invalidId' };
=======
    it('returns 400 for invalid ObjectId', async () => {
      req.params = { id: 'bad' };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await deleteVehicle(req, res);

<<<<<<< HEAD
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalidId');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid vehicle ID',
      });
    });

    it('should return 404 if vehicle not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
=======
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
      Vehicle.findByIdAndDelete.mockResolvedValue(null);

      await deleteVehicle(req, res);

<<<<<<< HEAD
      expect(Vehicle.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Vehicle not found',
      });
    });

    it('should handle errors', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(true);
      Vehicle.findByIdAndDelete.mockRejectedValue(new Error('Database error'));
=======
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on database error', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      Vehicle.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)

      await deleteVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
<<<<<<< HEAD
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });
});
=======
    });
  });
});
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
