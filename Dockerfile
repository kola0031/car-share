# Multi-stage build for optimized production image

# Stage 1: Build frontend
FROM node:20-alpine AS builder

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for building frontend)
RUN npm ci && \
    npm cache clean --force

# Copy application code
COPY . .

# Build the frontend (set API URL to relative path for same-origin requests)
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built frontend and server code only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port (default 3001, can be overridden via env)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/api/health || exit 1

# Use production command
CMD ["npm", "run", "server"]

