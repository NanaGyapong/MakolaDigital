// controllers/recommendations.controller.js
import { db } from "../config/db.js";
import { redis } from "../config/redis.js";
import {
  hybridRecommend,
  itemSimilarity,
  getTrending,
  rerankSearch,
} from "../ml/engine.js";
import { assignVariant, trackEvent } from "../ml/abtest.js";

// ── GET /api/v1/recommendations — Home feed ───────────────────
export async function getForUser(req, res) {
  try {
    const userId = req.user?.id || null;
    const { limit = 20, context = "home", country } = req.query;

    // A/B test: which algo to use?
    const variant = userId ? assignVariant(userId, "rec_algo_v2") : null;

    let recs;
    if (variant === "treatment") {
      // New hybrid algo
      recs = await hybridRecommend({ userId, country: country || req.user?.country, limit: parseInt(limit), context });
    } else {
      // Control or no experiment
      recs = await hybridRecommend({ userId, country: country || req.user?.country, limit: parseInt(limit), context });
    }

    // Track impression for A/B test
    if (userId && variant) {
      await trackEvent(userId, "rec_algo_v2", "impression");
    }

    res.json({
      recommendations: recs,
      total: recs.length,
      context,
      variant: variant || "default",
      personalised: !!userId,
    });
  } catch (err) {
    console.error("recommendations:", err);
    res.status(500).json({ message: "Failed to load recommendations" });
  }
}

// ── GET /api/v1/recommendations/similar/:id — Item page ───────
export async function getSimilar(req, res) {
  try {
    const { id } = req.params;
    const { limit = 12 } = req.query;
    const recs = await itemSimilarity(id, parseInt(limit));
    res.json({ recommendations: recs, listingId: id });
  } catch (err) {
    res.status(500).json({ message: "Failed to load similar listings" });
  }
}

// ── GET /api/v1/recommendations/trending ─────────────────────
export async function getTrendingRecs(req, res) {
  try {
    const { type, country, limit = 20 } = req.query;
    const recs = await getTrending({ type, country, limit: parseInt(limit) });
    res.json({ recommendations: recs, trending: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to load trending" });
  }
}

// ── POST /api/v1/recommendations/event — Track interactions ───
export async function trackInteraction(req, res) {
  try {
    const { listingId, event, value = 1, sessionId, position } = req.body;
    const userId = req.user?.id;

    // Track in listing_views table
    if (event === "view") {
      await db.query(
        `INSERT INTO listing_views (id, listing_id, user_id, session_id, position, source, viewed_at)
         VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,NOW())
         ON CONFLICT DO NOTHING`,
        [listingId, userId || null, sessionId, position, "recommendation"]
      ).catch(() => {});

      // Increment listing view counter (async, non-blocking)
      db.query("UPDATE listings SET views_count=views_count+1 WHERE id=$1", [listingId]).catch(() => {});
    }

    // Track A/B test CTR
    if (userId && event === "click") {
      await trackEvent(userId, "rec_algo_v2", "ctr", 1);
    }
    if (userId && event === "save") {
      await trackEvent(userId, "rec_algo_v2", "saves", 1);
    }
    if (userId && event === "purchase") {
      await trackEvent(userId, "rec_algo_v2", "purchases", 1);
    }

    // Bust recommendation cache on saves (signal to re-score)
    if (userId && (event === "save" || event === "purchase")) {
      await Promise.all([
        redis.del(`ml:cf:${userId}`),
        redis.del(`ml:cb:${userId}`),
        redis.del(`ml:hybrid:${userId}:home:all`),
      ]).catch(() => {});
    }

    res.json({ tracked: true });
  } catch (err) {
    res.status(500).json({ message: "Tracking failed" });
  }
}

// ── GET /api/v1/recommendations/explain — Why am I seeing this ─
export async function explainRec(req, res) {
  try {
    const { listingId } = req.query;
    const userId = req.user?.id;
    if (!userId) return res.json({ reason: "Popular in your area" });

    // Look up reason from recent interactions
    const reason = await db.query(
      `SELECT
         CASE
           WHEN o.id IS NOT NULL THEN 'You purchased something similar'
           WHEN sl.id IS NOT NULL THEN 'You saved a similar item'
           WHEN lv.id IS NOT NULL THEN 'Based on your recent views'
           ELSE 'Popular with buyers like you'
         END AS reason
       FROM listings l
       LEFT JOIN orders o ON o.buyer_id=$1 AND o.status='completed'
         AND (SELECT category_id FROM listings WHERE id=o.listing_id) = l.category_id
       LEFT JOIN saved_listings sl ON sl.user_id=$1
         AND (SELECT category_id FROM listings WHERE id=sl.listing_id) = l.category_id
       LEFT JOIN listing_views lv ON lv.user_id=$1 AND lv.viewed_at > NOW()-INTERVAL '30 days'
         AND (SELECT category_id FROM listings WHERE id=lv.listing_id) = l.category_id
       WHERE l.id=$2
       LIMIT 1`,
      [userId, listingId]
    );

    res.json({ reason: reason.rows[0]?.reason || "Recommended for you", listingId });
  } catch (err) {
    res.json({ reason: "Recommended for you" });
  }
}
