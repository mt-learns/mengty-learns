# syntax=docker/dockerfile:1

FROM node:22-alpine3.21 AS deps
WORKDIR /app

# Copy manifest first so dependency layers stay cached when source files change.
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

FROM node:22-alpine3.21 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs

COPY --from=deps --chown=nextjs:nodejs /app/package.json ./
COPY --chown=nextjs:nodejs server.mjs ./

USER nextjs
EXPOSE 3000

CMD ["node", "server.mjs"]
