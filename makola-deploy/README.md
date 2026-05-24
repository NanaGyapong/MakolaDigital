# 🚀 Makola Digital — Deployment Guide

Production-ready Docker deployment for the Makola Digital marketplace.

---

## Prerequisites

- Ubuntu 22.04 LTS server (minimum 2 vCPU, 4GB RAM)
- Docker 24+ and Docker Compose v2
- Domain pointing to server IP (A records for `@`, `www`, `api`)
- SSH access to the server

---

## Quick start (local dev)

```bash
# 1. Clone and enter the project
git clone https://github.com/yourname/makola-digital
cd makola-digital

# 2. Set up dev environment
cp deploy/.env.dev .env.dev
docker compose -f docker-compose.dev.yml up -d

# 3. Run DB migrations
docker compose -f docker-compose.dev.yml exec api node scripts/migrate.js

# App is live at:
#   Frontend → http://localhost:3000
#   API      → http://localhost:4000
#   DB       → localhost:5432
```

---

## Production deployment (first time)

### 1. Provision server

```bash
# Install Docker on Ubuntu 22.04
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version   # should print v2.x
```

### 2. Set up project on server

```bash
sudo mkdir -p /opt/makola-deploy
sudo chown $USER:$USER /opt/makola-deploy
cd /opt/makola-deploy

git clone https://github.com/yourname/makola-digital .
cp deploy/.env.example .env
nano .env   # Fill in all values
```

### 3. Get SSL certificates

```bash
# Point DNS first, then:
chmod +x scripts/ssl-setup.sh
./scripts/ssl-setup.sh hello@makoladigital.com
```

### 4. Deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## Daily operations

```bash
# View logs
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f postgres

# Restart a service
docker compose restart api

# Scale API (if on Swarm/multiple nodes)
docker compose up -d --scale api=3

# Run migrations only
docker compose exec api node scripts/migrate.js

# Open DB shell
docker compose exec postgres psql -U makola -d makola_db

# Open Redis shell
docker compose exec redis redis-cli -a $REDIS_PASSWORD

# Manual backup
./scripts/backup.sh

# Update to latest
git pull && ./scripts/deploy.sh
```

---

## GitHub Actions CI/CD

Add these secrets to your repo (Settings → Secrets):

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Your server IP or hostname |
| `SERVER_USER` | SSH username (e.g. `ubuntu`) |
| `SERVER_SSH_KEY` | Private SSH key (full contents) |
| `NEXT_PUBLIC_API_URL` | `https://api.makoladigital.com/api/v1` |

Push to `main` → tests run → images build → auto-deploys to server.

---

## Infrastructure on a budget (Ghana/Africa focus)

| Option | Cost | Notes |
|--------|------|-------|
| **DigitalOcean Droplet** | ~$24/mo | 2vCPU 4GB — easiest to start |
| **Hetzner CX22** | ~$6/mo | Best value in EU, low latency to Africa |
| **AWS EC2 t3.medium** | ~$30/mo | Cape Town region (af-south-1) for Africa |
| **Railway** | $5–20/mo | Easiest — no Docker needed, just push code |
| **Render** | Free–$25/mo | Good free tier for early stage |

**Recommended for MVP:** Hetzner Nuremberg (€4.51/mo) + Cloudflare CDN (free) + Cloudinary (free tier).

---

## Monitoring

```bash
# Start monitoring stack (Prometheus + Grafana)
docker compose -f monitoring/docker-compose.monitoring.yml up -d

# Access Grafana at http://your-server:3001
# Default login: admin / (set GRAFANA_PASSWORD in .env)
```

---

## Backup schedule (add to crontab)

```bash
crontab -e
# Add:
0 2 * * * /opt/makola-deploy/scripts/backup.sh >> /var/log/makola-backup.log 2>&1
```

---

## Architecture

```
Internet → Cloudflare CDN → Nginx (443/80)
                                ├── makoladigital.com  → Next.js :3000
                                └── api.makoladigital.com → Express :4000
                                                               ├── PostgreSQL + PostGIS :5432
                                                               ├── Redis :6379
                                                               └── Cloudinary (images)
```
