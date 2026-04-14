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
          properties: {
            _id: { type: 'string' },
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
            _id: { type: 'string' },
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
            },
            dataInspecao: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            erro: { type: 'string' },
            mensagem: { type: 'string' },
            detalhe: { type: 'string' }
          },
        }
      }
    },
  },
  // Aponta para o arquivo principal do servidor
  apis: ['./server.js'], // Mude para o nome do seu arquivo principal
};

const swaggerSpec = swaggerJsdoc(options);

// Log para debug
console.log('🔍 Swagger: Arquivos analisados:', options.apis);
console.log('📝 Swagger: Rotas encontradas:', Object.keys(swaggerSpec.paths || {}).length);
console.log('🛣️ Rotas documentadas:', Object.keys(swaggerSpec.paths || {}));

export default swaggerSpec;