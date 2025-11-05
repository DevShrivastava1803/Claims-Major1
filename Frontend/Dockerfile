# Build stage
FROM node:20-slim as build

# Set working directory
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

# Copy Nginx template (contains ${API_URL})
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Install envsubst (gettext)
RUN apk add --no-cache gettext

# Safe local fallback
ENV API_URL=http://backend:8000
ENV PORT=3000

EXPOSE 3000

# Substitute only ${API_URL} and ${PORT} (leave Nginx $vars intact), validate config, then start nginx
CMD sh -c '\
  if [ -z "$API_URL" ]; then \
    echo "⚠️  API_URL not set, defaulting to http://backend:8000"; \
    export API_URL=http://backend:8000; \
  fi; \
  if [ -z "$PORT" ]; then \
    echo "🔧 PORT not set, defaulting to 3000"; \
    export PORT=3000; \
  fi; \
  echo "✅ Using API_URL=$API_URL"; \
  echo "✅ Using PORT=$PORT"; \
  # Replace only ${API_URL} and ${PORT} in the template and leave Nginx $variables intact \
  envsubst '\''${API_URL} ${PORT}'\'' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf; \
  echo "------ Rendered NGINX config ------"; \
  cat /etc/nginx/conf.d/default.conf; \
  echo "-----------------------------------"; \
  nginx -t && exec nginx -g "daemon off;"'
