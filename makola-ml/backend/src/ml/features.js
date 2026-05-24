// ml/features.js
// Feature extraction and engineering for ML models
// Used by recommendation engine and future ranking models

import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

// ── User feature vector ────────────────────────────────────────
export async function getUserFeatures(userId) {
  const cacheKey = `ml:features:user:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const [profile, interactions, orders] = await Promise.all([
    db.query(
      `SELECT u.country, u.created_at, sp.plan, sp.is_verified,
              EXTRACT(EPOCH FROM (NOW()-u.last_seen_at))/3600 AS hours_since_active
       FROM users u LEFT JOIN seller_profiles sp ON sp.user_id=u.id
       WHERE u.id=$1`, [userId]
    ),
    db.query(
      `SELECT l.type, l.category_id, COUNT(*) AS count, AVG(l.price) AS avg_price_viewed
       FROM listing_views lv JOIN listings l ON l.id=lv.listing_id
       WHERE lv.user_id=$1 AND lv.viewed_at > NOW()-INTERVAL '30 days'
       GROUP BY l.type, l.category_id ORDER BY count DESC LIMIT 5`, [userId]
    ),
    db.query(
      `SELECT COUNT(*) AS order_count, AVG(o.total) AS avg_order_value,
              MAX(o.total) AS max_order_value, l.price_currency AS currency
       FROM orders o JOIN listings l ON l.id=o.listing_id
       WHERE o.buyer_id=$1 AND o.status='completed'
       GROUP BY l.price_currency`, [userId]
    ),
  ]);

  const p = profile.rows[0] || {};
  const features = {
    userId,
    country: p.country || "GH",
    accountAgeDays: p.created_at ? (Date.now() - new Date(p.created_at)) / 86400000 : 0,
    isVerifiedSeller: p.is_verified || false,
    plan: p.plan || "free",
    hoursInactive: parseFloat(p.hours_since_active || 0),
    topCategories: interactions.rows.map(r => r.category_id).filter(Boolean),
    topTypes: interactions.rows.map(r => r.type),
    avgPriceViewed: interactions.rows[0]?.avg_price_viewed || 0,
    orderCount: parseInt(orders.rows[0]?.order_count || 0),
    avgOrderValue: parseFloat(orders.rows[0]?.avg_order_value || 0),
    preferredCurrency: orders.rows[0]?.currency || "GHS",
    // Engagement score: 0-100
    engagementScore: Math.min(100, (
      interactions.rows.reduce((s,r) => s + parseInt(r.count), 0) * 2 +
      parseInt(orders.rows[0]?.order_count || 0) * 20
    )),
  };

  await redis.setex(cacheKey, 3600, JSON.stringify(features)).catch(() => {});
  return features;
}

// ── Listing feature vector ─────────────────────────────────────
export async function getListingFeatures(listingId) {
  const cacheKey = `ml:features:listing:${listingId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const result = await db.query(
    `SELECT
       l.id, l.type, l.category_id, l.price, l.price_currency,
       l.country, l.city, l.tags, l.is_featured, l.is_remote,
       l.views_count, l.saves_count,
       EXTRACT(DAYS FROM NOW()-l.created_at) AS age_days,
       sp.is_verified, sp.plan AS seller_plan,
       COUNT(DISTINCT o.id) AS order_count,
       COALESCE(AVG(r.rating), 0)::numeric(3,1) AS avg_rating,
       COUNT(DISTINCT r.id) AS review_count,
       COUNT(DISTINCT li.id) AS image_count,
       LENGTH(l.description) AS description_length
     FROM listings l
     LEFT JOIN seller_profiles sp ON sp.user_id=l.seller_id
     LEFT JOIN orders o ON o.listing_id=l.id AND o.status='completed'
     LEFT JOIN reviews r ON r.listing_id=l.id
     LEFT JOIN listing_images li ON li.listing_id=l.id
     WHERE l.id=$1
     GROUP BY l.id, l.type, l.category_id, l.price, l.price_currency,
              l.country, l.city, l.tags, l.is_featured, l.is_remote,
              l.views_count, l.saves_count, l.created_at, sp.is_verified, sp.plan`,
    [listingId]
  );

  if (!result.rows.length) return null;
  const r = result.rows[0];

  const features = {
    listingId,
    type: r.type,
    categoryId: r.category_id,
    price: parseFloat(r.price || 0),
    currency: r.price_currency,
    country: r.country,
    city: r.city,
    tags: r.tags || [],
    ageDays: parseFloat(r.age_days || 0),
    viewsCount: parseInt(r.views_count || 0),
    savesCount: parseInt(r.saves_count || 0),
    orderCount: parseInt(r.order_count || 0),
    avgRating: parseFloat(r.avg_rating || 0),
    reviewCount: parseInt(r.review_count || 0),
    imageCount: parseInt(r.image_count || 0),
    descriptionLength: parseInt(r.description_length || 0),
    isFeatured: r.is_featured,
    isRemote: r.is_remote,
    sellerIsVerified: r.is_verified,
    sellerPlan: r.seller_plan || "free",
    // Quality score (heuristic): 0-100
    qualityScore: Math.min(100, (
      Math.min(r.image_count, 8) * 5 +         // photos: up to 40pts
      Math.min(r.description_length / 20, 20) + // description: up to 20pts
      parseFloat(r.avg_rating || 0) * 8 +       // rating: up to 40pts  (5★ = 40)
      (r.is_verified ? 10 : 0) +                // verified seller: 10pts
      (r.is_featured ? 5 : 0) +                 // featured: 5pts
      Math.min(r.review_count, 5)               // reviews: up to 5pts
    )),
    // Conversion proxy: saves-to-views ratio
    saveRate: r.views_count > 0 ? r.saves_count / r.views_count : 0,
  };

  await redis.setex(cacheKey, 600, JSON.stringify(features)).catch(() => {});
  return features;
}

// ── Batch refresh listing features (called nightly via cron) ─
export async function refreshListingFeatures(limit = 5000) {
  const listings = await db.query(
    `SELECT id FROM listings WHERE status='active'
     ORDER BY views_count DESC LIMIT $1`, [limit]
  );

  let refreshed = 0;
  for (const { id } of listings.rows) {
    await redis.del(`ml:features:listing:${id}`).catch(() => {});
    await getListingFeatures(id).catch(() => {});
    refreshed++;
  }
  return refreshed;
}
