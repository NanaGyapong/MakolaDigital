// Add to src/routes/health.routes.js
import { Router } from "express";
import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

const router = Router();

// GET /health — used by Docker, Nginx, load balancers
router.get("/health", async (req, res) => {
  const start = Date.now();
  const checks = {};

  // Check DB
  try {
    await db.query("SELECT 1");
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  const allOk = Object.values(checks).every(v => v === "ok");
  const latency = Date.now() - start;

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    uptime: process.uptime(),
    latency_ms: latency,
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.npm_package_version || "1.0.0",
  });
});

export default router;
