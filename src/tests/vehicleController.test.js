import { jest } from '@jest/globals';

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
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
  });

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

      await getAllVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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
      Vehicle.findById.mockResolvedValue(mockVehicle);

      await getVehicleById(req, res);

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
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await getVehicleById(req, res);

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
      Vehicle.findById.mockResolvedValue(null);

      await getVehicleById(req, res);

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

      await getVehicleById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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
      Vehicle.create.mockResolvedValue(mockVehicle);

      await createVehicle(req, res);

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

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
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

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
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

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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
      Vehicle.findByIdAndUpdate.mockResolvedValue(mockVehicle);

      await updateVehicle(req, res);

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
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await updateVehicle(req, res);

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
      Vehicle.findByIdAndUpdate.mockResolvedValue(null);

      await updateVehicle(req, res);

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

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
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

      await updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 for invalid ID', async () => {
      req.params = { id: 'invalidId' };
      mongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await deleteVehicle(req, res);

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
      Vehicle.findByIdAndDelete.mockResolvedValue(null);

      await deleteVehicle(req, res);

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

      await deleteVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });
});