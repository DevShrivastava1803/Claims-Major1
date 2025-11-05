# Build stage
FROM node:20-slim as build

WORKDIR /app

# Build-time API base (defaults to Nginx proxy path)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy package files
COPY package*.json ./

# Install dependencies (resolve cross-platform binaries on Linux)
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build the application with the provided API base
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

