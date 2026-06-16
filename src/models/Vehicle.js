import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    plate: {
      type: String,
      required: [true, 'Plate is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1886, 'Year must be greater than or equal to 1886'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: [0, 'Mileage must be a positive number'],
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      trim: true,
      enum: {
        values: ['car', 'motorcycle', 'truck', 'bus', 'van', 'other'],
        message: 'Vehicle type must be one of: car, motorcycle, truck, bus, van, other',
      },
    },
    operationalStatus: {
      type: String,
      required: [true, 'Operational status is required'],
      trim: true,
      enum: {
        values: ['active', 'inactive', 'maintenance', 'decommissioned'],
        message: 'Operational status must be one of: active, inactive, maintenance, decommissioned',
      },
    },
<<<<<<< HEAD
=======
    marca: {
      type: String,
      trim: true,
      default: null,
    },
    cor: {
      type: String,
      trim: true,
      default: null,
    },
>>>>>>> d836a09 (Proteção das rotas da API com autenticação, Implementação de controle de permissões (RBAC) para perfis, Aplicação de rate limiting contra força bruta, Configuração de HTTPS com Helmet, Criação de componentes de assinatura para Web e Mobile)
    observation: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Evitar OverwriteModelError - verifica se o modelo já existe
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;