import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Checar - Gestão e Inspeção',
      version: '1.0.0',
      description: 'Sistema completo de CRUD de veículos e Checklist de inspeção com fotos.',
    },
    servers: [
      { 
        url: 'https://checar-fpf7e0ecd9hdcrf2.canadacentral-01.azurewebsites.net', 
        description: 'Produção (Azure)' 
      },
      { 
        url: 'http://localhost:3000', 
        description: 'Local' 
      }
    ],
    components: {
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@checar.com' },
            tipoUsuario: { type: 'string', enum: ['Motorista', 'Gestor'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Vehicle: {
          type: 'object',
          required: ['plate', 'model'],
          properties: {
            _id: { type: 'string', example: '6656a1b2c3d4e5f6a7b8c9d0' },
            plate: { type: 'string', example: 'ABC1D23' },
            model: { type: 'string', example: 'Fiat Uno' },
            year: { type: 'integer', example: 2022 },
            mileage: { type: 'number', example: 45000 },
            vehicleType: { type: 'string', enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'other'] },
            operationalStatus: { type: 'string', enum: ['active', 'inactive', 'maintenance', 'decommissioned'] },
            observation: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          }
        },
        VehicleInput: {
          type: 'object',
          required: ['plate', 'model', 'year', 'mileage', 'vehicleType', 'operationalStatus'],
          properties: {
            plate: { type: 'string', example: 'ABC1D23' },
            model: { type: 'string', example: 'Fiat Uno' },
            year: { type: 'integer', minimum: 1886, example: 2020 },
            mileage: { type: 'number', minimum: 0, example: 45000 },
            vehicleType: { type: 'string', enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'other'] },
            operationalStatus: { type: 'string', enum: ['active', 'inactive', 'maintenance', 'decommissioned'] },
            observation: { type: 'string', nullable: true },
          },
        },
        Inspecao: {
          type: 'object',
          properties: {
            placa: { type: 'string', example: 'ABC1D23' },
            fotos: {
              type: 'object',
              properties: {
                frente: { type: 'string' },
                traseira: { type: 'string' },
                lateralEsquerda: { type: 'string' },
                lateralDireita: { type: 'string' },
                topo: { type: 'string' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['error'] },
            message: { type: 'string' },
          },
        }
      }
    },
  },
  apis: ['./api_cadastro.js'],  // arquivo principal com as rotas
};

const swaggerSpec = swaggerJsdoc(options);

// Log para debug
console.log('🔍 Swagger: Arquivos analisados:', options.apis);
console.log('📝 Swagger: Rotas encontradas:', Object.keys(swaggerSpec.paths || {}).length);

export default swaggerSpec;