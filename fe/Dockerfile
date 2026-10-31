# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# No VITE_API_BASE_URL set on purpose — the app calls relative /api/...
# paths, which this image's own nginx (docker/nginx.conf) proxies to the
# backend container.
RUN npm run build

# --- serve stage ---
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.inc /etc/nginx/security-headers.inc
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
