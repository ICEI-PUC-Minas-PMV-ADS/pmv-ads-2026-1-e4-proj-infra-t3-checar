FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY services/audit-service/ ./services/audit-service/
CMD ["node", "services/audit-service/index.js"]
