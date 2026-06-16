FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY services/notification-service/ ./services/notification-service/
CMD ["node", "services/notification-service/index.js"]
