#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

DATABASE_URL="postgres://app:app@localhost:5432/app"
TEST_DATABASE_URL="postgres://app:app@localhost:5432/app_test"
LOG_FILE="/tmp/dev-foundation-app.log"
MODE="${1:-full}"

log() {
  echo "[cloud-setup] $*" >&2
}

as_postgres() {
  if [ "$(id -u)" = "0" ]; then
    su postgres -c "$1"
  else
    sudo -u postgres sh -c "$1"
  fi
}

install_postgres() {
  if ls /usr/lib/postgresql/*/bin/pg_ctl >/dev/null 2>&1; then
    return
  fi
  log "Installing PostgreSQL"
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql >/dev/null
}

install_dependencies() {
  local hashes=node_modules/.cloud-setup.sha256
  if sha256sum --check --status "$hashes" 2>/dev/null; then
    return
  fi
  rm -f "$hashes"
  log "Installing npm dependencies"
  npm install --no-audit --no-fund --loglevel=error
  sha256sum scripts/cloud-setup.sh package.json package-lock.json > "$hashes"
}

write_environment() {
  local exports
  exports=$(cat <<EOF
export DATABASE_URL="$DATABASE_URL"
export TEST_DATABASE_URL="$TEST_DATABASE_URL"
export DEV_FOUNDATION_CLOUD=true
EOF
)
  if [ -n "${HTTPS_PROXY:-}${https_proxy:-}" ]; then
    exports="$exports
export NODE_USE_ENV_PROXY=1
export NODE_OPTIONS=\"\${NODE_OPTIONS:-} --disable-warning=UNDICI-EHPA\""
  fi
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "$exports" >> "$CLAUDE_ENV_FILE"
  fi
  if [ -w /etc/profile.d ]; then
    echo "$exports" > /etc/profile.d/dev-foundation.sh
  fi
  if ! grep -q "dev-foundation-cloud" "$HOME/.bashrc" 2>/dev/null; then
    printf '\n# dev-foundation-cloud\n%s\n' "$exports" >> "$HOME/.bashrc"
  fi
  eval "$exports"
}

start_postgres() {
  if ! pg_isready -q -h localhost 2>/dev/null; then
    log "Starting PostgreSQL"
    service postgresql start >/dev/null
    for _ in $(seq 1 30); do
      pg_isready -q -h localhost && break
      sleep 1
    done
  fi
  as_postgres "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname = 'app'\"" | grep -q 1 \
    || as_postgres "psql -qc \"CREATE ROLE app LOGIN SUPERUSER PASSWORD 'app'\""
  as_postgres "psql -tAc \"SELECT 1 FROM pg_database WHERE datname = 'app'\"" | grep -q 1 \
    || as_postgres "createdb -O app app"
}

app_is_healthy() {
  curl -sf http://localhost:3000/api/health 2>/dev/null | grep -q '"database":"ok"'
}

start_app() {
  if app_is_healthy; then
    return
  fi
  log "Starting the app on http://localhost:3000 (log: $LOG_FILE)"
  nohup npm run dev -- --hostname 0.0.0.0 > "$LOG_FILE" 2>&1 &
  for _ in $(seq 1 90); do
    app_is_healthy && return
    sleep 1
  done
  log "The app did not answer in time; see $LOG_FILE"
}

install_postgres
install_dependencies
if [ "$MODE" = "--install-only" ]; then
  exit 0
fi
write_environment
start_postgres
npm run --silent db:migrate >&2
start_app
log "Ready: app on http://localhost:3000, database at localhost:5432"
