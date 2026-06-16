FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY services/auth-service/ ./services/auth-service/
CMD ["node", "services/auth-service/index.js"]
