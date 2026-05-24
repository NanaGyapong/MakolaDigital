// ml/engine.js
// Makola Digital Recommendation Engine
// Strategy: Hybrid (Collaborative + Content-based + Contextual)
// All computed in JS/PostgreSQL — no external ML service needed for v1

import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

const CACHE_TTL = {
  userRecs: 300,      // 5 min — personal recs
  trending:  600,     // 10 min — trending is slower moving
  similar:   900,     // 15 min — item-item similarity
  explore:  1800,     // 30 min — explore/discovery
};

// ══════════════════════════════════════════════════════════════
// 1. COLLABORATIVE FILTERING (User-User similarity)
//    "Users who saved/bought what you did also liked..."
// ══════════════════════════════════════════════════════════════
export async function collaborativeFilter(userId, limit = 20) {
  const cacheKey = `ml:cf:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  // Step 1: Find users who interacted with the same listings
  const similarUsers = await db.query(
    `WITH user_items AS (
       -- Listings this user has saved or purchased
       SELECT listing_id, 'save' AS action, 1.0 AS weight
       FROM saved_listings WHERE user_id = $1
       UNION ALL
       SELECT o.listing_id, 'purchase', 3.0
       FROM orders o WHERE o.buyer_id = $1 AND o.status = 'completed'
       UNION ALL
       SELECT listing_id, 'view', 0.2
       FROM listing_views WHERE user_id = $1
         AND viewed_at > NOW() - INTERVAL '30 days'
     ),
     similar_users AS (
       -- Other users who interacted with the same items
       SELECT
         CASE WHEN sl.user_id IS NOT NULL THEN sl.user_id
              WHEN o.buyer_id IS NOT NULL THEN o.buyer_id
              ELSE lv.user_id END AS other_user_id,
         SUM(ui.weight) AS overlap_score
       FROM user_items ui
       LEFT JOIN saved_listings sl ON sl.listing_id = ui.listing_id AND sl.user_id != $1
       LEFT JOIN orders o ON o.listing_id = ui.listing_id AND o.buyer_id != $1 AND o.status='completed'
       LEFT JOIN listing_views lv ON lv.listing_id = ui.listing_id AND lv.user_id != $1
       WHERE (sl.user_id IS NOT NULL OR o.buyer_id IS NOT NULL OR lv.user_id IS NOT NULL)
       GROUP BY other_user_id
       HAVING SUM(ui.weight) >= 1.0
       ORDER BY overlap_score DESC
       LIMIT 50
     ),
     already_seen AS (
       SELECT listing_id FROM user_items
     )
     -- Get listings those similar users liked, that this user hasn't seen
     SELECT
       l.id, l.title, l.slug, l.type, l.price, l.price_currency,
       l.location_text, l.country,
       (SELECT url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary ORDER BY li.sort_order LIMIT 1) AS image,
       COALESCE(AVG(r.rating),0)::numeric(3,1) AS rating,
       COUNT(DISTINCT r.id) AS review_count,
       SUM(su.overlap_score) AS rec_score,
       'collaborative' AS rec_type
     FROM similar_users su
     JOIN saved_listings sl2 ON sl2.user_id = su.other_user_id
     JOIN listings l ON l.id = sl2.listing_id AND l.status = 'active'
     LEFT JOIN reviews r ON r.listing_id = l.id
     WHERE l.id NOT IN (SELECT listing_id FROM already_seen)
     GROUP BY l.id, l.title, l.slug, l.type, l.price, l.price_currency, l.location_text, l.country
     ORDER BY rec_score DESC
     LIMIT $2`,
    [userId, limit]
  );

  const results = similarUsers.rows;
  await redis.setex(cacheKey, CACHE_TTL.userRecs, JSON.stringify(results)).catch(() => {});
  return results;
}

// ══════════════════════════════════════════════════════════════
// 2. CONTENT-BASED FILTERING (Item similarity via tags + category)
//    "Because you viewed iPhone 15, you might like..."
// ══════════════════════════════════════════════════════════════
export async function contentBasedFilter(userId, limit = 20) {
  const cacheKey = `ml:cb:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const results = await db.query(
    `WITH user_profile AS (
       -- Build user interest profile from recent interactions
       SELECT
         l.category_id,
         l.type,
         l.tags,
         l.price,
         l.price_currency,
         l.country,
         CASE
           WHEN o.id IS NOT NULL THEN 5.0
           WHEN sl.id IS NOT NULL THEN 3.0
           ELSE 1.0
         END AS weight
       FROM listing_views lv
       JOIN listings l ON l.id = lv.listing_id
       LEFT JOIN orders o ON o.listing_id=l.id AND o.buyer_id=$1 AND o.status='completed'
       LEFT JOIN saved_listings sl ON sl.listing_id=l.id AND sl.user_id=$1
       WHERE lv.user_id=$1
         AND lv.viewed_at > NOW() - INTERVAL '60 days'
       ORDER BY weight DESC, lv.viewed_at DESC
       LIMIT 100
     ),
     user_categories AS (
       SELECT category_id, SUM(weight) AS cat_score
       FROM user_profile
       GROUP BY category_id
       ORDER BY cat_score DESC
       LIMIT 5
     ),
     user_tags AS (
       SELECT UNNEST(tags) AS tag, SUM(weight) AS tag_score
       FROM user_profile
       GROUP BY tag
       ORDER BY tag_score DESC
       LIMIT 20
     ),
     already_interacted AS (
       SELECT listing_id FROM listing_views WHERE user_id=$1
     )
     SELECT
       l.id, l.title, l.slug, l.type, l.price, l.price_currency,
       l.location_text, l.country,
       (SELECT url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary LIMIT 1) AS image,
       COALESCE(AVG(r.rating),0)::numeric(3,1) AS rating,
       COUNT(DISTINCT r.id) AS review_count,
       -- Score: category match + tag overlap
       COALESCE(uc.cat_score,0) * 2.0
         + (SELECT COUNT(*) FROM user_tags ut WHERE ut.tag = ANY(l.tags)) * 1.5
         + (CASE WHEN l.country = (SELECT country FROM user_profile LIMIT 1) THEN 1.0 ELSE 0 END)
       AS rec_score,
       'content_based' AS rec_type
     FROM listings l
     LEFT JOIN user_categories uc ON uc.category_id = l.category_id
     LEFT JOIN reviews r ON r.listing_id = l.id
     WHERE l.status = 'active'
       AND l.id NOT IN (SELECT listing_id FROM already_interacted)
       AND (uc.category_id IS NOT NULL
            OR EXISTS (SELECT 1 FROM user_tags ut WHERE ut.tag = ANY(l.tags)))
     GROUP BY l.id, l.title, l.slug, l.type, l.price, l.price_currency,
              l.location_text, l.country, uc.cat_score
     HAVING COALESCE(uc.cat_score,0)*2 + (SELECT COUNT(*) FROM user_tags ut WHERE ut.tag=ANY(l.tags))*1.5 > 1
     ORDER BY rec_score DESC
     LIMIT $2`,
    [userId, limit]
  );

  const r = results.rows;
  await redis.setex(cacheKey, CACHE_TTL.userRecs, JSON.stringify(r)).catch(() => {});
  return r;
}

// ══════════════════════════════════════════════════════════════
// 3. ITEM-ITEM SIMILARITY ("Customers also viewed")
//    Used on listing detail pages
// ══════════════════════════════════════════════════════════════
export async function itemSimilarity(listingId, limit = 12) {
  const cacheKey = `ml:item:${listingId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const results = await db.query(
    `WITH target AS (
       SELECT category_id, type, tags, price, price_currency, country
       FROM listings WHERE id = $1
     ),
     co_viewed AS (
       -- Users who viewed this listing also viewed:
       SELECT lv2.listing_id, COUNT(*) AS co_views
       FROM listing_views lv1
       JOIN listing_views lv2 ON lv2.user_id = lv1.user_id
         AND lv2.listing_id != $1
         AND ABS(EXTRACT(EPOCH FROM (lv2.viewed_at - lv1.viewed_at))) < 3600
       WHERE lv1.listing_id = $1
       GROUP BY lv2.listing_id
       ORDER BY co_views DESC
       LIMIT 100
     )
     SELECT
       l.id, l.title, l.slug, l.type, l.price, l.price_currency,
       l.location_text, l.country, l.is_featured,
       (SELECT url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary LIMIT 1) AS image,
       COALESCE(AVG(r.rating),0)::numeric(3,1) AS rating,
       COUNT(DISTINCT r.id) AS review_count,
       COALESCE(cv.co_views, 0) * 3.0
         + (CASE WHEN l.category_id=(SELECT category_id FROM target) THEN 5.0 ELSE 0 END)
         + (CASE WHEN l.type=(SELECT type FROM target) THEN 2.0 ELSE 0 END)
         + (SELECT COUNT(*) FROM UNNEST(l.tags) t WHERE t=ANY((SELECT tags FROM target)::text[])) * 1.0
         + (CASE WHEN ABS(l.price - (SELECT price FROM target)) / NULLIF((SELECT price FROM target),0) < 0.3 THEN 2.0 ELSE 0 END)
       AS similarity_score,
       'item_similarity' AS rec_type
     FROM listings l
     LEFT JOIN co_viewed cv ON cv.listing_id = l.id
     LEFT JOIN reviews r ON r.listing_id = l.id
     JOIN target t ON true
     WHERE l.id != $1 AND l.status = 'active'
       AND (cv.listing_id IS NOT NULL
            OR l.category_id = (SELECT category_id FROM target)
            OR l.type = (SELECT type FROM target))
     GROUP BY l.id, l.title, l.slug, l.type, l.price, l.price_currency,
              l.location_text, l.country, l.is_featured, cv.co_views
     ORDER BY similarity_score DESC, l.is_featured DESC
     LIMIT $2`,
    [listingId, limit]
  );

  const r = results.rows;
  await redis.setex(cacheKey, CACHE_TTL.similar, JSON.stringify(r)).catch(() => {});
  return r;
}

// ══════════════════════════════════════════════════════════════
// 4. TRENDING (Velocity-based ranking)
//    "What's blowing up right now in your region"
// ══════════════════════════════════════════════════════════════
export async function getTrending({ type, country, limit = 20 } = {}) {
  const cacheKey = `ml:trending:${type||'all'}:${country||'all'}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const params = [limit];
  const where = ["l.status = 'active'"];
  if (type)    { params.push(type);    where.push(`l.type = $${params.length}`); }
  if (country) { params.push(country); where.push(`l.country = $${params.length}`); }

  const results = await db.query(
    `SELECT
       l.id, l.title, l.slug, l.type, l.price, l.price_currency,
       l.location_text, l.country, l.created_at, l.is_featured,
       (SELECT url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary LIMIT 1) AS image,
       COALESCE(AVG(r.rating),0)::numeric(3,1) AS rating,
       COUNT(DISTINCT r.id) AS review_count,
       -- Wilson score + recency decay + velocity
       (
         -- Views in last 24h (velocity)
         COUNT(DISTINCT CASE WHEN lv.viewed_at > NOW()-INTERVAL '24 hours' THEN lv.id END) * 4.0
         -- Saves in last 7d
       + COUNT(DISTINCT CASE WHEN sl.created_at > NOW()-INTERVAL '7 days' THEN sl.id END) * 8.0
         -- Orders in last 7d
       + COUNT(DISTINCT CASE WHEN o.created_at > NOW()-INTERVAL '7 days' THEN o.id END) * 20.0
         -- Featured boost
       + CASE WHEN l.is_featured THEN 15.0 ELSE 0 END
         -- Recency bonus (newer listings decay slower)
       + GREATEST(0, 10.0 - EXTRACT(EPOCH FROM NOW()-l.created_at)/86400.0)
       ) AS trending_score,
       'trending' AS rec_type
     FROM listings l
     LEFT JOIN listing_views lv ON lv.listing_id = l.id AND lv.viewed_at > NOW()-INTERVAL '48 hours'
     LEFT JOIN saved_listings sl ON sl.listing_id = l.id
     LEFT JOIN orders o ON o.listing_id = l.id AND o.status='completed'
     LEFT JOIN reviews r ON r.listing_id = l.id
     WHERE ${where.join(' AND ')}
     GROUP BY l.id, l.title, l.slug, l.type, l.price, l.price_currency, l.location_text, l.country, l.created_at, l.is_featured
     ORDER BY trending_score DESC
     LIMIT $1`,
    params
  );

  const r = results.rows;
  await redis.setex(cacheKey, CACHE_TTL.trending, JSON.stringify(r)).catch(() => {});
  return r;
}

// ══════════════════════════════════════════════════════════════
// 5. COLD START — New users (no history)
//    Location + demographic signals only
// ══════════════════════════════════════════════════════════════
export async function coldStart({ country, city, type, limit = 20 } = {}) {
  const cacheKey = `ml:cold:${country||'all'}:${type||'all'}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const params = [limit];
  const where = ["l.status='active'", "l.is_featured=true OR COALESCE(AVG(r.rating),0)>=4.0"];
  const score = [`COALESCE(AVG(r.rating),0)*10 + COUNT(DISTINCT o.id)*5`];

  if (country) { params.push(country); where.push(`l.country=$${params.length}`); }
  if (type)    { params.push(type);    where.push(`l.type=$${params.length}`); }

  const r = await db.query(
    `SELECT l.id, l.title, l.slug, l.type, l.price, l.price_currency, l.location_text, l.country,
       (SELECT url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary LIMIT 1) AS image,
       COALESCE(AVG(r.rating),0)::numeric(3,1) AS rating, COUNT(DISTINCT r.id) AS review_count,
       'cold_start' AS rec_type
     FROM listings l
     LEFT JOIN reviews r ON r.listing_id=l.id
     LEFT JOIN orders o ON o.listing_id=l.id AND o.status='completed'
     WHERE ${where.join(' AND ')}
     GROUP BY l.id HAVING COALESCE(AVG(r.rating),0)>=3.8
     ORDER BY COALESCE(AVG(r.rating),0)*10+COUNT(DISTINCT o.id)*5 DESC
     LIMIT $1`,
    params
  );

  const result = r.rows;
  await redis.setex(cacheKey, CACHE_TTL.explore, JSON.stringify(result)).catch(() => {});
  return result;
}

// ══════════════════════════════════════════════════════════════
// 6. HYBRID MERGER — Combines all signals with weights
// ══════════════════════════════════════════════════════════════
export async function hybridRecommend({ userId, country, limit = 20, context = 'home' }) {
  const cacheKey = `ml:hybrid:${userId||'anon'}:${context}:${country||'all'}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  let results = [];

  if (!userId) {
    // Anonymous: trending + cold start
    const [trending, cold] = await Promise.all([
      getTrending({ country, limit: Math.ceil(limit * 0.7) }),
      coldStart({ country, limit: Math.floor(limit * 0.3) }),
    ]);
    results = deduplicateAndMerge([
      ...trending.map(l => ({ ...l, rec_score: l.trending_score * 1.0 })),
      ...cold.map(l => ({ ...l, rec_score: 5.0 })),
    ], limit);
  } else {
    // Authenticated: full hybrid stack
    const [cf, cb, trending] = await Promise.all([
      collaborativeFilter(userId, Math.ceil(limit * 0.5)).catch(() => []),
      contentBasedFilter(userId, Math.ceil(limit * 0.4)).catch(() => []),
      getTrending({ country, limit: Math.ceil(limit * 0.3) }),
    ]);

    // Weights: CF 50%, CB 30%, Trending 20%
    const weighted = [
      ...cf.map(l =>      ({ ...l, rec_score: (l.rec_score||1) * 1.0, source: 'cf' })),
      ...cb.map(l =>      ({ ...l, rec_score: (l.rec_score||1) * 0.6, source: 'cb' })),
      ...trending.map(l => ({ ...l, rec_score: (l.trending_score||1) * 0.4, source: 'trending' })),
    ];

    results = deduplicateAndMerge(weighted, limit);
  }

  await redis.setex(cacheKey, CACHE_TTL.userRecs, JSON.stringify(results)).catch(() => {});
  return results;
}

// ── Dedup + merge helper ──────────────────────────────────────
function deduplicateAndMerge(items, limit) {
  const seen = new Set();
  const merged = [];
  // Sort by rec_score descending first
  items.sort((a, b) => (b.rec_score || 0) - (a.rec_score || 0));
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
      if (merged.length >= limit) break;
    }
  }
  return merged;
}

// ══════════════════════════════════════════════════════════════
// 7. SEARCH RERANKING — Personalise search results
// ══════════════════════════════════════════════════════════════
export async function rerankSearch(userId, listings) {
  if (!userId || !listings.length) return listings;

  // Get user's category/type preferences
  const prefs = await db.query(
    `SELECT l.category_id, l.type, l.country, COUNT(*) AS interactions
     FROM listing_views lv
     JOIN listings l ON l.id = lv.listing_id
     WHERE lv.user_id=$1 AND lv.viewed_at > NOW()-INTERVAL '30 days'
     GROUP BY l.category_id, l.type, l.country`,
    [userId]
  ).then(r => r.rows).catch(() => []);

  if (!prefs.length) return listings;

  const catScores = Object.fromEntries(prefs.map(p => [p.category_id, parseInt(p.interactions)]));
  const typeScores = Object.fromEntries(prefs.map(p => [p.type, parseInt(p.interactions)]));
  const countryScores = Object.fromEntries(prefs.map(p => [p.country, parseInt(p.interactions)]));

  // Boost scores based on user preferences
  return listings
    .map(l => ({
      ...l,
      personalizedScore:
        (l.relevanceScore || 1.0) *
        (1 + (catScores[l.category_id] || 0) * 0.1) *
        (1 + (typeScores[l.type] || 0) * 0.05) *
        (1 + (countryScores[l.country] || 0) * 0.08),
    }))
    .sort((a, b) => b.personalizedScore - a.personalizedScore);
}
