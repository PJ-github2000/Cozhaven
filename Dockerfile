# Stage 1: Build the Frontend
FROM oven/bun:1 AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
RUN bun run build

# Stage 2: Build the Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for psycopg2 and healthchecks
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/
COPY cozhaven_products.json ./backend/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p /app/backend/uploads

# Expose port
EXPOSE 8000

# Set working directory to backend
WORKDIR /app/backend

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
