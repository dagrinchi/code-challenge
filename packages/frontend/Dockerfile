FROM node:16-alpine AS builder

WORKDIR /app

COPY packages/frontend/package*.json ./

RUN npm ci

COPY packages/frontend/ ./

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup -g 1001 -S nginx_group
RUN adduser -S frontend -u 1001 -G nginx_group

RUN chown -R frontend:nginx_group /usr/share/nginx/html
RUN chown -R frontend:nginx_group /var/cache/nginx
RUN chown -R frontend:nginx_group /var/log/nginx
RUN chown -R frontend:nginx_group /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R frontend:nginx_group /var/run/nginx.pid

USER frontend

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]