import { jest } from '@jest/globals';
import { validateVehicleCreate } from '../middlewares/validateVehicle.js';

describe('validateVehicleCreate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('calls next() when all required fields are present and valid', () => {
    req.body = {
      plate: 'ABC1234',
      model: 'Fiat Uno',
      year: 2020,
      mileage: 50000,
      vehicleType: 'car',
      operationalStatus: 'active',
    };

    validateVehicleCreate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 with all errors when body is completely empty', () => {
    req.body = {};

    validateVehicleCreate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      errors: expect.arrayContaining([
        "Field 'plate' is required and cannot be empty",
        "Field 'model' is required and cannot be empty",
        "Field 'year' is required and cannot be empty",
        "Field 'mileage' is required and cannot be empty",
        "Field 'vehicleType' is required and cannot be empty",
        "Field 'operationalStatus' is required and cannot be empty",
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when plate is whitespace only', () => {
    req.body = {
      plate: '   ',
      model: 'Fiat Uno',
      year: 2020,
      mileage: 50000,
      vehicleType: 'car',
      operationalStatus: 'active',
    };

    validateVehicleCreate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      errors: ["Field 'plate' is required and cannot be empty"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when a field is null', () => {
    req.body = {
      plate: 'ABC1234',
      model: 'Fiat Uno',
      year: null,
      mileage: 50000,
      vehicleType: 'car',
      operationalStatus: 'active',
    };

    validateVehicleCreate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      errors: ["Field 'year' is required and cannot be empty"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when mileage is 0 (zero is a valid value)', () => {
    req.body = {
      plate: 'ABC1234',
      model: 'Fiat Uno',
      year: 2020,
      mileage: 0,
      vehicleType: 'car',
      operationalStatus: 'active',
    };

    validateVehicleCreate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 listing every missing field when multiple are absent', () => {
    req.body = { plate: 'ABC1234', model: 'Fiat Uno' };

    validateVehicleCreate(req, res, next);

    const call = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(400);
    expect(call.errors).toHaveLength(4);
    expect(next).not.toHaveBeenCalled();
  });
});
