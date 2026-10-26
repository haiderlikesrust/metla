# syntax=docker/dockerfile:1
# Build once, then serve the static SPA with Nginx. Dokploy Application updates use
# Swarm start-first so the replacement becomes healthy before the old container stops.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
ENV NODE_ENV=production
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/start.sh /opt/launchpad/start.sh
COPY --from=build /app/dist /opt/launchpad/dist
USER root
RUN chmod 0755 /opt/launchpad/start.sh \
 && mkdir -p /usr/share/nginx/html/assets \
 && chown -R 101:101 /usr/share/nginx/html /opt/launchpad
USER 101
EXPOSE 8080
# Nginx finishes in-flight static responses before exiting when Swarm replaces a task.
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/healthz"]
CMD ["/opt/launchpad/start.sh"]
