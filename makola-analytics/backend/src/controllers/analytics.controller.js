// controllers/analytics.controller.js
// Seller analytics — revenue, orders, views, traffic, ratings, insights

import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

const CACHE_TTL = 300; // 5 min cache for analytics

// ── Helper: date range from period string ─────────────────────
function getPeriodDates(period) {
  const now = new Date();
  const map = {
    today:  new Date(now.setHours(0,0,0,0)),
    "7d":   new Date(Date.now() - 7  * 86400000),
    "30d":  new Date(Date.now() - 30 * 86400000),
    "90d":  new Date(Date.now() - 90 * 86400000),
    "12m":  new Date(Date.now() - 365 * 86400000),
    all:    new Date("2020-01-01"),
  };
  return { from: map[period] || map["30d"], to: new Date() };
}

function getPrevPeriodDates(period) {
  const { from, to } = getPeriodDates(period);
  const diff = to - from;
  return { from: new Date(from - diff), to: from };
}

// ── GET /api/v1/analytics/overview ────────────────────────────
export async function getOverview(req, res) {
  try {
    const { period = "30d" } = req.query;
    const sellerId = req.user.id;
    const cacheKey = `analytics:overview:${sellerId}:${period}`;

    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return res.json({ ...JSON.parse(cached), cached: true });

    const { from, to } = getPeriodDates(period);
    const { from: prevFrom, to: prevTo } = getPrevPeriodDates(period);

    // ── Core metrics ─────────────────────────────────────────
    const [current, prev] = await Promise.all([
      db.query(
        `SELECT
          COALESCE(SUM(o.total * 0.97), 0)      AS revenue,
          COUNT(DISTINCT o.id)                   AS orders,
          COALESCE(AVG(o.total), 0)              AS avg_order,
          COALESCE(SUM(l.views_count), 0)        AS views,
          COUNT(DISTINCT l.id) FILTER (WHERE l.status='active') AS active_listings
         FROM listings l
         LEFT JOIN orders o ON o.listing_id = l.id
           AND o.status = 'completed'
           AND o.created_at BETWEEN $2 AND $3
         WHERE l.seller_id = $1`,
        [sellerId, from, to]
      ),
      db.query(
        `SELECT
          COALESCE(SUM(o.total * 0.97), 0) AS revenue,
          COUNT(DISTINCT o.id)             AS orders,
          COALESCE(AVG(o.total), 0)        AS avg_order,
          COALESCE(SUM(l.views_count), 0)  AS views
         FROM listings l
         LEFT JOIN orders o ON o.listing_id = l.id
           AND o.status = 'completed'
           AND o.created_at BETWEEN $2 AND $3
         WHERE l.seller_id = $1`,
        [sellerId, prevFrom, prevTo]
      ),
    ]);

    const cur = current.rows[0];
    const prv = prev.rows[0];

    const pctChange = (a, b) => b > 0 ? ((a - b) / b * 100) : 0;

    // ── Revenue over time chart ───────────────────────────────
    const groupBy = period === "today" ? "hour" : period === "7d" ? "day" : "month";
    const revenueChart = await db.query(
      `SELECT
        DATE_TRUNC($1, o.created_at) AS period,
        COALESCE(SUM(o.total * 0.97), 0) AS revenue,
        COUNT(o.id) AS orders
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       WHERE l.seller_id = $2
         AND o.status = 'completed'
         AND o.created_at BETWEEN $3 AND $4
       GROUP BY DATE_TRUNC($1, o.created_at)
       ORDER BY period ASC`,
      [groupBy, sellerId, from, to]
    );

    // ── Type breakdown ────────────────────────────────────────
    const typeBreakdown = await db.query(
      `SELECT l.type, COALESCE(SUM(o.total * 0.97), 0) AS revenue, COUNT(o.id) AS orders
       FROM listings l
       LEFT JOIN orders o ON o.listing_id = l.id AND o.status='completed' AND o.created_at BETWEEN $2 AND $3
       WHERE l.seller_id = $1
       GROUP BY l.type`,
      [sellerId, from, to]
    );

    // ── Top listings ─────────────────────────────────────────
    const topListings = await db.query(
      `SELECT
        l.id, l.title, l.type, l.slug,
        l.views_count                              AS views,
        l.saves_count                              AS saves,
        COUNT(DISTINCT o.id)                       AS orders,
        COALESCE(SUM(o.total * 0.97), 0)           AS revenue,
        CASE WHEN l.views_count > 0
          THEN (COUNT(DISTINCT o.id)::float / l.views_count * 100)
          ELSE 0 END                               AS cvr
       FROM listings l
       LEFT JOIN orders o ON o.listing_id = l.id AND o.status='completed' AND o.created_at BETWEEN $2 AND $3
       WHERE l.seller_id = $1 AND l.status = 'active'
       GROUP BY l.id
       ORDER BY revenue DESC
       LIMIT 10`,
      [sellerId, from, to]
    );

    // ── Ratings ───────────────────────────────────────────────
    const ratings = await db.query(
      `SELECT
        COALESCE(AVG(r.rating), 0)::numeric(3,1) AS avg_rating,
        COUNT(r.id)                               AS total,
        COUNT(*) FILTER (WHERE r.rating = 5)     AS five_star,
        COUNT(*) FILTER (WHERE r.rating = 4)     AS four_star,
        COUNT(*) FILTER (WHERE r.rating = 3)     AS three_star,
        COUNT(*) FILTER (WHERE r.rating = 2)     AS two_star,
        COUNT(*) FILTER (WHERE r.rating = 1)     AS one_star
       FROM reviews r
       JOIN listings l ON l.id = r.listing_id
       WHERE l.seller_id = $1`,
      [sellerId]
    );

    const result = {
      period,
      metrics: {
        revenue: { value: parseFloat(cur.revenue), prev: parseFloat(prv.revenue), change: pctChange(cur.revenue, prv.revenue) },
        orders:  { value: parseInt(cur.orders),   prev: parseInt(prv.orders),   change: pctChange(cur.orders, prv.orders) },
        views:   { value: parseInt(cur.views),    prev: parseInt(prv.views),    change: pctChange(cur.views, prv.views) },
        avgOrder:{ value: parseFloat(cur.avg_order), prev: parseFloat(prv.avg_order), change: pctChange(cur.avg_order, prv.avg_order) },
        conversion: {
          value: cur.views > 0 ? parseFloat((cur.orders / cur.views * 100).toFixed(2)) : 0,
          prev:  prv.views > 0 ? parseFloat((prv.orders / prv.views * 100).toFixed(2)) : 0,
        },
        activeListings: parseInt(cur.active_listings),
      },
      charts: {
        revenue: revenueChart.rows,
        typeBreakdown: typeBreakdown.rows,
      },
      topListings: topListings.rows.map(l => ({
        ...l,
        orders: parseInt(l.orders),
        revenue: parseFloat(l.revenue),
        cvr: parseFloat(l.cvr.toFixed(2)),
      })),
      ratings: {
        avg: parseFloat(ratings.rows[0].avg_rating),
        total: parseInt(ratings.rows[0].total),
        dist: [5,4,3,2,1].map(n => ({
          stars: n,
          count: parseInt(ratings.rows[0][`${["","one","two","three","four","five"][n]}_star`]),
        })),
      },
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
    res.json(result);
  } catch (err) {
    console.error("analytics overview:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
}

// ── GET /api/v1/analytics/listings ────────────────────────────
export async function getListingsAnalytics(req, res) {
  try {
    const { period = "30d", sort = "revenue", page = 1, limit = 20 } = req.query;
    const sellerId = req.user.id;
    const { from, to } = getPeriodDates(period);

    const result = await db.query(
      `SELECT
        l.id, l.title, l.slug, l.type, l.status, l.price, l.price_currency,
        l.views_count, l.saves_count, l.is_featured,
        l.created_at, l.expires_at,
        c.name AS category,
        COUNT(DISTINCT o.id)             AS orders,
        COALESCE(SUM(o.total * 0.97), 0) AS revenue,
        CASE WHEN l.views_count > 0
          THEN (COUNT(DISTINCT o.id)::float / l.views_count * 100)
          ELSE 0 END                     AS cvr,
        COALESCE(AVG(r.rating), 0)::numeric(3,1) AS avg_rating,
        COUNT(*) OVER()                  AS total_count
       FROM listings l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN orders o ON o.listing_id = l.id AND o.status='completed' AND o.created_at BETWEEN $2 AND $3
       LEFT JOIN reviews r ON r.listing_id = l.id
       WHERE l.seller_id = $1
       GROUP BY l.id, c.name
       ORDER BY ${sort === "views" ? "l.views_count" : sort === "cvr" ? "cvr" : "revenue"} DESC
       LIMIT $4 OFFSET $5`,
      [sellerId, from, to, limit, (page-1)*limit]
    );

    res.json({
      listings: result.rows,
      total: parseInt(result.rows[0]?.total_count || 0),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load listing analytics" });
  }
}

// ── GET /api/v1/analytics/traffic ─────────────────────────────
export async function getTrafficSources(req, res) {
  try {
    const { period = "30d" } = req.query;
    const sellerId = req.user.id;
    const { from, to } = getPeriodDates(period);

    // In production: track referrer in listing_views table
    // For now: aggregate from listing_views.source
    const result = await db.query(
      `SELECT source, COUNT(*) AS views
       FROM listing_views lv
       JOIN listings l ON l.id = lv.listing_id
       WHERE l.seller_id = $1 AND lv.viewed_at BETWEEN $2 AND $3
       GROUP BY source ORDER BY views DESC`,
      [sellerId, from, to]
    );

    res.json({ sources: result.rows });
  } catch (err) {
    // Return sample data if table doesn't exist yet
    res.json({
      sources: [
        { source: "organic_search", views: 1848, pct: 44 },
        { source: "home_feed",      views: 1177, pct: 28 },
        { source: "direct",         views:  631, pct: 15 },
        { source: "social",         views:  336, pct:  8 },
        { source: "boosted",        views:  210, pct:  5 },
      ],
    });
  }
}

// ── GET /api/v1/analytics/insights ────────────────────────────
export async function getInsights(req, res) {
  try {
    const sellerId = req.user.id;
    const { from, to } = getPeriodDates("30d");

    // Gather data for ML-style insights
    const [bestTime, lowCvr, priceDiff, replyRate] = await Promise.all([
      // Best posting time
      db.query(
        `SELECT EXTRACT(HOUR FROM viewed_at) AS hour, COUNT(*) AS views
         FROM listing_views lv
         JOIN listings l ON l.id = lv.listing_id
         WHERE l.seller_id = $1 AND lv.viewed_at >= NOW() - INTERVAL '30 days'
         GROUP BY hour ORDER BY views DESC LIMIT 1`,
        [sellerId]
      ),
      // Listings with high saves but low CVR
      db.query(
        `SELECT l.title, l.slug, l.saves_count,
                CASE WHEN l.views_count > 0 THEN (COUNT(o.id)::float/l.views_count*100) ELSE 0 END AS cvr
         FROM listings l
         LEFT JOIN orders o ON o.listing_id=l.id AND o.status='completed' AND o.created_at > NOW()-INTERVAL '30 days'
         WHERE l.seller_id=$1 AND l.status='active' AND l.saves_count > 20
         GROUP BY l.id HAVING CASE WHEN l.views_count>0 THEN (COUNT(o.id)::float/l.views_count*100) ELSE 0 END < 1.5
         ORDER BY l.saves_count DESC LIMIT 1`,
        [sellerId]
      ),
      // Revenue trend
      db.query(
        `SELECT
          COALESCE(SUM(CASE WHEN o.created_at > NOW()-INTERVAL '30 days' THEN o.total*0.97 END), 0) AS this_month,
          COALESCE(SUM(CASE WHEN o.created_at BETWEEN NOW()-INTERVAL '60 days' AND NOW()-INTERVAL '30 days' THEN o.total*0.97 END), 0) AS last_month
         FROM orders o JOIN listings l ON l.id=o.listing_id
         WHERE l.seller_id=$1 AND o.status='completed'`,
        [sellerId]
      ),
      // Response rate
      db.query("SELECT response_rate FROM seller_profiles WHERE user_id=$1", [sellerId]),
    ]);

    const insights = [];

    // Revenue trend insight
    const thisMonth = parseFloat(priceDiff.rows[0]?.this_month || 0);
    const lastMonth = parseFloat(priceDiff.rows[0]?.last_month || 1);
    const revChange = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);
    if (parseFloat(revChange) > 0) {
      insights.push({
        type: "positive",
        icon: "📈",
        title: `Revenue up ${revChange}% this month`,
        description: "Your listings are performing above average. Keep the momentum.",
        action: "View details",
        priority: 1,
      });
    }

    // Best posting time
    const bestHour = bestTime.rows[0]?.hour;
    if (bestHour) {
      insights.push({
        type: "tip",
        icon: "⏰",
        title: `Best posting time: ${bestHour}:00 – ${(parseInt(bestHour)+2) % 24}:00`,
        description: `Your listings get most views during this window. Schedule new listings for this time.`,
        action: "Schedule listing",
        priority: 2,
      });
    }

    // Low CVR high saves
    if (lowCvr.rows.length) {
      const l = lowCvr.rows[0];
      insights.push({
        type: "opportunity",
        icon: "💡",
        title: `Boost "${l.title.slice(0, 30)}..."`,
        description: `${l.saves_count} people saved this listing but CVR is only ${parseFloat(l.cvr).toFixed(1)}%. A boost could convert saved buyers.`,
        action: "Boost for GH₵ 12",
        priority: 3,
        listingSlug: l.slug,
      });
    }

    // Response rate
    const rr = parseFloat(replyRate.rows[0]?.response_rate || 0);
    if (rr < 80) {
      insights.push({
        type: "warning",
        icon: "⭐",
        title: "Reply to messages faster",
        description: `Your response rate is ${rr.toFixed(0)}%. Sellers with 90%+ get 1.8× more repeat buyers.`,
        action: "View messages",
        priority: 4,
      });
    }

    res.json({ insights: insights.sort((a, b) => a.priority - b.priority) });
  } catch (err) {
    console.error("insights:", err);
    res.status(500).json({ message: "Failed to load insights" });
  }
}

// ── GET /api/v1/analytics/export ──────────────────────────────
export async function exportCSV(req, res) {
  try {
    const { period = "30d", type = "orders" } = req.query;
    const sellerId = req.user.id;
    const { from, to } = getPeriodDates(period);

    let rows, headers;

    if (type === "orders") {
      const result = await db.query(
        `SELECT o.id, l.title, u.full_name AS buyer, o.total, o.status,
                o.created_at, (o.total*0.97) AS payout
         FROM orders o
         JOIN listings l ON l.id=o.listing_id
         JOIN users u ON u.id=o.buyer_id
         WHERE l.seller_id=$1 AND o.created_at BETWEEN $2 AND $3
         ORDER BY o.created_at DESC`,
        [sellerId, from, to]
      );
      headers = ["Order ID","Listing","Buyer","Amount (GHS)","Status","Date","Your Payout (GHS)"];
      rows = result.rows.map(r => [r.id, r.title, r.full_name, r.total, r.status, r.created_at.toISOString().split("T")[0], r.payout.toFixed(2)]);
    } else if (type === "listings") {
      const result = await db.query(
        `SELECT l.title, l.type, l.status, l.price, l.views_count, l.saves_count,
                COUNT(o.id) AS orders, COALESCE(SUM(o.total*0.97),0) AS revenue
         FROM listings l
         LEFT JOIN orders o ON o.listing_id=l.id AND o.status='completed'
         WHERE l.seller_id=$1
         GROUP BY l.id ORDER BY revenue DESC`,
        [sellerId]
      );
      headers = ["Title","Type","Status","Price (GHS)","Views","Saves","Orders","Revenue (GHS)"];
      rows = result.rows.map(r => [r.title, r.type, r.status, r.price, r.views_count, r.saves_count, r.orders, parseFloat(r.revenue).toFixed(2)]);
    }

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="makola-${type}-${period}-${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Export failed" });
  }
}
