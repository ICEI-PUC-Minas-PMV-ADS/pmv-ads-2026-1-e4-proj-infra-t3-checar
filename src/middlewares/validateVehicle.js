const REQUIRED_FIELDS = ['plate', 'model', 'year', 'mileage', 'vehicleType', 'operationalStatus'];

const isEmpty = (value) => value === null || value === undefined || String(value).trim() === '';

const validateVehicleCreate = (req, res, next) => {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (isEmpty(req.body[field])) {
      errors.push(`Field '${field}' is required and cannot be empty`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: 'error', errors });
  }

  next();
};

export { validateVehicleCreate };
