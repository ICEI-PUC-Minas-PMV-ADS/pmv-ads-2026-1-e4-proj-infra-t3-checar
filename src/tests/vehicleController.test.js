import { jest } from '@jest/globals';

jest.mock('mongoose', () => ({
  Types: { ObjectId: { isValid: jest.fn() } },
  connection: { readyState: 1 },
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
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn(),
      send:   jest.fn(),
    };
    jest.clearAllMocks();
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
  });

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

      await getAllVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getVehicleById ───────────────────────────────────────────────

  describe('getVehicleById', () => {
    it('returns vehicle by ID', async () => {
      const mockVehicle = { _id: 'validId', plate: 'ABC123' };
      req.params = { id: 'validId' };
      Vehicle.findById.mockResolvedValue(mockVehicle);

      await getVehicleById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: mockVehicle });
    });

    it('returns 400 for invalid ObjectId', async () => {
      req.params = { id: 'bad' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await getVehicleById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when vehicle not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      Vehicle.findById.mockResolvedValue(null);

      await getVehicleById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on database error', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      Vehicle.findById.mockRejectedValue(new Error('DB error'));

      await getVehicleById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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
      Vehicle.create.mockResolvedValue(mockVehicle);

      await createVehicle(req, res);

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

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('returns 400 on validation error', async () => {
      req.body = { ...baseBody };
      const err = new Error('Validation');
      err.name = 'ValidationError';
      err.errors = { plate: { message: 'Plate is required' } };
      Vehicle.create.mockRejectedValue(err);

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: ['Plate is required'] }));
    });

    it('returns 500 on generic error', async () => {
      req.body = { ...baseBody };
      Vehicle.create.mockRejectedValue(new Error('DB error'));

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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
      Vehicle.findByIdAndUpdate.mockResolvedValue(mockVehicle);

      await updateVehicle(req, res);

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
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when vehicle not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { model: 'Honda' };
      Vehicle.findByIdAndUpdate.mockResolvedValue(null);

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 409 on duplicate plate', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { plate: 'XYZ' };
      const err = new Error('Dup'); err.code = 11000;
      Vehicle.findByIdAndUpdate.mockRejectedValue(err);

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('returns 500 on generic error', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      req.body = { model: 'Honda' };
      Vehicle.findByIdAndUpdate.mockRejectedValue(new Error('DB'));

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── deleteVehicle ────────────────────────────────────────────────

  describe('deleteVehicle', () => {
    it('deletes vehicle and returns 204', async () => {
      req.params = { id: 'validId' };
      Vehicle.findByIdAndDelete.mockResolvedValue({ _id: 'validId' });

      await deleteVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('returns 400 for invalid ObjectId', async () => {
      req.params = { id: 'bad' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await deleteVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when not found', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      Vehicle.findByIdAndDelete.mockResolvedValue(null);

      await deleteVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on database error', async () => {
      req.params = { id: '507f1f77bcf86cd799439011' };
      Vehicle.findByIdAndDelete.mockRejectedValue(new Error('DB error'));

      await deleteVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
