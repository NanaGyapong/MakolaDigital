// ml/abtest.js
// Simple A/B test framework for recommendation experiments

import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

export const EXPERIMENTS = {
  "rec_algo_v2": {
    id: "rec_algo_v2",
    description: "CF vs Hybrid recommendations on home feed",
    variants: { control: "collaborative_only", treatment: "hybrid_v2" },
    traffic: 0.5, // 50% of users in experiment
    startDate: new Date("2025-01-01"),
    metrics: ["ctr", "saves", "purchases", "session_depth"],
  },
  "rec_position": {
    id: "rec_position",
    description: "Recommendations above vs below recent listings",
    variants: { control: "below", treatment: "above" },
    traffic: 0.3,
    metrics: ["ctr", "scroll_depth"],
  },
};

// Assign user to variant (deterministic via hash — same user always same variant)
export function assignVariant(userId, experimentId) {
  const exp = EXPERIMENTS[experimentId];
  if (!exp) return null;

  // Deterministic hash: user always in same bucket
  let hash = 0;
  const str = `${userId}-${experimentId}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const bucket = Math.abs(hash) % 100;

  if (bucket >= exp.traffic * 100) return null; // Not in experiment
  return bucket < (exp.traffic * 100 / 2) ? "control" : "treatment";
}

// Track experiment event
export async function trackEvent(userId, experimentId, event, value = 1) {
  const variant = assignVariant(userId, experimentId);
  if (!variant) return;

  await db.query(
    `INSERT INTO ab_events (id, user_id, experiment_id, variant, event, value, created_at)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,NOW())`,
    [userId, experimentId, variant, event, value]
  ).catch(() => {});
}

// Get experiment results (for admin dashboard)
export async function getResults(experimentId) {
  const r = await db.query(
    `SELECT
       variant,
       event,
       COUNT(DISTINCT user_id) AS unique_users,
       SUM(value) AS total_value,
       AVG(value) AS avg_value,
       COUNT(*) AS event_count
     FROM ab_events
     WHERE experiment_id=$1
       AND created_at >= (SELECT start_date FROM experiments WHERE id=$1)
     GROUP BY variant, event
     ORDER BY variant, event`,
    [experimentId]
  );

  const exp = EXPERIMENTS[experimentId];
  const data = r.rows;

  // Calculate lift
  const controlCTR = data.find(d => d.variant==="control" && d.event==="ctr");
  const treatCTR   = data.find(d => d.variant==="treatment" && d.event==="ctr");
  const lift = controlCTR && treatCTR
    ? ((treatCTR.avg_value - controlCTR.avg_value) / controlCTR.avg_value * 100).toFixed(2)
    : null;

  return { experiment: exp, results: data, lift };
}
