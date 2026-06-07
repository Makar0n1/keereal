# --- deps ---
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# --- builder ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# NEXT_PUBLIC_* are inlined at build time -> pass the real site URL so canonical
# links / sitemap / OG images point to the production domain, not localhost.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

# --- migrator (full node_modules to run prisma migrate/seed at deploy) ---
# The Prisma CLI has transitive deps (@prisma/config -> effect, tsx -> esbuild,
# ...) that the slim standalone runner doesn't carry. So migrations + seed run
# in this stage (deployed as a one-shot `migrate` compose service), not in app.
FROM node:22-bookworm-slim AS migrator
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY scripts ./scripts
COPY package.json ./
COPY docker/migrate.sh ./migrate.sh
RUN chmod +x ./migrate.sh
ENTRYPOINT ["./migrate.sh"]

# --- runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma client engine for the app's runtime queries (the standalone trace
# doesn't reliably include it). Migrations run in the `migrate` service, so the
# CLI/tsx are NOT needed here.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
