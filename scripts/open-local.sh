#!/usr/bin/env bash
# Start backend container (if not running) and open the frontend dev server.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! docker compose ps --status running --services 2>/dev/null | grep -qx web; then
  echo "Starting backend container..."
  docker compose up -d --force-recreate
fi

cd frontend
npm run dev:open
