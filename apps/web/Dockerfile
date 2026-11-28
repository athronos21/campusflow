# Multi-stage Dockerfile for Next.js Web Application
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9.1.0

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/config/package.json ./packages/config/
COPY apps/web/package.json ./apps/web/
COPY prisma ./prisma/

RUN pnpm install

COPY packages/contracts ./packages/contracts
COPY packages/design-system ./packages/design-system
COPY packages/config ./packages/config
COPY apps/web ./apps/web

RUN pnpm db:generate
RUN pnpm --filter @campusflow/contracts build
RUN pnpm --filter @campusflow/web build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN npm install -g pnpm@9.1.0

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY prisma ./prisma/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs

EXPOSE 3000

CMD ["pnpm", "--filter", "@campusflow/web", "start"]
