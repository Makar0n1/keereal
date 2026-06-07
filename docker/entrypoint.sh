#!/bin/sh
set -e

echo "→ Applying database migrations..."
node_modules/.bin/prisma migrate deploy

if [ "${RUN_SEED}" = "true" ]; then
  echo "→ Seeding database..."
  node_modules/tsx/dist/cli.mjs prisma/seed.ts || echo "seed skipped/failed"
fi

echo "→ Starting Next.js..."
exec "$@"
