import { Router } from "express";
import { db } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/listing/:listingId", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.full_name as reviewer_name
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.listing_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.listingId]
    );
    const avg = result.rows.length > 0
      ? result.rows.reduce((sum, r) => sum + r.rating, 0) / result.rows.length
      : 0;
    res.json({ reviews: result.rows, average: avg.toFixed(1), total: result.rows.length });
  } catch (err) {
    console.error("get reviews:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.post("/listing/:listingId", authenticate, async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const listing = await db.query("SELECT seller_id FROM listings WHERE id = $1", [req.params.listingId]);
    if (!listing.rows[0]) return res.status(404).json({ message: "Listing not found" });
    if (listing.rows[0].seller_id === req.user.id) return res.status(400).json({ message: "You cannot review your own listing" });

    const existing = await db.query("SELECT id FROM reviews WHERE listing_id = $1 AND reviewer_id = $2", [req.params.listingId, req.user.id]);
    if (existing.rows.length > 0) return res.status(409).json({ message: "You have already reviewed this listing" });

    await db.query(
      `INSERT INTO reviews (id, reviewer_id, seller_id, listing_id, rating, title, body, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
      [uuid(), req.user.id, listing.rows[0].seller_id, req.params.listingId, rating, title || null, body || null]
    );

    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    console.error("post review:", err);
    res.status(500).json({ message: "Failed to submit review" });
  }
});

export default router;
