# =========================
# 1. DEPENDENCIES
# =========================
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile


# =========================
# 2. BUILD
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build


# =========================
# 3. RUNTIME (PRODUCTION)
# =========================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# копируем билд Next.js
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# ⚠️ КЛЮЧЕВОЕ: убираем любые override entrypoint'ы
ENTRYPOINT []

USER nextjs

EXPOSE 3000

# =========================
# START (ВАЖНО)
# =========================
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]