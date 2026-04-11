const path = require('path');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

// IMPORTA AS ROTAS E O NOVO ARQUIVO DE CONFIGURAÇÃO DO SWAGGER
const inspecaoRoutes = require('./routes_upload'); 
const specs = require('./swagger_upload');

const app = express();

// Middlewares
app.use(express.json());
// Serve as imagens para que possam ser visualizadas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CONFIGURAÇÃO DA ROTA DE DOCUMENTAÇÃO
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- CONEXÃO BANCO DE DADOS ---
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
    .then(() => console.log("Conectado ao MongoDB Atlas"))
    .catch(err => console.error("Erro ao conectar ao MongoDB Atlas:", err));

// 3. ROTAS DA API (CRUD de Veículos + Inspeção/Upload)
app.use(inspecaoRoutes);

// --- INICIALIZAÇÃO ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\nServidor rodando em http://localhost:${PORT}`);
    console.log(`Documentação disponível em http://localhost:${PORT}/api-docs`);
});
