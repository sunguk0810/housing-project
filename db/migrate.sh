#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/schema.sql"
COMPOSE_FILE="$PROJECT_ROOT/compose.yml"
ENV_FILE="$PROJECT_ROOT/.env"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is required." >&2
  exit 1
fi

if [ ! -f "$SCHEMA_FILE" ]; then
  echo "Error: schema file not found at $SCHEMA_FILE" >&2
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Error: compose file not found at $COMPOSE_FILE" >&2
  exit 1
fi

POSTGRES_USER="${POSTGRES_USER:-}"
POSTGRES_DB="${POSTGRES_DB:-}"

if [ -f "$ENV_FILE" ]; then
  if [ -z "$POSTGRES_USER" ]; then
    POSTGRES_USER="$(grep -E '^POSTGRES_USER=' "$ENV_FILE" | tail -n 1 | cut -d '=' -f2- || true)"
  fi
  if [ -z "$POSTGRES_DB" ]; then
    POSTGRES_DB="$(grep -E '^POSTGRES_DB=' "$ENV_FILE" | tail -n 1 | cut -d '=' -f2- || true)"
  fi
fi

POSTGRES_USER="${POSTGRES_USER:-housing}"
POSTGRES_DB="${POSTGRES_DB:-housing}"

RUNNING_SERVICES="$(docker compose -f "$COMPOSE_FILE" ps --status running --services 2>/dev/null || true)"
if ! printf '%s\n' "$RUNNING_SERVICES" | grep -qx 'postgres'; then
  echo "Error: postgres service is not running." >&2
  echo "Run: docker compose up -d" >&2
  exit 1
fi

# schema.sql intentionally uses plain CREATE TABLE for strict S2 parity.
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -f - < "$SCHEMA_FILE"

echo "Schema migration completed." 
