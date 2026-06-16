# Segurança — CHECAR

## Dependências de Segurança
- `helmet` — HTTP security headers (HSTS, X-Frame, etc.)
- `express-rate-limit` — Rate limiting em /login e /registro
- `express-mongo-sanitize` — Sanitização contra NoSQL injection
- `hpp` — Proteção contra HTTP Parameter Pollution

## Como aplicar (adicionar em api_cadastro.js após Fase 12 deploy):

```javascript
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Após app.use(express.json()):
app.use(mongoSanitize());  // Remove $ e . de inputs
app.use(hpp());            // Previne parameter pollution
```

## Helmet CSP (configuração recomendada):
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // Swagger UI requer
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "*.blob.core.windows.net"],
    },
  },
}));
```

## Variáveis de Ambiente Obrigatórias
Ver .env.example
