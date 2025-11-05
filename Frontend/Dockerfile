# Build stage
FROM node:20-slim as build

# Set working directory
WORKDIR /app

# Build-time API base (defaults to Nginx proxy path)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies (skip audits/funding prompts for speed)
RUN npm install --no-audit --no-fund

# Copy all source code
COPY . .

# Build the production-ready app
RUN npm run build

# --------------------------
# Production stage
# --------------------------
FROM nginx:alpine

# Copy built frontend assets to Nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Install gettext (provides envsubst for dynamic config replacement)
RUN apk add --no-cache gettext

# Set default API URL (used for local Docker Compose)
ENV API_URL=http://backend:8000

# Expose port 3000 for both local and Render deployments
EXPOSE 3000

# Generate Nginx config dynamically from environment variables at runtime
CMD sh -c "envsubst '\$API_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && \
           nginx -t && \
           nginx -g 'daemon off;'"
