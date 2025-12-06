# ---------------- Stage 1: Build ----------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json và package-lock.json
COPY share/package*.json ./share/
COPY event-service/package*.json ./event-service/

# Cài dependencies cho share và event-service
RUN cd share && npm install
RUN cd event-service && npm install

# Copy toàn bộ source code
COPY share ./share
COPY event-service ./event-service

# Build share trước (nếu share cũng cần build TS)
WORKDIR /app/share
RUN npm run build || echo "No build script for share, skipping"

# Build event-service
WORKDIR /app/event-service
RUN npm run build

# ---------------- Stage 2: Production ----------------
FROM node:20-alpine
WORKDIR /app

# Copy node_modules từ builder
COPY --from=builder /app/share/node_modules ./share/node_modules
COPY --from=builder /app/event-service/node_modules ./node_modules

# Copy dist
COPY --from=builder /app/event-service/dist ./dist
COPY --from=builder /app/share/dist ./share/dist

# Copy script chờ các service sẵn sàng
COPY wait-for-services.sh ./
RUN chmod +x wait-for-services.sh

EXPOSE 4006

# CMD chạy với wait script
CMD ["./wait-for-services.sh", "node", "dist/event-service/src/main.js"]


