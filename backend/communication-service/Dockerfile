# ---------------- Stage 1: Build ----------------
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Copy package files
    COPY share/package*.json ./share/
    COPY communication-service/package*.json ./communication-service/
    
    # Install dependencies
    RUN cd share && npm install
    RUN cd communication-service && npm install
    
    # Copy source code
    COPY share ./share
    COPY communication-service ./communication-service
    
    # Build share (if needed)
    WORKDIR /app/share
    RUN npm run build || echo "No build script for share, skipping"
    
    # Build communication-service
    WORKDIR /app/communication-service
    RUN npm run build
    
    # ---------------- Stage 2: Production ----------------
    FROM node:20-alpine
    WORKDIR /app
    
    # Copy node_modules from builder
    COPY --from=builder /app/share/node_modules ./share/node_modules
    COPY --from=builder /app/communication-service/node_modules ./node_modules
    
    # Copy dist
    COPY --from=builder /app/communication-service/dist ./dist
    COPY --from=builder /app/share/dist ./share/dist
    
    # Copy wait script
    COPY wait-for-services.sh ./
    RUN chmod +x wait-for-services.sh
    
    EXPOSE 4005
    
    # Run with wait script
    CMD ["./wait-for-services.sh", "node", "dist/main.js"]
    