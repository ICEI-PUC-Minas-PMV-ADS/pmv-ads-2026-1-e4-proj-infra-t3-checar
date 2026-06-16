FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY services/vehicle-service/ ./services/vehicle-service/
CMD ["node", "services/vehicle-service/index.js"]
