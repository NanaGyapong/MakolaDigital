#!/bin/bash
# ============================================================
# Makola Digital — Database Backup Script
# Schedule with: crontab -e
# 0 2 * * * /path/to/makola-deploy/scripts/backup.sh
# ============================================================
set -euo pipefail

BACKUP_DIR="/backups/makola"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Load env
source "$(dirname "$0")/../.env"

echo "[$(date)] Starting backup..."

# 1. Dump PostgreSQL
docker compose exec -T postgres pg_dump \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --format=custom \
  --compress=9 > "$BACKUP_DIR/db_$DATE.dump"

echo "✓ Database dump: db_$DATE.dump ($(du -sh "$BACKUP_DIR/db_$DATE.dump" | cut -f1))"

# 2. Compress uploads volume
docker run --rm \
  -v makola_uploads_data:/uploads:ro \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf "/backup/uploads_$DATE.tar.gz" /uploads

echo "✓ Uploads archived: uploads_$DATE.tar.gz"

# 3. Clean up old backups
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "✓ Old backups cleaned (>${RETENTION_DAYS} days)"

# 4. Optional: Upload to S3
# aws s3 cp "$BACKUP_DIR/db_$DATE.dump" "s3://makola-backups/db/"

echo "[$(date)] Backup complete."
