# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy backend workspace
COPY backend ./backend

# Install dependencies for backend workspace only
RUN npm ci --workspace=backend

# Build backend
RUN npm run build --workspace=backend

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy backend workspace
COPY backend ./backend

# Install production dependencies only for backend
RUN npm ci --only=production --workspace=backend

# Copy built code from builder
COPY --from=builder /app/backend/dist ./backend/dist

# Create logs directory
RUN mkdir -p logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start", "--workspace=backend"]
