import { Router } from "express";
import { db } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Auto-create table on first use
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('search', 'view')),
      value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id, created_at DESC)`);
  tableReady = true;
}

// POST /api/v1/activity — log a search or listing view (requires auth)
router.post("/", authenticate, async (req, res) => {
  try {
    await ensureTable();
    const { type, value } = req.body;
    if (!type || !value) return res.status(400).json({ message: "type and value required" });
    if (!["search", "view"].includes(type)) return res.status(400).json({ message: "type must be search or view" });
    const clean = String(value).slice(0, 200).trim();
    if (!clean) return res.status(400).json({ message: "value is empty" });

    // Avoid flooding — dedupe same user+type+value within last 30 mins
    const recent = await db.query(
      `SELECT id FROM user_activity WHERE user_id=$1 AND type=$2 AND value=$3 AND created_at > NOW() - INTERVAL '30 minutes' LIMIT 1`,
      [req.user.id, type, clean]
    );
    if (recent.rows.length === 0) {
      await db.query(
        `INSERT INTO user_activity (user_id, type, value) VALUES ($1, $2, $3)`,
        [req.user.id, type, clean]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("activity error:", err.message);
    res.json({ ok: false }); // silent fail — never break the user's flow
  }
});

// GET /api/v1/activity/top — get top interests for a user (used by email job)
router.get("/top/:userId", async (req, res) => {
  try {
    await ensureTable();
    const result = await db.query(
      `SELECT value, type, COUNT(*) as score
       FROM user_activity
       WHERE user_id=$1 AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY value, type
       ORDER BY score DESC
       LIMIT 10`,
      [req.params.userId]
    );
    res.json({ interests: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
