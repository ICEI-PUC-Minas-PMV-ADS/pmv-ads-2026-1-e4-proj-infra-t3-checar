FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY services/checklist-service/ ./services/checklist-service/
CMD ["node", "services/checklist-service/index.js"]
