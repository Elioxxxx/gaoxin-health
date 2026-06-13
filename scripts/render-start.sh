#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV="${NODE_ENV:-production}"

resolve_sqlite_url() {
  local url="${1:-file:./dev.db}"

  if [[ "${url}" != file:* ]]; then
    printf '%s\n' "${url}"
    return
  fi

  local db_path="${url#file:}"

  if [[ "${db_path}" == /* ]]; then
    printf '%s\n' "${url}"
    return
  fi

  local db_dir
  local db_file
  db_dir="$(dirname "${db_path}")"
  db_file="$(basename "${db_path}")"
  mkdir -p "${PWD}/${db_dir}"
  db_dir="$(cd "${PWD}/${db_dir}" && pwd)"
  printf 'file:%s/%s\n' "${db_dir}" "${db_file}"
}

export DATABASE_URL="$(resolve_sqlite_url "${DATABASE_URL:-file:./dev.db}")"

if [[ "${DATABASE_URL}" == file:* ]]; then
  db_path="${DATABASE_URL#file:}"
  mkdir -p "$(dirname "${db_path}")"
  echo "Using SQLite database at ${db_path}"
fi

RUST_LOG=info pnpm exec prisma migrate deploy

if [[ "${FORCE_SEED_DATABASE:-false}" == "true" ]]; then
  pnpm db:seed
elif ! pnpm exec tsx scripts/database-has-data.ts; then
  pnpm db:seed
fi

pnpm start
