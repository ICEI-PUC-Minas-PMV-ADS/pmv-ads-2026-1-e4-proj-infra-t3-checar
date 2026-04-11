const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Checar',
    version: '1.0.0',
    description: 'API REST para cadastro e gerenciamento de veículos',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Health', description: 'Status da aplicação' },
    { name: 'Vehicles', description: 'Operações de veículos' },
  ],
  components: {
    schemas: {
      Vehicle: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'ID único gerado pelo MongoDB',
            example: '6656a1b2c3d4e5f6a7b8c9d0',
          },
          plate: {
            type: 'string',
            description: 'Placa do veículo (única, convertida para maiúsculo)',
            example: 'ABC1D23',
          },
          model: {
            type: 'string',
            description: 'Modelo do veículo',
            example: 'Fiat Uno',
          },
          year: {
            type: 'integer',
            description: 'Ano de fabricação',
            example: 2020,
          },
          mileage: {
            type: 'number',
            description: 'Quilometragem',
            example: 45000,
          },
          vehicleType: {
            type: 'string',
            description: 'Tipo do veículo',
            enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'other'],
            example: 'car',
          },
          operationalStatus: {
            type: 'string',
            description: 'Status operacional do veículo',
            enum: ['active', 'inactive', 'maintenance', 'decommissioned'],
            example: 'active',
          },
          observation: {
            type: 'string',
            nullable: true,
            description: 'Observações adicionais',
            example: 'Revisão em dia',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-05-29T12:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-05-29T12:00:00.000Z',
          },
        },
      },
      VehicleInput: {
        type: 'object',
        required: ['plate', 'model', 'year', 'mileage', 'vehicleType', 'operationalStatus'],
        properties: {
          plate: { type: 'string', example: 'ABC1D23' },
          model: { type: 'string', example: 'Fiat Uno' },
          year: { type: 'integer', minimum: 1886, example: 2020 },
          mileage: { type: 'number', minimum: 0, example: 45000 },
          vehicleType: {
            type: 'string',
            enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'other'],
            example: 'car',
          },
          operationalStatus: {
            type: 'string',
            enum: ['active', 'inactive', 'maintenance', 'decommissioned'],
            example: 'active',
          },
          observation: { type: 'string', nullable: true, example: 'Revisão em dia' },
        },
      },
      // { status, message } — erros com mensagem única
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['error'] },
          message: { type: 'string' },
        },
      },
      // { status, errors[] } — erros de validação com lista de mensagens
      ErrorsArrayResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['error'] },
          errors: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Verifica se a API está no ar',
        responses: {
          200: {
            description: 'API operacional',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },

    '/vehicles': {
      get: {
        tags: ['Vehicles'],
        summary: 'Listar todos os veículos',
        responses: {
          200: {
            description: 'Lista de veículos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    count: { type: 'integer', example: 2 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Vehicle' },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Internal server error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Vehicles'],
        summary: 'Cadastrar um veículo',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/VehicleInput' } },
          },
        },
        responses: {
          201: {
            description: 'Veículo criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Vehicle' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Campos obrigatórios ausentes ou com valor inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorsArrayResponse' },
                examples: {
                  campoAusente: {
                    summary: 'Campo obrigatório ausente (middleware)',
                    value: { status: 'error', errors: ["Field 'plate' is required and cannot be empty"] },
                  },
                  valorInvalido: {
                    summary: 'Valor fora do enum permitido (Mongoose)',
                    value: { status: 'error', errors: ['Vehicle type must be one of: car, motorcycle, truck, bus, van, other'] },
                  },
                },
              },
            },
          },
          409: {
            description: 'Placa já cadastrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'A vehicle with this plate already exists' },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Internal server error' },
              },
            },
          },
        },
      },
    },

    '/vehicles/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID do veículo (MongoDB ObjectId)',
          schema: { type: 'string', example: '6656a1b2c3d4e5f6a7b8c9d0' },
        },
      ],
      get: {
        tags: ['Vehicles'],
        summary: 'Buscar veículo por ID',
        responses: {
          200: {
            description: 'Veículo encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Vehicle' },
                  },
                },
              },
            },
          },
          400: {
            description: 'ID com formato inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Invalid vehicle ID' },
              },
            },
          },
          404: {
            description: 'Veículo não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Vehicle not found' },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Internal server error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Vehicles'],
        summary: 'Atualizar veículo completo (substituição total)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/VehicleInput' } },
          },
        },
        responses: {
          200: {
            description: 'Veículo atualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Vehicle' },
                  },
                },
              },
            },
          },
          400: {
            description: 'ID inválido, campo obrigatório ausente ou valor inválido',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/ErrorResponse' },
                    { $ref: '#/components/schemas/ErrorsArrayResponse' },
                  ],
                },
                examples: {
                  idInvalido: {
                    summary: 'ID com formato inválido',
                    value: { status: 'error', message: 'Invalid vehicle ID' },
                  },
                  campoAusente: {
                    summary: 'Campo obrigatório ausente (middleware)',
                    value: { status: 'error', errors: ["Field 'model' is required and cannot be empty"] },
                  },
                  valorInvalido: {
                    summary: 'Valor fora do enum permitido (Mongoose)',
                    value: { status: 'error', errors: ['Operational status must be one of: active, inactive, maintenance, decommissioned'] },
                  },
                },
              },
            },
          },
          404: {
            description: 'Veículo não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Vehicle not found' },
              },
            },
          },
          409: {
            description: 'Placa já existe em outro veículo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'A vehicle with this plate already exists' },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Internal server error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Vehicles'],
        summary: 'Remover veículo',
        responses: {
          204: { description: 'Veículo removido com sucesso (sem conteúdo)' },
          400: {
            description: 'ID com formato inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Invalid vehicle ID' },
              },
            },
          },
          404: {
            description: 'Veículo não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Vehicle not found' },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { status: 'error', message: 'Internal server error' },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
