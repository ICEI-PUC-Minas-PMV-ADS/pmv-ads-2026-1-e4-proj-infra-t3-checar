import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API Checar - Gestão e Inspeção',
    version: '1.0.0',
    description: 'Sistema completo de CRUD de veículos e Checklist de inspeção com fotos.',
  },
  servers: [
    { 
      url: 'http://localhost:3000', 
      description: 'Local (Desenvolvimento)' 
    },
    { 
      url: 'https://checar-fpf7e0ecd9hdcrf2.canadacentral-01.azurewebsites.net', 
      description: 'Produção (Azure)' 
    }
  ],
  paths: {
    // Rotas de Veículos
    '/vehicles': {
      get: {
        summary: 'Lista todos os veículos',
        tags: ['Vehicles'],
        responses: {
          200: {
            description: 'Lista de veículos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Vehicle'
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Cadastra novo veículo',
        tags: ['Vehicles'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VehicleInput'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Veículo criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Vehicle'
                }
              }
            }
          },
          400: {
            description: 'Dados inválidos'
          }
        }
      }
    },
    '/vehicles/{id}': {
      get: {
        summary: 'Busca veículo por ID',
        tags: ['Vehicles'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'ID do veículo'
          }
        ],
        responses: {
          200: {
            description: 'Veículo encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Vehicle'
                }
              }
            }
          },
          404: {
            description: 'Veículo não encontrado'
          }
        }
      },
      put: {
        summary: 'Atualiza um veículo existente',
        tags: ['Vehicles'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'ID do veículo'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VehicleInput'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Veículo atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Vehicle'
                }
              }
            }
          },
          404: {
            description: 'Veículo não encontrado'
          }
        }
      },
      delete: {
        summary: 'Remove um veículo',
        tags: ['Vehicles'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'ID do veículo'
          }
        ],
        responses: {
          204: {
            description: 'Veículo removido com sucesso'
          },
          404: {
            description: 'Veículo não encontrado'
          }
        }
      }
    },
    // Rotas de Usuários
    '/usuariocadastrados': {
      post: {
        summary: 'Cadastra um novo usuário',
        tags: ['Usuários'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha', 'tipoUsuario'],
                properties: {
                  nome: { type: 'string', example: 'João Silva' },
                  email: { type: 'string', format: 'email', example: 'joao@email.com' },
                  senha: { type: 'string', format: 'password', example: '123456' },
                  tipoUsuario: { type: 'string', enum: ['Motorista', 'Gestor'], example: 'Motorista' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    nome: { type: 'string' },
                    email: { type: 'string' },
                    tipoUsuario: { type: 'string' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Campos obrigatórios faltando ou email já cadastrado'
          }
        }
      }
    },
    '/usuariocadastrados/{id}': {
      get: {
        summary: 'Busca um usuário pelo ID',
        tags: ['Usuários'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'ID do usuário'
          }
        ],
        responses: {
          200: {
            description: 'Usuário encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    nome: { type: 'string' },
                    email: { type: 'string' },
                    tipoUsuario: { type: 'string' }
                  }
                }
              }
            }
          },
          404: {
            description: 'Usuário não encontrado'
          }
        }
      }
    }
  },
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
          updatedAt: { type: 'string', format: 'date-time' }
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
          observation: { type: 'string', nullable: true }
        }
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
        }
      }
    }
  }
};

console.log('✅ Swagger configurado manualmente com as rotas');
console.log('📝 Rotas disponíveis:', Object.keys(swaggerSpec.paths));

export default swaggerSpec;