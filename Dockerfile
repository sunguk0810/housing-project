# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# ── Stage 2: Build ──
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Dummy env vars for Next.js build — actual values injected at runtime via .env.production
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV REDIS_URL="redis://localhost:6379"
# NEXT_PUBLIC_* must be present at build time to be embedded in the bundle
ARG NEXT_PUBLIC_KAKAO_APP_KEY=""
ENV NEXT_PUBLIC_KAKAO_APP_KEY=${NEXT_PUBLIC_KAKAO_APP_KEY}
RUN pnpm run build

# ── Stage 3: Runtime ──
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy standalone output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Drizzle migrations (for runtime migrate)
COPY --from=build /app/drizzle ./drizzle

EXPOSE 3000

CMD ["node", "server.js"]
