# Stage 1: Build the React frontend
FROM node:22 AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build the backend and final image
FROM node:22-slim

# Install FFmpeg and build tools (required for video rendering and sqlite3 compilation)
RUN apt-get update && \
    apt-get install -y ffmpeg python3 build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy backend source code
COPY server/ ./

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/client/dist /app/client/dist

# Create necessary directories and ensure they are writable
RUN mkdir -p /app/server/data /app/output && \
    chmod -R 777 /app/server/data /app/output

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Start the application
CMD ["node", "src/index.js"]
