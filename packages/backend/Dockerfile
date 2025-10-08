FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

RUN npm ci --only=production

COPY packages/backend/ ./packages/backend/

RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
USER backend

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 3001, path: '/health', timeout: 2000 }; \
    const request = http.request(options, (res) => { \
      console.log(\`STATUS: \${res.statusCode}\`); \
      process.exitCode = (res.statusCode === 200) ? 0 : 1; \
    }); \
    request.on('error', function(err) { \
      console.log('ERROR'); \
      process.exitCode = 1; \
    }); \
    request.end();"

CMD ["node", "packages/backend/src/index.js"]