import mongoose from 'mongoose';
import Vehicle from'../models/Vehicle.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /vehicles?page=1&limit=20
const getAllVehicles = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('[getAllVehicles] MongoDB indisponível. readyState:', mongoose.connection.readyState);
    return res.status(503).json({ status: 'error', message: 'Database temporarily unavailable. Please retry.' });
  }

  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip  = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Vehicle.countDocuments(),
    ]);

    return res.status(200).json({
      status: 'success',
      count: vehicles.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: vehicles,
    });
  } catch (error) {
    console.error('[getAllVehicles]', error.name, error.message);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// GET /vehicles/:id
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid vehicle ID' });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }

    return res.status(200).json({ status: 'success', data: vehicle });
  } catch (error) {
    console.error('[getVehicleById]', error.name, error.message);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// POST /vehicles
const createVehicle = async (req, res) => {
  try {
    const { plate, model, year, mileage, vehicleType, operationalStatus, observation, marca, cor } = req.body;

    const vehicle = await Vehicle.create({
      plate,
      model,
      year,
      mileage,
      vehicleType,
      operationalStatus,
      observation: observation || null,
      marca: marca || null,
      cor: cor || null,
    });

    return res.status(201).json({ status: 'success', data: vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'A vehicle with this plate already exists' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', errors });
    }
    console.error('[createVehicle]', error.name, error.message);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// PUT /vehicles/:id
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid vehicle ID' });
    }

    const { plate, model, year, mileage, vehicleType, operationalStatus, observation, marca, cor } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { plate, model, year, mileage, vehicleType, operationalStatus, observation: observation ?? null, marca: marca ?? null, cor: cor ?? null },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }

    return res.status(200).json({ status: 'success', data: vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'A vehicle with this plate already exists' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', errors });
    }
    console.error('[updateVehicle]', error.name, error.message);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// DELETE /vehicles/:id
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid vehicle ID' });
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      return res.status(404).json({ status: 'error', message: 'Vehicle not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('[deleteVehicle]', error.name, error.message);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
