# ---------------- Stage 1: Build ----------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json và package-lock.json
COPY share/package*.json ./share/
COPY dashboard-service/package*.json ./dashboard-service/

# Cài dependencies cho share và dashboard-service
RUN cd share && npm install
RUN cd dashboard-service && npm install

# Copy toàn bộ source code
COPY share ./share
COPY dashboard-service ./dashboard-service

# Build share trước (nếu share cũng cần build TS)
WORKDIR /app/share
RUN npm run build || echo "No build script for share, skipping"

# Build dashboard-service
WORKDIR /app/dashboard-service
RUN npm run build

# ---------------- Stage 2: Production ----------------
FROM node:20-alpine
WORKDIR /app

# Copy node_modules từ builder
COPY --from=builder /app/share/node_modules ./share/node_modules
COPY --from=builder /app/dashboard-service/node_modules ./node_modules

# Copy dist
COPY --from=builder /app/dashboard-service/dist ./dist
COPY --from=builder /app/share/dist ./share/dist

# Copy script chờ các service sẵn sàng
COPY wait-for-services.sh ./
RUN chmod +x wait-for-services.sh

EXPOSE 4002

# CMD chạy với wait script
CMD ["./wait-for-services.sh", "node", "dist/main.js"]


