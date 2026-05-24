// ml/recommendation.engine.js
// Multi-strategy recommendation engine:
//   1. Collaborative Filtering (user-based)
//   2. Content-Based Filtering (listing similarity)
//   3. Trending / Popularity-based
//   4. Contextual (location, time-of-day, device)
//   5. Hybrid weighted blend

import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

const CACHE_TTL = {
  userRecs:   300,   // 5 min — personal recs
  similar:    600,   // 10 min — similar listings
  trending:  1800,   // 30 min — trending
  popular:   3600,   // 1 hr — popular by category
};

const WEIGHTS = {
  collaborative: 0.40,
  content:       0.25,
  trending:      0.20,
  contextual:    0.15,
};

// ════════════════════════════════════════════════════════════
// 1. COLLABORATIVE FILTERING (user-based)
//    "Users who saved/bought what you did also liked..."
// ════════════════════════════════════════════════════════════
export async function collaborativeRecs(userId, limit = 20) {
  const cacheKey = `ml:collab:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  // Step 1: Get listings user interacted with (views, saves, orders)
  const userInteractions = await db.query(
    `SELECT DISTINCT listing_id, interaction_weight
     FROM (
       SELECT listing_id, 1.0 AS interaction_weight FROM listing_views   WHERE user_id=$1 AND viewed_at > NOW()-INTERVAL '90 days'
       UNION ALL
       SELECT listing_id, 2.0 AS interaction_weight FROM saved_listings  WHERE user_id=$1
       UNION ALL
       SELECT listing_id, 5.0 AS interaction_weight FROM orders WHERE buyer_id=$1 AND status='completed'
     ) interactions
     GROUP BY listing_id, interaction_weight`,
    [userId]
  );

  if (!userInteractions.rows.length) {
    return trendingRecs(null, limit); // cold start fallback
  }

  const userListingIds = userInteractions.rows.map(r => r.listing_id);

  // Step 2: Find similar users (who also interacted with same listings)
  const similarUsers = await db.query(
    `SELECT other_user, SUM(overlap_weight) AS similarity
     FROM (
       SELECT CASE WHEN lv.user_id != $1 THEN lv.user_id END AS other_user, 1.0 AS overlap_weight
       FROM listing_views lv WHERE lv.listing_id = ANY($2) AND lv.user_id != $1
       UNION ALL
       SELECT sl.user_id, 2.0 FROM saved_listings sl WHERE sl.listing_id = ANY($2) AND sl.user_id != $1
       UNION ALL
       SELECT o.buyer_id, 5.0  FROM orders o WHERE o.listing_id = ANY($2) AND o.buyer_id != $1 AND o.status='completed'
     ) overlaps
     WHERE other_user IS NOT NULL
     GROUP BY other_user
     ORDER BY similarity DESC
     LIMIT 50`,
    [userId, userListingIds]
  );

  if (!similarUsers.rows.length) {
    return contentBasedRecs(userId, userListingIds.slice(0, 5), limit);
  }

  const similarUserIds = similarUsers.rows.map(r => r.other_user);

  // Step 3: Get listings those similar users liked that our user hasn't seen
  const recs = await db.query(
    `SELECT
       l.id, l.title, l.slug, l.type, l.price, l.price_currency,
       l.location_text, l.country, l.views_count, l.saves_count,
       sp.is_verified, u.username AS seller_username,
       (SELECT li.url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary LIMIT 1) AS image,
       COUNT(DISTINCT sv.user_id) AS similar_user_saves,
       SUM(sv_weight.weight) AS rec_score
     FROM listings l
     JOIN users u ON u.id = l.seller_id
     LEFT JOIN seller_profiles sp ON sp.user_id = l.seller_id
     JOIN (
       SELECT sl.listing_id, SUM(su.similarity * 2.0) AS weight, sl.user_id
       FROM saved_listings sl
       JOIN (SELECT unnest($1::uuid[]) AS user_id, unnest($2::float[]) AS similarity) su ON su.user_id = sl.user_id
       GROUP BY sl.listing_id, sl.user_id
       UNION ALL
       SELECT lv.listing_id, SUM(su.similarity * 1.0) AS weight, lv.user_id
       FROM listing_views lv
       JOIN (SELECT unnest($1::uuid[]) AS user_id, unnest($2::float[]) AS similarity) su ON su.user_id = lv.user_id
       GROUP BY lv.listing_id, lv.user_id
     ) sv ON sv.listing_id = l.id
     JOIN (SELECT sv2.listing_id, SUM(sv2.weight) AS weight FROM (
       SELECT sl.listing_id, SUM(su.similarity) AS weight
       FROM saved_listings sl
       JOIN (SELECT unnest($1::uuid[]) AS user_id, unnest($2::float[]) AS similarity) su ON su.user_id = sl.user_id
       GROUP BY sl.listing_id
     ) sv2 GROUP BY sv2.listing_id) sv_weight ON sv_weight.listing_id = l.id
     WHERE l.status='active'
       AND l.seller_id != $3
       AND l.id != ALL($4::uuid[])
     GROUP BY l.id, l.title, l.slug, l.type, l.price, l.price_currency,
              l.location_text, l.country, l.views_count, l.saves_count,
              sp.is_verified, u.username
     ORDER BY rec_score DESC
     LIMIT $5`,
    [
      similarUserIds,
      similarUsers.rows.map(r => parseFloat(r.similarity)),
      userId,
      userListingIds,
      limit,
    ]
  );

  const result = recs.rows.map(r => ({
    ...r,
    recScore: parseFloat(r.rec_score || 0),
    reason: "collaborative",
    reasonText: "Popular with buyers like you",
  }));

  await redis.setex(cacheKey, CACHE_TTL.userRecs, JSON.stringify(result)).catch(() => {});
  return result;
}

// ════════════════════════════════════════════════════════════
// 2. CONTENT-BASED FILTERING (listing similarity)
//    "Because you viewed/saved this listing..."
// ════════════════════════════════════════════════════════════
export async function contentBasedRecs(userId, seedListingIds, limit = 20) {
  if (!seedListingIds?.length) return [];

  const cacheKey = `ml:content:${seedListingIds.slice(0, 3).join(",")}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  // Get seed listing features
  const seeds = await db.query(
    `SELECT l.id, l.type, l.category_id, l.price, l.price_currency,
            l.country, l.tags, l.seller_id
     FROM listings l WHERE l.id = ANY($1)`,
    [seedListingIds]
  );

  if (!seeds.rows.length) return [];
  const seed = seeds.rows[0]; // Use first seed for simplicity

  // Find similar listings using category + type + price range + tags
  const priceMin = seed.price ? seed.price * 0.5 : 0;
  const priceMax = seed.price ? seed.price * 2.0 : 999999999;

  const similar = await db.query(
    `SELECT
       l.id, l.title, l.slug, l.type, l.price, l.price_currency,
       l.location_text, l.country, l.views_count, l.saves_count,
       sp.is_verified,
       (SELECT li.url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary LIMIT 1) AS image,
       -- Content similarity score: type match + category match + price range + tag overlap
       (
         CASE WHEN l.type = $2 THEN 3.0 ELSE 0 END +
         CASE WHEN l.category_id = $3 THEN 4.0 ELSE 0 END +
         CASE WHEN l.price BETWEEN $6 AND $7 THEN 2.0 ELSE 0 END +
         CASE WHEN l.country = $8 THEN 1.5 ELSE 0 END +
         -- Tag overlap: count common tags
         COALESCE(array_length(ARRAY(SELECT unnest(l.tags) INTERSECT SELECT unnest($9::text[])), 1), 0) * 1.5
       ) AS content_score
     FROM listings l
     LEFT JOIN seller_profiles sp ON sp.user_id = l.seller_id
     WHERE l.status='active'
       AND l.seller_id != $4
       AND l.id != ALL($5::uuid[])
       AND (l.type = $2 OR l.category_id = $3)
     ORDER BY content_score DESC, l.views_count DESC
     LIMIT $10`,
    [
      null, seed.type, seed.category_id,
      seed.seller_id, seedListingIds,
      priceMin, priceMax, seed.country,
      seed.tags || [],
      limit,
    ]
  );

  const result = similar.rows.map(r => ({
    ...r,
    recScore: parseFloat(r.content_score || 0),
    reason: "content",
    reasonText: "Similar to listings you've viewed",
  }));

  await redis.setex(cacheKey, CACHE_TTL.similar, JSON.stringify(result)).catch(() => {});
  return result;
}

// ════════════════════════════════════════════════════════════
// 3. TRENDING / POPULARITY-BASED
//    "What's hot right now in your region"
// ════════════════════════════════════════════════════════════
export async function trendingRecs(country, limit = 20, type = null) {
  const cacheKey = `ml:trending:${country || "all"}:${type || "all"}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const where = ["l.status='active'", "l.created_at > NOW()-INTERVAL '30 days'"];
  const params = [limit];

  if (country) { params.push(country); where.push(`l.country=$${params.length}`); }
  if (type)    { params.push(type);    where.push(`l.type=$${params.length}`); }

  const result = await db.query(
    `SELECT
       l.id, l.title, l.slug, l.type, l.price, l.price_currency,
       l.location_text, l.country, l.views_count, l.saves_count,
       sp.is_verified, sp.plan AS seller_plan,
       (SELECT li.url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary LIMIT 1) AS image,
       COALESCE(AVG(r.rating), 0)::numeric(3,1) AS avg_rating,
       -- Trending score: Wilson score lower bound + velocity
       (
         l.views_count * 0.4 +
         l.saves_count * 2.0 +
         COUNT(DISTINCT o.id) * 10.0 +
         -- Recency decay: listings get bonus in first 7 days
         CASE WHEN l.created_at > NOW()-INTERVAL '7 days' THEN 50 ELSE 0 END +
         -- Verified seller bonus
         CASE WHEN sp.is_verified THEN 20 ELSE 0 END +
         -- Pro seller boost
         CASE WHEN sp.plan IN ('pro','enterprise') THEN l.is_featured::int * 30 ELSE 0 END
       ) AS trending_score
     FROM listings l
     LEFT JOIN seller_profiles sp ON sp.user_id = l.seller_id
     LEFT JOIN reviews r ON r.listing_id = l.id
     LEFT JOIN orders o ON o.listing_id = l.id AND o.status='completed' AND o.created_at > NOW()-INTERVAL '30 days'
     WHERE ${where.join(" AND ")}
     GROUP BY l.id, l.title, l.slug, l.type, l.price, l.price_currency,
              l.location_text, l.country, l.views_count, l.saves_count,
              sp.is_verified, sp.plan, l.is_featured
     ORDER BY trending_score DESC
     LIMIT $1`,
    params
  );

  const recs = result.rows.map(r => ({
    ...r,
    recScore: parseFloat(r.trending_score || 0),
    reason: "trending",
    reasonText: country ? `Trending in ${country}` : "Trending now",
  }));

  await redis.setex(cacheKey, CACHE_TTL.trending, JSON.stringify(recs)).catch(() => {});
  return recs;
}

// ════════════════════════════════════════════════════════════
// 4. CONTEXTUAL RECOMMENDATIONS
//    Time-of-day, device type, search history context
// ════════════════════════════════════════════════════════════
export async function contextualRecs(userId, context = {}, limit = 10) {
  const { hour = new Date().getHours(), country, recentSearch, deviceType } = context;

  // Time-of-day intent signals
  let typeBoost = null;
  if (hour >= 6 && hour < 9)   typeBoost = "job";      // Morning → job seekers
  if (hour >= 12 && hour < 14) typeBoost = "product";  // Lunch → shopping
  if (hour >= 18 && hour < 22) typeBoost = "service";  // Evening → services
  if (hour >= 22 || hour < 4)  typeBoost = "rental";   // Night → rentals

  // Search context boost
  let searchBoost = null;
  if (recentSearch) {
    const searchResult = await db.query(
      `SELECT type, category_id, COUNT(*) AS searches
       FROM search_logs WHERE user_id=$1 AND created_at > NOW()-INTERVAL '7 days'
       GROUP BY type, category_id ORDER BY searches DESC LIMIT 1`,
      [userId]
    ).catch(() => ({ rows: [] }));
    searchBoost = searchResult.rows[0];
  }

  const type = searchBoost?.type || typeBoost;
  return trendingRecs(country, limit, type);
}

// ════════════════════════════════════════════════════════════
// 5. HYBRID ENGINE — weighted blend of all strategies
// ════════════════════════════════════════════════════════════
export async function getRecommendations(userId, options = {}) {
  const {
    limit = 20,
    context = {},
    strategy = "hybrid",
    excludeIds = [],
  } = options;

  // Single-strategy shortcuts
  if (strategy === "trending")     return trendingRecs(context.country, limit);
  if (strategy === "content")      return contentBasedRecs(userId, options.seedIds, limit);
  if (strategy === "collaborative") return collaborativeRecs(userId, limit);

  // HYBRID: run all strategies in parallel
  const [collab, trending, contextual] = await Promise.all([
    collaborativeRecs(userId, Math.ceil(limit * 0.6)).catch(() => []),
    trendingRecs(context.country, Math.ceil(limit * 0.4)).catch(() => []),
    contextualRecs(userId, context, Math.ceil(limit * 0.2)).catch(() => []),
  ]);

  // Merge and deduplicate with weighted scoring
  const seen = new Set(excludeIds);
  const merged = new Map();

  const addWithWeight = (recs, weight) => {
    recs.forEach((r, i) => {
      if (seen.has(r.id)) return;
      seen.add(r.id);
      const positionBonus = 1 - (i / recs.length) * 0.5; // earlier = higher score
      const existing = merged.get(r.id) || { ...r, hybridScore: 0 };
      existing.hybridScore += (r.recScore || 1) * weight * positionBonus;
      merged.set(r.id, existing);
    });
  };

  addWithWeight(collab,     WEIGHTS.collaborative);
  addWithWeight(trending,   WEIGHTS.trending);
  addWithWeight(contextual, WEIGHTS.contextual);

  const results = Array.from(merged.values())
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, limit)
    .map(r => ({ ...r, recScore: r.hybridScore }));

  // Assign reason labels
  results.forEach(r => {
    if (!r.reason) r.reason = "hybrid";
    if (!r.reasonText) r.reasonText = "Recommended for you";
  });

  return results;
}

// ════════════════════════════════════════════════════════════
// SIMILAR LISTINGS (for listing detail page)
// ════════════════════════════════════════════════════════════
export async function getSimilarListings(listingId, limit = 8) {
  const cacheKey = `ml:similar:${listingId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const listing = await db.query(
    "SELECT id, type, category_id, price, country, tags, seller_id FROM listings WHERE id=$1",
    [listingId]
  );
  if (!listing.rows.length) return [];

  const result = await contentBasedRecs(null, [listingId], limit + 1);
  const filtered = result.filter(r => r.id !== listingId).slice(0, limit);

  await redis.setex(cacheKey, CACHE_TTL.similar, JSON.stringify(filtered)).catch(() => {});
  return filtered;
}

// ════════════════════════════════════════════════════════════
// SEARCH RANKING BOOST (inject recs into search)
// ════════════════════════════════════════════════════════════
export async function getPersonalizedSearchBoost(userId) {
  if (!userId) return [];
  const cacheKey = `ml:search_boost:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  // Get user's preferred categories/types from history
  const prefs = await db.query(
    `SELECT l.type, l.category_id, COUNT(*) AS interactions
     FROM (
       SELECT listing_id FROM listing_views WHERE user_id=$1
       UNION ALL SELECT listing_id FROM saved_listings WHERE user_id=$1
       UNION ALL SELECT listing_id FROM orders WHERE buyer_id=$1
     ) i
     JOIN listings l ON l.id = i.listing_id
     GROUP BY l.type, l.category_id
     ORDER BY interactions DESC LIMIT 5`,
    [userId]
  ).catch(() => ({ rows: [] }));

  await redis.setex(cacheKey, 600, JSON.stringify(prefs.rows)).catch(() => {});
  return prefs.rows;
}
