# # Stage 1: Build
# FROM node:20-alpine AS builder

# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# # Stage 2: Production
# FROM node:20-alpine

# WORKDIR /app
# COPY package*.json ./
# RUN npm install --production
# COPY --from=builder /app/dist ./dist

# # Copy wait script
# COPY wait-for-mongo.sh .
# RUN chmod +x wait-for-mongo.sh

# EXPOSE 4004

# # CMD sẽ chờ Mongo sẵn sàng trước khi chạy app
# CMD ["./wait-for-mongo.sh", "volunteer-mongo", "node", "dist/main.js"]


# ---------------- Stage 1: Build ----------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json và package-lock.json
COPY share/package*.json ./share/
COPY notification-service/package*.json ./notification-service/

# Cài dependencies cho share và notification-service
RUN cd share && npm install
RUN cd notification-service && npm install

# Copy toàn bộ source code
COPY share ./share
COPY notification-service ./notification-service

# Build share trước (nếu share cũng cần build TS)
WORKDIR /app/share
RUN npm run build || echo "No build script for share, skipping"

# Build notification-service
WORKDIR /app/notification-service
RUN npm run build

# ---------------- Stage 2: Production ----------------
FROM node:20-alpine
WORKDIR /app

# Copy node_modules từ builder
COPY --from=builder /app/share/node_modules ./share/node_modules
COPY --from=builder /app/notification-service/node_modules ./node_modules

# Copy dist
COPY --from=builder /app/notification-service/dist ./dist
COPY --from=builder /app/share/dist ./share/dist

# Copy script chờ các service sẵn sàng
COPY wait-for-services.sh ./
RUN chmod +x wait-for-services.sh

EXPOSE 4000

# CMD chạy với wait script
CMD ["./wait-for-services.sh", "node", "dist/main.js"]
