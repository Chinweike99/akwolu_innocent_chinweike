# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and tsconfig
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
# COPY tests/ ./tests/
COPY migrations/ ./migrations/

# Build the application
RUN npm run build


# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S workforceuser -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder --chown=workforceuser:nodejs /app/dist ./dist
COPY --from=builder --chown=workforceuser:nodejs /app/migrations ./migrations

# Create logs directory
RUN mkdir -p /app/logs && chown workforceuser:nodejs /app/logs

# Switch to non-root user
USER workforceuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start the application
CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]

RUN ls -la /app/dist