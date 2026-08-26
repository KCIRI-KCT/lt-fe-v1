# # Stage 1: Build static distribution using Node 20 Alpine
# FROM node:20-alpine AS builder

# WORKDIR /app

# # Accept environment build arguments for Vite compilation
# ARG VITE_API_BASE_URL=http://localhost:8000/api/
# ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# # Copy package manifests & install dependencies
# COPY package.json package-lock.json ./
# RUN npm ci

# # Copy application source files and compile static production build
# COPY . .
# RUN npm run build

# # Stage 2: Serve static production assets using Nginx Alpine
# FROM nginx:alpine AS runner

# # Remove default Nginx HTML static files
# RUN rm -rf /usr/share/nginx/html/*

# # Copy static assets from builder stage
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy custom production Nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Expose HTTP port 80
# EXPOSE 80

# # Start Nginx in foreground
# CMD ["nginx", "-g", "daemon off;"]
# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite bundle (uses relative /api routes)
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 