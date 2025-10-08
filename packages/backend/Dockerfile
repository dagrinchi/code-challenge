FROM node:14-alpine

WORKDIR /app

COPY packages/backend/package*.json ./

RUN npm ci --only=production

COPY packages/backend/ ./

RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001 -G nodejs

RUN chown -R backend:nodejs /app
USER backend

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["npm", "start"]