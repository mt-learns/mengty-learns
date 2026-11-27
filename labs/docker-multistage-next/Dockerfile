# syntax=docker/dockerfile:1

FROM node:22-alpine3.21 AS deps
WORKDIR /app

# Copy manifest first so dependency layers stay cached when source files change.
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && mkdir -p node_modules

FROM node:22-alpine3.21 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs

COPY --from=deps --chown=nextjs:nodejs /app/package.json ./
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs server.mjs ./

USER 1001:1001
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["node", "server.mjs"]
