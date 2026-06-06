import { Router } from "express";
import { db } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Send message or offer
router.post("/", authenticate, async (req, res) => {
  try {
    const { listingId, receiverId, body, offerAmount, type } = req.body;
    await db.query(
      `INSERT INTO messages (listing_id, sender_id, receiver_id, body, offer_amount, type, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
      [listingId, req.user.id, receiverId, body, offerAmount || null, type || "message"]
    );
    res.status(201).json({ message: "Message sent" });
  } catch (err) {
    console.error("send message:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Get inbox
router.get("/inbox", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, 
       l.title as listing_title,
       us.full_name as sender_name,
       ur.full_name as receiver_name
       FROM messages m
       JOIN listings l ON l.id = m.listing_id
       JOIN users us ON us.id = m.sender_id
       JOIN users ur ON ur.id = m.receiver_id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error("inbox:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Mark as read
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    await db.query("UPDATE messages SET is_read = true WHERE id = $1 AND receiver_id = $2", [req.params.id, req.user.id]);
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
});

export default router;
