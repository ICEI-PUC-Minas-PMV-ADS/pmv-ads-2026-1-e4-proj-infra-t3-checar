import mongoose from 'mongoose';
import Vehicle from'../models/Vehicle.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /vehicles
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    return res.status(200).json({ status: 'success', count: vehicles.length, data: vehicles });
  } catch (error) {
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
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// POST /vehicles
const createVehicle = async (req, res) => {
  try {
    const { plate, model, year, mileage, vehicleType, operationalStatus, observation } = req.body;

    const vehicle = await Vehicle.create({
      plate,
      model,
      year,
      mileage,
      vehicleType,
      operationalStatus,
      observation: observation || null,
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

    const { plate, model, year, mileage, vehicleType, operationalStatus, observation } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { plate, model, year, mileage, vehicleType, operationalStatus, observation: observation ?? null },
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
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
