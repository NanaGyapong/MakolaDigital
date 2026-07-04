import { Router } from "express";
import { db } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import webpush from "web-push";

const router = Router();

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Save push subscription
router.post("/subscribe", authenticate, async (req, res) => {
  try {
    const { subscription } = req.body;
    await db.query(
      `INSERT INTO push_subscriptions (user_id, subscription)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET subscription = $2`,
      [req.user.id, JSON.stringify(subscription)]
    );
    res.json({ message: "Subscribed to push notifications" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unsubscribe
router.delete("/unsubscribe", authenticate, async (req, res) => {
  try {
    await db.query("DELETE FROM push_subscriptions WHERE user_id = $1", [req.user.id]);
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send push notification to a user
export async function sendPushNotification(userId, title, body, url) {
  try {
    const result = await db.query(
      "SELECT subscription FROM push_subscriptions WHERE user_id = $1",
      [userId]
    );
    if (!result.rows[0]) return;
    const subscription = JSON.parse(result.rows[0].subscription);
    await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
  } catch (err) {
    console.error("Push notification error:", err.message);
  }
}

export default router;
