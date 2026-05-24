#!/bin/bash
# ============================================================
# Makola Digital — SSL Certificate Setup (Let's Encrypt)
# Run once after pointing DNS to your server
# Usage: ./scripts/ssl-setup.sh youremail@example.com
# ============================================================
set -euo pipefail

EMAIL=${1:-"hello@makoladigital.com"}
DOMAIN="makoladigital.com"

echo "Setting up SSL for $DOMAIN..."

# 1. Start nginx with HTTP only config first
docker compose up -d nginx

# 2. Obtain certificates
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  -d "api.$DOMAIN"

# 3. Reload nginx with SSL config
docker compose exec nginx nginx -s reload

echo "✓ SSL certificates obtained and nginx reloaded"
echo "  Certificates auto-renew every 12h via certbot container"
