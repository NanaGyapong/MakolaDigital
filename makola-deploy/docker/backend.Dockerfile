# ============================================================
# Makola Digital — Backend API Dockerfile
# Multi-stage: builder → development → production
# ============================================================

# ── STAGE 1: base ─────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl dumb-init
COPY package*.json ./

# ── STAGE 2: deps ─────────────────────────────────────────────
FROM base AS deps
RUN npm ci --only=production && cp -R node_modules /prod_node_modules
RUN npm ci

# ── STAGE 3: development ──────────────────────────────────────
FROM deps AS development
COPY . .
ENV NODE_ENV=development
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ── STAGE 4: production ───────────────────────────────────────
FROM base AS production
COPY --from=deps /prod_node_modules ./node_modules
COPY . .
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S apiuser -u 1001
RUN chown -R apiuser:nodejs /app
USER apiuser

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Use dumb-init to handle PID 1 properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]
