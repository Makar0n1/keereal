#!/bin/sh
set -e

echo "→ Applying database migrations..."
# Run the real CLI entry (its .wasm files sit next to it). Don't use the
# .bin/prisma symlink — Docker COPY dereferences it into a plain file, breaking
# the relative path to prisma_schema_build_bg.wasm.
node node_modules/prisma/build/index.js migrate deploy

if [ "${RUN_SEED}" = "true" ]; then
  echo "→ Seeding database..."
  node_modules/tsx/dist/cli.mjs prisma/seed.ts || echo "seed skipped/failed"
fi

echo "→ Starting Next.js..."
exec "$@"
