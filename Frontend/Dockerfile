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

# Copy built frontend assets to Nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Install gettext for envsubst
RUN apk add --no-cache gettext

# ✅ Provide default API_URL here (safe fallback)
ENV API_URL=http://backend:8000

EXPOSE 3000

# ✅ Substitute and validate config before starting Nginx
CMD sh -c 'envsubst "$$API_URL" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && \
           nginx -t && \
           nginx -g "daemon off;"'
