// ml/batch.js
// Nightly batch job: pre-compute item-item similarities
// Run via cron: 0 2 * * * node src/ml/batch.js

import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

export async function computeItemSimilarities() {
  console.log("[ML-batch] Starting item similarity computation...");
  const start = Date.now();

  // Get all active listings with their features
  const listings = await db.query(
    `SELECT id, category_id, type, tags, price, price_currency, country
     FROM listings WHERE status='active' LIMIT 10000`
  );

  let computed = 0;

  for (const l of listings.rows) {
    // Find similar listings using feature overlap
    const similar = await db.query(
      `SELECT
         l2.id,
         -- Jaccard similarity on tags
         (CASE WHEN ARRAY_LENGTH(l1.tags,1) > 0 AND ARRAY_LENGTH(l2.tags,1) > 0
           THEN (
             SELECT COUNT(*) FROM UNNEST(l1.tags) t WHERE t = ANY(l2.tags)
           )::float / (
             SELECT COUNT(DISTINCT t) FROM (
               SELECT UNNEST(l1.tags) UNION SELECT UNNEST(l2.tags)
             ) sub(t)
           )
           ELSE 0 END
         ) * 0.4
         -- Category match
         + (CASE WHEN l1.category_id = l2.category_id THEN 0.3 ELSE 0 END)
         -- Type match
         + (CASE WHEN l1.type = l2.type THEN 0.2 ELSE 0 END)
         -- Price range similarity (within 30%)
         + (CASE WHEN l1.price > 0 AND l2.price > 0
             AND ABS(l1.price - l2.price) / l1.price < 0.3
             THEN 0.1 ELSE 0 END)
         AS similarity
       FROM listings l1, listings l2
       WHERE l1.id = $1
         AND l2.id != $1
         AND l2.status = 'active'
         AND (l1.category_id = l2.category_id OR l1.type = l2.type)
       ORDER BY similarity DESC
       LIMIT 20`,
      [l.id]
    );

    if (similar.rows.length) {
      // Upsert similarity scores
      await db.query(
        `INSERT INTO listing_similarities (listing_id, similar_id, similarity, computed_at)
         SELECT $1, unnest($2::uuid[]), unnest($3::float[]), NOW()
         ON CONFLICT (listing_id, similar_id) DO UPDATE SET similarity=EXCLUDED.similarity, computed_at=NOW()`,
        [l.id, similar.rows.map(r => r.id), similar.rows.map(r => parseFloat(r.similarity))]
      );

      // Bust item cache
      await redis.del(`ml:item:${l.id}`).catch(() => {});
      computed++;
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[ML-batch] Done: ${computed}/${listings.rows.length} listings processed in ${duration}s`);
}

// Run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  computeItemSimilarities()
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
}
