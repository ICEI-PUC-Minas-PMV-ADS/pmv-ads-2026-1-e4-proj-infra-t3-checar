const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API Checar - Gestão e Inspeção",
    version: "1.0.0",
    description:
      "Sistema completo de CRUD de veículos e Checklist de inspeção com fotos.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local (Desenvolvimento)",
    },
    {
      url: "https://checar-fpf7e0ecd9hdcrf2.canadacentral-01.azurewebsites.net",
      description: "Produção (Azure)",
    },
  ],
    tags: [
    { name: "Vehicles", description: "Operações de veículos" },
    { name: "Usuários", description: "Operações de usuários do sistema" },
    { name: "Inspeção", description: "Operações de inspeção veicular" },
    { name: "Reports", description: "Exportações e relatórios do sistema" },
  ],
  paths: {
    // ==================== VEÍCULOS ====================
    "/vehicles": {
      get: {
        summary: "Lista todos os veículos",
        tags: ["Vehicles"],
        responses: {
          200: {
            description: "Lista de veículos retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Vehicle" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Cadastra novo veículo",
        tags: ["Vehicles"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VehicleInput" },
            },
          },
        },
        responses: {
          201: { description: "Veículo criado com sucesso" },
          400: { description: "Dados inválidos ou placa duplicada" },
        },
      },
    },
    "/vehicles/{id}": {
      get: {
        summary: "Busca veículo por ID",
        tags: ["Vehicles"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "ID do veículo",
          },
        ],
        responses: {
          200: { description: "Veículo encontrado" },
          404: { description: "Veículo não encontrado" },
        },
      },
      put: {
        summary: "Atualiza um veículo existente",
        tags: ["Vehicles"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VehicleInput" },
            },
          },
        },
        responses: {
          200: { description: "Veículo atualizado com sucesso" },
          404: { description: "Veículo não encontrado" },
        },
      },
      delete: {
        summary: "Remove um veículo",
        tags: ["Vehicles"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          204: { description: "Veículo removido com sucesso" },
          404: { description: "Veículo não encontrado" },
        },
      },
    },
    "/vehicles/plate/{plate}": {
      get: {
        summary: "Busca veículo pela placa",
        tags: ["Vehicles"],
        parameters: [
          {
            in: "path",
            name: "plate",
            required: true,
            schema: { type: "string" },
            description: "Placa do veículo (ex: ABC1234)",
            example: "ABC1234",
          },
        ],
        responses: {
          200: {
            description: "Veículo encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Vehicle" },
              },
            },
          },
          404: { description: "Veículo não encontrado" },
        },
      },
    },

    // ==================== USUÁRIOS (CRUD COMPLETO) ====================
    "/usuariocadastrados": {
      // CREATE - Cadastrar novo usuário
      post: {
        summary: "Cadastrar novo usuário",
        tags: ["Usuários"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha", "tipoUsuario"],
                properties: {
                  nome: { type: "string", example: "João Silva" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "joao@email.com",
                  },
                  senha: {
                    type: "string",
                    format: "password",
                    example: "123456",
                  },
                  tipoUsuario: {
                    type: "string",
                    enum: ["Motorista", "Gestor"],
                    example: "Motorista",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Usuário criado com sucesso" },
          400: { description: "Dados inválidos ou email já existe" },
        },
      },
      // READ ALL - Listar todos os usuários
      get: {
        summary: "Listar todos os usuários",
        tags: ["Usuários"],
        responses: {
          200: {
            description: "Lista de usuários retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    total: { type: "integer" },
                    usuarios: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Usuario" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // DELETE ALL - Deletar todos os usuários
      delete: {
        summary: "Deletar todos os usuários (requer confirmação)",
        tags: ["Usuários"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["confirmacao"],
                properties: {
                  confirmacao: { type: "string", example: "DELETAR_TODOS" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Usuários deletados com sucesso" },
          400: { description: "Confirmação necessária" },
        },
      },
    },
    "/usuariocadastrados/{id}": {
      // READ ONE - Buscar usuário por ID
      get: {
        summary: "Buscar usuário por ID",
        tags: ["Usuários"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "ID do usuário",
          },
        ],
        responses: {
          200: { description: "Usuário encontrado" },
          404: { description: "Usuário não encontrado" },
        },
      },
      // UPDATE - Atualizar usuário
      put: {
        summary: "Atualizar usuário",
        tags: ["Usuários"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string", example: "João Silva Atualizado" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "joao.novo@email.com",
                  },
                  senha: {
                    type: "string",
                    format: "password",
                    example: "novaSenha123",
                  },
                  tipoUsuario: {
                    type: "string",
                    enum: ["Motorista", "Gestor"],
                    example: "Gestor",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Usuário atualizado com sucesso" },
          404: { description: "Usuário não encontrado" },
        },
      },
      // DELETE - Deletar usuário
      delete: {
        summary: "Deletar usuário",
        tags: ["Usuários"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Usuário deletado com sucesso" },
          404: { description: "Usuário não encontrado" },
        },
      },
    },

    // ==================== INSPEÇÕES ====================
    "/inspecao/upload": {
      post: {
        summary: "Realizar inspeção com fotos obrigatórias",
        tags: ["Inspeção"],
        description:
          "Envia as 5 fotos obrigatórias do veículo (frente, traseira, lateral esquerda, lateral direita, topo)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: [
                  "placa",
                  "frente",
                  "traseira",
                  "lateralEsquerda",
                  "lateralDireita",
                  "topo",
                ],
                properties: {
                  placa: {
                    type: "string",
                    description: "Placa do veículo",
                    example: "ABC1234",
                  },
                  frente: {
                    type: "string",
                    format: "binary",
                    description: "Foto da frente do veículo",
                  },
                  traseira: {
                    type: "string",
                    format: "binary",
                    description: "Foto da traseira do veículo",
                  },
                  lateralEsquerda: {
                    type: "string",
                    format: "binary",
                    description: "Foto da lateral esquerda",
                  },
                  lateralDireita: {
                    type: "string",
                    format: "binary",
                    description: "Foto da lateral direita",
                  },
                  topo: {
                    type: "string",
                    format: "binary",
                    description: "Foto do topo do veículo",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Inspeção realizada com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Inspecao" },
              },
            },
          },
          400: {
            description: "Checklist incompleto ou placa ausente",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/inspecoes/historico/{placa}": {
      get: {
        summary: "Buscar histórico de inspeções por placa",
        tags: ["Inspeção"],
        parameters: [
          {
            in: "path",
            name: "placa",
            required: true,
            schema: { type: "string" },
            description: "Placa do veículo",
            example: "ABC1234",
          },
        ],
        responses: {
          200: {
            description: "Histórico de inspeções encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Inspecao" },
                },
              },
            },
          },
          404: { description: "Nenhuma inspeção encontrada para esta placa" },
        },
      },
    },
    "/inspecoes": {
      get: {
        summary: "Listar todas as inspeções realizadas",
        tags: ["Inspeção"],
        responses: {
          200: {
            description: "Lista de inspeções retornada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Inspecao" },
                },
              },
            },
          },
        },
      },
    },
    "/inspecoes/{id}": {
      delete: {
        summary: "Deletar uma inspeção por ID",
        tags: ["Inspeção"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "ID da inspeção",
          },
        ],
        responses: {
          200: { description: "Inspeção deletada com sucesso" },
          404: { description: "Inspeção não encontrada" },
        },
      },
    },
    "/inspecoes/placa/{placa}": {
      delete: {
        summary: "Deletar todas as inspeções de uma placa",
        tags: ["Inspeção"],
        parameters: [
          {
            in: "path",
            name: "placa",
            required: true,
            schema: { type: "string" },
            description: "Placa do veículo",
          },
        ],
        responses: {
          200: { description: "Inspeções deletadas com sucesso" },
          404: { description: "Nenhuma inspeção encontrada" },
        },
      },
    },
    "/exportacoes/vehicles/csv": {
      get: {
        tags: ["Reports"],
        summary: "Exportar veículos em CSV",
        description:
          "Gera um arquivo CSV com os dados dos veículos cadastrados no sistema.",
        responses: {
          200: {
            description: "Arquivo CSV gerado com sucesso",
            content: {
              "text/csv": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  status: "error",
                  message: "Erro ao exportar CSV de veículos",
                },
              },
            },
          },
        },
      },
    },
    "/exportacoes/inspecoes/csv": {
      get: {
        tags: ["Reports"],
        summary: "Exportar inspeções em CSV",
        description:
          "Gera um arquivo CSV com os dados das inspeções. Pode filtrar por placa usando query string.",
        parameters: [
          {
            name: "placa",
            in: "query",
            required: false,
            description: "Placa do veículo para filtrar inspeções",
            schema: {
              type: "string",
              example: "ABC1D23",
            },
          },
        ],
        responses: {
          200: {
            description: "Arquivo CSV gerado com sucesso",
            content: {
              "text/csv": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Nenhuma inspeção encontrada para a placa informada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  status: "error",
                  message: "Nenhuma inspeção encontrada para esta placa",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  status: "error",
                  message: "Erro ao exportar CSV de inspeções",
                },
              },
            },
          },
        },
      },
    },
    "/relatorios/inspecoes/{placa}/pdf": {
      get: {
        tags: ["Reports"],
        summary: "Gerar relatório PDF de inspeções por placa",
        description:
          "Gera um arquivo PDF com o histórico de inspeções de um veículo a partir da placa informada.",
        parameters: [
          {
            name: "placa",
            in: "path",
            required: true,
            description: "Placa do veículo",
            schema: {
              type: "string",
              example: "ABC1D23",
            },
          },
        ],
        responses: {
          200: {
            description: "Arquivo PDF gerado com sucesso",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Nenhuma inspeção encontrada para a placa informada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  status: "error",
                  message: "Nenhuma inspeção encontrada para esta placa",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  status: "error",
                  message: "Erro ao gerar relatório PDF",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string" },
          nome: { type: "string", example: "João Silva" },
          email: { type: "string", example: "joao@checar.com" },
          tipoUsuario: { type: "string", enum: ["Motorista", "Gestor"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Vehicle: {
        type: "object",
        properties: {
          _id: { type: "string" },
          plate: { type: "string", example: "ABC1234" },
          model: { type: "string", example: "Fiat Uno" },
          year: { type: "integer", example: 2022 },
          mileage: { type: "number", example: 45000 },
          vehicleType: {
            type: "string",
            enum: ["car", "motorcycle", "truck", "bus", "van", "other"],
          },
          operationalStatus: {
            type: "string",
            enum: ["active", "inactive", "maintenance", "decommissioned"],
          },
          observation: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      VehicleInput: {
        type: "object",
        required: [
          "plate",
          "model",
          "year",
          "mileage",
          "vehicleType",
          "operationalStatus",
        ],
        properties: {
          plate: { type: "string", example: "ABC1234" },
          model: { type: "string", example: "Fiat Uno" },
          year: { type: "integer", minimum: 1886, example: 2020 },
          mileage: { type: "number", minimum: 0, example: 45000 },
          vehicleType: {
            type: "string",
            enum: ["car", "motorcycle", "truck", "bus", "van", "other"],
          },
          operationalStatus: {
            type: "string",
            enum: ["active", "inactive", "maintenance", "decommissioned"],
          },
          observation: { type: "string", nullable: true },
        },
      },
      Inspecao: {
        type: "object",
        properties: {
          _id: { type: "string" },
          placa: { type: "string", example: "ABC1234" },
          fotos: {
            type: "object",
            properties: {
              frente: {
                type: "string",
                description: "Caminho da foto da frente",
              },
              traseira: {
                type: "string",
                description: "Caminho da foto da traseira",
              },
              lateralEsquerda: {
                type: "string",
                description: "Caminho da foto lateral esquerda",
              },
              lateralDireita: {
                type: "string",
                description: "Caminho da foto lateral direita",
              },
              topo: { type: "string", description: "Caminho da foto do topo" },
            },
          },
          dataInspecao: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          erro: { type: "string" },
          mensagem: { type: "string" },
          detalhe: { type: "string" },
          campos_pendentes: {
            type: "array",
            items: { type: "string" },
            description: "Lista de campos obrigatórios faltando",
          },
        },
      },
    },
  },
};

console.log("✅ Swagger configurado com todas as rotas:");
console.log(
  "🚗 Veículos:",
  Object.keys(swaggerSpec.paths).filter((p) => p.includes("/vehicles")),
);
console.log(
  "👤 Usuários:",
  Object.keys(swaggerSpec.paths).filter((p) => p.includes("/usuarios")),
);
console.log(
  "📸 Inspeções:",
  Object.keys(swaggerSpec.paths).filter((p) => p.includes("/inspec")),
);

export default swaggerSpec;
