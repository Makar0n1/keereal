#!/bin/sh
set -e

echo "→ Applying database migrations..."
node node_modules/prisma/build/index.js migrate deploy

if [ "${RUN_SEED}" = "true" ]; then
  echo "→ Seeding database..."
  node node_modules/tsx/dist/cli.mjs prisma/seed.ts || echo "seed skipped/failed"
fi

echo "✓ Migrations applied."
