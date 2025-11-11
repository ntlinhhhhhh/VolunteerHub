# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist

# Copy wait script
COPY wait-for-mongo.sh .
RUN chmod +x wait-for-mongo.sh

EXPOSE 4000

# CMD sẽ chờ Mongo sẵn sàng trước khi chạy app
CMD ["./wait-for-mongo.sh", "volunteer-mongo", "node", "dist/main.js"]
