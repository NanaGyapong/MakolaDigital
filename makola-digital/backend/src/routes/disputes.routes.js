import { Router } from "express";
import { db } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*, l.title as listing_title,
       ub.full_name as buyer_name, us.full_name as seller_name
       FROM disputes d
       JOIN listings l ON l.id = d.listing_id
       JOIN users ub ON ub.id = d.buyer_id
       JOIN users us ON us.id = d.seller_id
       WHERE d.status = 'open'
       ORDER BY d.created_at DESC`
    );
    res.json({ disputes: result.rows });
  } catch (err) {
    console.error("disputes:", err);
    res.status(500).json({ message: "Failed to fetch disputes" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { listingId, sellerId, reason } = req.body;
    await db.query(
      `INSERT INTO disputes (id, listing_id, buyer_id, seller_id, reason, status, created_at)
       VALUES ($1,$2,$3,$4,$5,'open',NOW())`,
      [uuid(), listingId, req.user.id, sellerId, reason]
    );
    res.status(201).json({ message: "Dispute submitted" });
  } catch (err) {
    console.error("create dispute:", err);
    res.status(500).json({ message: "Failed to submit dispute" });
  }
});

router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { action } = req.body;
    await db.query("UPDATE disputes SET status = $1, updated_at = NOW() WHERE id = $2", [action, req.params.id]);
    res.json({ message: "Dispute resolved" });
  } catch (err) {
    res.status(500).json({ message: "Failed to resolve dispute" });
  }
});

export default router;
