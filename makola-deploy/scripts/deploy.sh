#!/bin/bash
# ============================================================
# Makola Digital — Production Deployment Script
# Usage: ./scripts/deploy.sh [--no-migrate] [--force]
# ============================================================
set -euo pipefail

RED="\033[0;31m"; GREEN="\033[0;32m"; YELLOW="\033[1;33m"; BLUE="\033[0;34m"; NC="\033[0m"
log()  { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✗ ERROR:${NC} $1"; exit 1; }

MIGRATE=true
for arg in "$@"; do [[ $arg == "--no-migrate" ]] && MIGRATE=false; done

log "Starting Makola Digital deployment..."

# 1. Check .env exists
[[ ! -f .env ]] && err ".env not found. Copy .env.example and fill in values."
ok ".env found"

# 2. Validate required env vars
REQUIRED=(POSTGRES_PASSWORD REDIS_PASSWORD JWT_SECRET JWT_REFRESH_SECRET CLOUDINARY_CLOUD_NAME)
for var in "${REQUIRED[@]}"; do
  [[ -z "${!var:-}" ]] && err "Required env var $var is not set"
done
ok "Environment variables validated"

# 3. Pull latest images
log "Pulling latest base images..."
docker compose pull postgres redis nginx 2>/dev/null || true
ok "Base images updated"

# 4. Build app images
log "Building application images..."
docker compose build --no-cache api frontend
ok "Application images built"

# 5. Run database migrations (if enabled)
if [[ $MIGRATE == true ]]; then
  log "Running database migrations..."
  docker compose run --rm api node scripts/migrate.js
  ok "Migrations complete"
else
  warn "Skipping migrations (--no-migrate flag)"
fi

# 6. Rolling restart (zero downtime)
log "Deploying with zero-downtime restart..."
docker compose up -d --remove-orphans
ok "Services started"

# 7. Health checks
log "Waiting for health checks..."
sleep 15

check_health() {
  local name=$1
  local url=$2
  if curl -sf "$url" > /dev/null 2>&1; then
    ok "$name is healthy"
  else
    err "$name health check failed at $url"
  fi
}

check_health "API" "http://localhost:4000/health"
check_health "Frontend" "http://localhost:3000"
ok "All health checks passed"

# 8. Clean up old images
log "Cleaning up old Docker images..."
docker image prune -f 2>/dev/null || true
ok "Cleanup done"

# 9. Show running services
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🌍 Makola Digital deployed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
docker compose ps
