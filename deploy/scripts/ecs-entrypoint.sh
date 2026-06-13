#!/bin/sh
set -eu

DB_PATH="${SQLITE_DB_PATH:-/app/data/gaoxin-health.db}"
SEED_ON_START="${SEED_ON_START:-false}"

mkdir -p "$(dirname "$DB_PATH")"

needs_seed="false"
if [ "$SEED_ON_START" = "true" ] || [ ! -s "$DB_PATH" ]; then
  needs_seed="true"
fi

echo "Preparing database at $DB_PATH"
pnpm db:generate
pnpm db:deploy

if [ "$needs_seed" = "true" ]; then
  echo "Seeding demo data"
  pnpm db:seed
else
  echo "Skipping seed because database already exists. Set SEED_ON_START=true to reset demo data."
fi

exec pnpm start:ecs
