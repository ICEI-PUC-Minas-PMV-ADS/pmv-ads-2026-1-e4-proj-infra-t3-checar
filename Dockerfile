# ── Stage 1: Build frontend web ──────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend-web/package*.json ./
RUN npm ci
COPY frontend-web/ ./
RUN npm run build

# ── Stage 2: Production API ───────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
# Copia o bundle estático produzido no Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend-web/dist
EXPOSE 3000
CMD ["node", "src/api_cadastro.js"]
