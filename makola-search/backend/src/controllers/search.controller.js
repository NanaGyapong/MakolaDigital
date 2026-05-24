// controllers/search.controller.js
// Full-text + geo search with PostGIS, pg_trgm, and Redis caching

import { db } from "../config/db.js";
import { redis } from "../config/redis.js";

const CACHE_TTL = 60; // seconds

export async function search(req, res) {
  try {
    const {
      q = "",
      type,
      category,
      country,
      city,
      lat,
      lng,
      radius_km = 50,
      price_min,
      price_max,
      currency = "GHS",
      condition,
      verified_only = false,
      min_rating,
      sort = "relevance",
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const where = ["l.status = 'active'"];

    // ── Full-text search ────────────────────────────────────
    let rankExpr = "0";
    if (q.trim()) {
      params.push(q.trim());
      where.push(`l.search_vector @@ plainto_tsquery('english', $${params.length})`);
      rankExpr = `ts_rank(l.search_vector, plainto_tsquery('english', $${params.length}))`;
    }

    // ── Type filter ─────────────────────────────────────────
    if (type && type !== "all") {
      params.push(type);
      where.push(`l.type = $${params.length}`);
    }

    // ── Category filter ─────────────────────────────────────
    if (category) {
      params.push(category);
      where.push(`c.slug = $${params.length}`);
    }

    // ── Price range ─────────────────────────────────────────
    if (price_min) {
      params.push(parseFloat(price_min));
      where.push(`l.price >= $${params.length}`);
    }
    if (price_max) {
      params.push(parseFloat(price_max));
      where.push(`l.price <= $${params.length}`);
    }

    // ── Currency ────────────────────────────────────────────
    if (currency) {
      params.push(currency.toUpperCase());
      where.push(`l.price_currency = $${params.length}`);
    }

    // ── Location filters ────────────────────────────────────
    if (country) {
      const countries = country.split(",").map(c => c.trim().toUpperCase());
      params.push(countries);
      where.push(`l.country = ANY($${params.length})`);
    }

    // ── Geo radius filter (PostGIS) ─────────────────────────
    if (lat && lng) {
      const radiusMeters = parseFloat(radius_km) * 1000;
      params.push(parseFloat(lat), parseFloat(lng), radiusMeters);
      where.push(`
        (l.location IS NULL OR
         ST_DWithin(
           l.location,
           ST_SetSRID(ST_MakePoint($${params.length-1}, $${params.length-2}), 4326)::geography,
           $${params.length}
         ))`
      );
    }

    // ── Verified sellers only ───────────────────────────────
    if (verified_only === "true") {
      where.push("sp.is_verified = true");
    }

    // ── Minimum rating ──────────────────────────────────────
    let havingClause = "";
    if (min_rating) {
      havingClause = `HAVING COALESCE(AVG(r.rating), 0) >= ${parseFloat(min_rating)}`;
    }

    // ── Sort ────────────────────────────────────────────────
    const orderBy = {
      relevance:  q.trim() ? `${rankExpr} DESC, l.is_featured DESC, l.created_at DESC` : "l.is_featured DESC, l.created_at DESC",
      newest:     "l.created_at DESC",
      price_asc:  "l.price ASC NULLS LAST",
      price_desc: "l.price DESC NULLS LAST",
      rating:     "avg_rating DESC NULLS LAST",
      views:      "l.views_count DESC",
      distance:   lat && lng ? `ST_Distance(l.location, ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)::geography) ASC NULLS LAST` : "l.created_at DESC",
    }[sort] || "l.is_featured DESC, l.created_at DESC";

    params.push(parseInt(limit), offset);

    // ── Main query ──────────────────────────────────────────
    const sql = `
      SELECT
        l.id, l.title, l.slug, l.type, l.status,
        l.price, l.price_max, l.price_currency, l.price_label, l.is_negotiable,
        l.location_text, l.country, l.city, l.is_remote, l.is_featured,
        l.views_count, l.saves_count, l.tags, l.metadata, l.created_at,
        u.id          AS seller_id,
        u.full_name   AS seller_name,
        u.username    AS seller_username,
        sp.business_name,
        sp.is_verified AS seller_verified,
        sp.plan        AS seller_plan,
        sp.response_rate,
        (SELECT li.url FROM listing_images li
         WHERE li.listing_id = l.id AND li.is_primary = true
         ORDER BY li.sort_order LIMIT 1)           AS primary_image,
        COALESCE(AVG(r.rating), 0)::numeric(3,1)   AS avg_rating,
        COUNT(DISTINCT r.id)                        AS review_count,
        ${rankExpr}                                 AS relevance_score,
        COUNT(*) OVER()                             AS total_count
      FROM listings l
      JOIN users u          ON u.id = l.seller_id
      LEFT JOIN seller_profiles sp ON sp.user_id = l.seller_id
      LEFT JOIN categories c ON c.id = l.category_id
      LEFT JOIN reviews r   ON r.listing_id = l.id
      WHERE ${where.join(" AND ")}
      GROUP BY l.id, u.id, u.full_name, u.username,
               sp.business_name, sp.is_verified, sp.plan, sp.response_rate
      ${havingClause}
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    // ── Cache key ───────────────────────────────────────────
    const cacheKey = `search:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return res.json({ ...JSON.parse(cached), cached: true });
    }

    const result = await db.query(sql, params);
    const total = parseInt(result.rows[0]?.total_count || 0);

    const response = {
      listings: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        type: row.type,
        price: row.price,
        priceMax: row.price_max,
        priceCurrency: row.price_currency,
        priceLabel: row.price_label,
        isNegotiable: row.is_negotiable,
        locationText: row.location_text,
        country: row.country,
        city: row.city,
        isRemote: row.is_remote,
        isFeatured: row.is_featured,
        viewsCount: row.views_count,
        savesCount: row.saves_count,
        tags: row.tags,
        primaryImage: row.primary_image,
        avgRating: parseFloat(row.avg_rating),
        reviewCount: parseInt(row.review_count),
        createdAt: row.created_at,
        seller: {
          id: row.seller_id,
          name: row.seller_name,
          username: row.seller_username,
          businessName: row.business_name,
          isVerified: row.seller_verified,
          plan: row.seller_plan,
          responseRate: row.response_rate,
        },
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasNext: offset + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
      query: { q, type, category, sort },
    };

    // Cache for 60 seconds
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(response)).catch(() => {});

    res.json(response);
  } catch (err) {
    console.error("search:", err);
    res.status(500).json({ message: "Search failed. Please try again." });
  }
}

// ── AUTOCOMPLETE SUGGESTIONS ────────────────────────────────
export async function suggest(req, res) {
  try {
    const { q = "", limit = 8 } = req.query;
    if (q.length < 2) return res.json({ suggestions: [] });

    const cacheKey = `suggest:${q.toLowerCase()}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return res.json({ suggestions: JSON.parse(cached) });

    const result = await db.query(
      `SELECT DISTINCT title, type, slug
       FROM listings
       WHERE status = 'active'
         AND search_vector @@ to_tsquery('english', $1 || ':*')
       ORDER BY views_count DESC
       LIMIT $2`,
      [q.trim().replace(/\s+/g, " & "), parseInt(limit)]
    );

    const suggestions = result.rows.map(r => ({
      text: r.title,
      type: r.type,
      slug: r.slug,
    }));

    await redis.setex(cacheKey, 300, JSON.stringify(suggestions)).catch(() => {});
    res.json({ suggestions });
  } catch (err) {
    console.error("suggest:", err);
    res.json({ suggestions: [] });
  }
}

// ── TRENDING SEARCHES ───────────────────────────────────────
export async function trending(req, res) {
  try {
    const cached = await redis.get("trending:searches").catch(() => null);
    if (cached) return res.json({ trending: JSON.parse(cached) });

    // In production: pull from search analytics table
    const hardcoded = [
      { term: "iPhone 15", count: 8420, type: "product" },
      { term: "Apartments Accra", count: 6210, type: "rental" },
      { term: "Remote Jobs", count: 5890, type: "job" },
      { term: "Toyota RAV4", count: 4320, type: "product" },
      { term: "Web Design", count: 3780, type: "service" },
      { term: "Ankara Fashion", count: 2940, type: "product" },
    ];

    await redis.setex("trending:searches", 3600, JSON.stringify(hardcoded)).catch(() => {});
    res.json({ trending: hardcoded });
  } catch (err) {
    res.json({ trending: [] });
  }
}

// ── FACETED COUNTS (for filter badges) ─────────────────────
export async function facets(req, res) {
  try {
    const { q = "", country } = req.query;
    const params = [];
    const where = ["l.status = 'active'"];

    if (q.trim()) {
      params.push(q.trim());
      where.push(`l.search_vector @@ plainto_tsquery('english', $${params.length})`);
    }

    const [typeResult, catResult] = await Promise.all([
      db.query(
        `SELECT l.type, COUNT(*) AS count FROM listings l WHERE ${where.join(" AND ")} GROUP BY l.type`,
        params
      ),
      db.query(
        `SELECT c.name, c.slug, COUNT(*) AS count
         FROM listings l
         JOIN categories c ON c.id = l.category_id
         WHERE ${where.join(" AND ")}
         GROUP BY c.name, c.slug ORDER BY count DESC LIMIT 10`,
        params
      ),
    ]);

    res.json({
      byType: typeResult.rows,
      byCategory: catResult.rows,
    });
  } catch (err) {
    console.error("facets:", err);
    res.json({ byType: [], byCategory: [] });
  }
}
