const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Checar - Gestão e Inspeção',
      version: '1.0.0',
      description: 'Sistema completo de CRUD de veículos e Checklist de inspeção com fotos',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Vehicle: {
          type: 'object',
          required: ['plate', 'model'],
          properties: {
            _id: { type: 'string', example: '6656a1b2c3d4e5f6a7b8c9d0' },
            plate: { type: 'string', example: 'ABC1D23' },
            model: { type: 'string', example: 'Fiat Uno' },
            year: { type: 'integer', example: 2022 },
            vehicleType: { type: 'string', enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'other'] },
            operationalStatus: { type: 'string', enum: ['active', 'inactive', 'maintenance'] }
          }
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
        }
      }
    }
  },
  // Aqui vai ler os comentários @swagger dentro do routes.js
  apis: [path.resolve(__dirname, 'routes_upload.js')], 
};

module.exports = swaggerJsdoc(options);
