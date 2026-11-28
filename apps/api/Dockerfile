# Multi-stage Dockerfile for NestJS API
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@12.21.0

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/
COPY prisma ./prisma/

RUN pnpm install

COPY packages/contracts ./packages/contracts
COPY packages/design-system ./packages/design-system
COPY packages/config ./packages/config
COPY apps/api ./apps/api

RUN pnpm db:generate
RUN pnpm --filter @campusflow/contracts build
RUN pnpm --filter @campusflow/api build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN npm install -g pnpm@12.21.0

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY prisma ./prisma/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
