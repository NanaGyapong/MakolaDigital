import { Router } from "express";
import { sendPushNotification } from "./push.routes.js";
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
    // Send push notification to receiver
    sendPushNotification(
      receiverId,
      "New message on Makola Digital 💬",
      body.length > 60 ? body.slice(0, 60) + "..." : body,
      "/dashboard/inbox"
    ).catch(() => {});
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


// Get unread message count
router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = false",
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

// Grouped threads for buyer dashboard
router.get("/threads", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT ON (l.id, other_user_id)
         l.id as listing_id,
         l.title as listing_title,
         CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as other_user_id,
         COALESCE(u.display_name, u.full_name, u.email) as other_user_name,
         u.avatar_url as other_user_avatar,
         m.body as last_message,
         m.created_at as last_message_at,
         COUNT(CASE WHEN m.receiver_id = $1 AND m.is_read = false THEN 1 END) OVER (PARTITION BY l.id, CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END) as unread_count
       FROM messages m
       JOIN listings l ON l.id = m.listing_id
       JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY l.id, other_user_id, m.created_at DESC`,
      [req.user.id]
    );
    const threads = result.rows.map(r => ({
      listing_id: r.listing_id,
      listing_title: r.listing_title,
      last_message: r.last_message,
      last_message_at: r.last_message_at,
      unread_count: parseInt(r.unread_count) || 0,
      other_user: {
        id: r.other_user_id,
        name: r.other_user_name,
        avatar: r.other_user_avatar,
      },
    }));
    res.json({ threads });
  } catch (err) {
    console.error("threads:", err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
});
