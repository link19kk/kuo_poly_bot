# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY deps ./deps

# Install all dependencies (including devDependencies for compilation)
RUN npm ci

# Copy source code
COPY src ./src
COPY script ./script

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY deps ./deps

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Copy .env file (will be overridden by docker-compose)
COPY .env .env

# Expose port if needed (adjust based on your bot)
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
