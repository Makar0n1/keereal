#!/bin/sh
set -e

# Migrations + seed run in the dedicated `migrate` service (it has the full
# node_modules the Prisma CLI needs). The app just starts.
echo "→ Starting Next.js..."
exec "$@"
