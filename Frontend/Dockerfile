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

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx template config (with ${API_URL})
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Install envsubst for runtime variable replacement
RUN apk add --no-cache gettext

# Expose port
EXPOSE 3000

# Default to local backend; Render will override this
ENV API_URL=http://backend:8000

# Substitute environment variable in nginx.conf at runtime
CMD sh -c "envsubst '\$API_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
