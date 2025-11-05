# Build stage
FROM node:20-slim as build

WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# --------------------------
# Production stage
# --------------------------
FROM nginx:alpine

# Copy built frontend assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Install envsubst
RUN apk add --no-cache gettext

# Set a safe default API URL for local / missing env vars
ENV API_URL=http://backend:8000

EXPOSE 3000

# Substitute env vars, ensure valid URL, and start nginx
CMD sh -c ' \
  if [ -z "$API_URL" ]; then \
    echo "API_URL not set, defaulting to http://backend:8000"; \
    export API_URL=http://backend:8000; \
  fi; \
  echo "Using API_URL=$API_URL"; \
  envsubst "$$API_URL" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf; \
  nginx -t && nginx -g "daemon off;"'
