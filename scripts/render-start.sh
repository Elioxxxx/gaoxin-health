#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV="${NODE_ENV:-production}"
export DATABASE_URL="${DATABASE_URL:-file:./dev.db}"

if [[ "${DATABASE_URL}" == file:* ]]; then
  db_path="${DATABASE_URL#file:}"
  mkdir -p "$(dirname "${db_path}")"
fi

RUST_LOG=info pnpm exec prisma migrate deploy

if [[ "${FORCE_SEED_DATABASE:-false}" == "true" ]]; then
  pnpm db:seed
elif ! pnpm exec tsx scripts/database-has-data.ts; then
  pnpm db:seed
fi

pnpm start
