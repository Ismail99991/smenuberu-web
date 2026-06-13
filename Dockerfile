FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl
RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

COPY . .

# 🔥 ВАЖНО: берем зависимости из deps
COPY --from=deps /app/node_modules ./node_modules

RUN pnpm build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 🔥 ВАЖНО: runtime тоже нужен next
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]