# Stage 1: Build stage using Node 20 Alpine
FROM node:20-alpine AS builder

WORKDIR /app

# Accept environment variable argument for Vite compilation
ARG VITE_API_BASE_URL=http://10.1.150.142:8000/api/
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy package manifests & install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source files and compile static production build
COPY . .
RUN npm run build

# Stage 2: Production static server using Node 20 Alpine & 'serve' (No Nginx required)
FROM node:20-alpine AS runner

WORKDIR /app

# Install lightweight 'serve' static web server globally
RUN npm install -g serve

# Copy compiled dist folder from Stage 1
COPY --from=builder /app/dist ./dist

# Expose port 3000 directly
EXPOSE 3000

# Start static file server on port 3000 with SPA client routing (-s)
CMD ["serve", "-s", "dist", "-l", "3000"]
