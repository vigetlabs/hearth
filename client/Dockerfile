# syntax=docker/dockerfile:1

# Build the static SPA bundle.
FROM node:24-slim AS build
WORKDIR /app

# VITE_API_URL is baked into the bundle at build time, so the image is
# environment-specific. CI passes the right value per environment.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_CABLE_URL
ENV VITE_CABLE_URL=$VITE_CABLE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve the bundle with Caddy, with SPA history-fallback routing.
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
