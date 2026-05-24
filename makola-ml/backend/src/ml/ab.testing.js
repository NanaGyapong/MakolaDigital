// ml/ab.testing.js
// A/B testing framework for recommendation strategies
// Deterministic bucketing via user ID hash

import { createHash } from "crypto";
import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

// ── Active experiments ────────────────────────────────────────
const EXPERIMENTS = {
  "rec_strategy_v1": {
    id: "rec_strategy_v1",
    name: "Recommendation strategy test",
    description: "Collaborative vs hybrid vs trending-only",
    active: true,
    startDate: "2026-04-01",
    variants: [
      { id: "control",       weight: 0.34, strategy: "collaborative",  label: "Collaborative filtering" },
      { id: "hybrid",        weight: 0.33, strategy: "hybrid",         label: "Hybrid blend" },
      { id: "trending_only", weight: 0.33, strategy: "trending",       label: "Trending-only (fast)" },
    ],
    metrics: ["click_through_rate", "add_to_wishlist_rate", "purchase_rate"],
  },
  "rec_position_v1": {
    id: "rec_position_v1",
    name: "Recommendation placement test",
    description: "Where to show recs on home feed",
    active: true,
    variants: [
      { id: "above_fold",  weight: 0.50, position: "above", label: "Above listings" },
      { id: "below_fold",  weight: 0.50, position: "below", label: "Below listings" },
    ],
    metrics: ["scroll_depth", "rec_click_rate"],
  },
};

// ── Deterministic bucket assignment ───────────────────────────
export function getUserVariant(userId, experimentId) {
  const exp = EXPERIMENTS[experimentId];
  if (!exp || !exp.active) return null;

  // Hash user ID + experiment ID for deterministic, stable bucketing
  const hash = createHash("md5").update(`${userId}:${experimentId}`).digest("hex");
  const bucket = parseInt(hash.slice(0, 8), 16) / 0xFFFFFFFF; // 0.0 – 1.0

  let cumulative = 0;
  for (const variant of exp.variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) return variant;
  }
  return exp.variants[exp.variants.length - 1];
}

// ── Track impression ──────────────────────────────────────────
export async function trackImpression(userId, experimentId, variantId, metadata = {}) {
  await db.query(
    `INSERT INTO ab_events (id, user_id, experiment_id, variant_id, event_type, metadata, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, 'impression', $4, NOW())`,
    [userId, experimentId, variantId, JSON.stringify(metadata)]
  ).catch(() => {});
}

// ── Track conversion ──────────────────────────────────────────
export async function trackConversion(userId, experimentId, eventType, metadata = {}) {
  // Look up user's variant
  const variant = getUserVariant(userId, experimentId);
  if (!variant) return;

  await db.query(
    `INSERT INTO ab_events (id, user_id, experiment_id, variant_id, event_type, metadata, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
    [userId, experimentId, variant.id, eventType, JSON.stringify(metadata)]
  ).catch(() => {});
}

// ── Get experiment results (admin) ────────────────────────────
export async function getExperimentResults(experimentId) {
  const result = await db.query(
    `SELECT
       variant_id,
       COUNT(*) FILTER (WHERE event_type='impression') AS impressions,
       COUNT(*) FILTER (WHERE event_type='click')      AS clicks,
       COUNT(*) FILTER (WHERE event_type='wishlist')   AS wishlists,
       COUNT(*) FILTER (WHERE event_type='purchase')   AS purchases,
       -- Conversion rates
       CASE WHEN COUNT(*) FILTER (WHERE event_type='impression') > 0
         THEN (COUNT(*) FILTER (WHERE event_type='click')::float /
               COUNT(*) FILTER (WHERE event_type='impression') * 100)
         ELSE 0 END AS ctr,
       CASE WHEN COUNT(*) FILTER (WHERE event_type='impression') > 0
         THEN (COUNT(*) FILTER (WHERE event_type='purchase')::float /
               COUNT(*) FILTER (WHERE event_type='impression') * 100)
         ELSE 0 END AS purchase_rate
     FROM ab_events
     WHERE experiment_id = $1 AND created_at > NOW() - INTERVAL '30 days'
     GROUP BY variant_id
     ORDER BY ctr DESC`,
    [experimentId]
  );

  const exp = EXPERIMENTS[experimentId];
  return {
    experiment: exp,
    results: result.rows,
    winner: result.rows[0]?.variant_id,
  };
}

export { EXPERIMENTS };
