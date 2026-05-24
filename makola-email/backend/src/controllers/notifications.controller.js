// controllers/notifications.controller.js
import { db } from "../config/db.js";
import { queueEmail } from "../jobs/email.queue.js";

// GET /api/v1/notifications — user's in-app notifications
export async function getNotifications(req, res) {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;
    const where = ["n.user_id = $1"];
    if (unread_only === "true") where.push("n.is_read = false");

    const result = await db.query(
      `SELECT n.*, COUNT(*) OVER() AS total
       FROM notifications n
       WHERE ${where.join(" AND ")}
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const unreadCount = await db.query(
      "SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=false",
      [req.user.id]
    );

    res.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count),
      total: parseInt(result.rows[0]?.total || 0),
      page: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
}

// PATCH /api/v1/notifications/:id/read
export async function markRead(req, res) {
  try {
    await db.query(
      "UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
}

// PATCH /api/v1/notifications/read-all
export async function markAllRead(req, res) {
  try {
    await db.query(
      "UPDATE notifications SET is_read=true WHERE user_id=$1",
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
}

// GET /api/v1/notifications/preferences
export async function getPreferences(req, res) {
  try {
    const r = await db.query(
      "SELECT email_preferences FROM users WHERE id=$1",
      [req.user.id]
    );
    const prefs = r.rows[0]?.email_preferences || {};
    res.json({
      preferences: {
        messages:       prefs.messages       !== false,
        order_updates:  prefs.order_updates  !== false,
        listing_alerts: prefs.listing_alerts !== false,
        marketing:      prefs.marketing      !== false,
        analytics:      prefs.analytics      !== false,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
}

// PATCH /api/v1/notifications/preferences
export async function updatePreferences(req, res) {
  try {
    const { messages, order_updates, listing_alerts, marketing, analytics } = req.body;
    await db.query(
      `UPDATE users SET
         email_preferences = email_preferences ||
           jsonb_build_object(
             'messages',       $1::boolean,
             'order_updates',  $2::boolean,
             'listing_alerts', $3::boolean,
             'marketing',      $4::boolean,
             'analytics',      $5::boolean
           ),
         updated_at = NOW()
       WHERE id = $6`,
      [messages, order_updates, listing_alerts, marketing, analytics, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update preferences" });
  }
}

// GET /api/v1/notifications/email-logs (admin)
export async function getEmailLogs(req, res) {
  try {
    const { page = 1, limit = 50, template, status } = req.query;
    const params = [];
    const where = [];
    if (template) { params.push(template); where.push(`template=$${params.length}`); }
    if (status)   { params.push(status);   where.push(`status=$${params.length}`); }
    params.push(limit, (page - 1) * limit);

    const result = await db.query(
      `SELECT * FROM email_logs
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY queued_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
}

// POST /api/v1/notifications/test (admin — send test email)
export async function sendTestEmail(req, res) {
  try {
    const { template, to } = req.body;
    const testData = {
      "verify-email":        { name: "Test User", otp: "482917" },
      "welcome":             { name: "Test User", accountType: "seller" },
      "new-message":         { recipientName: "Kofi", senderName: "Ama", preview: "Hi! Is this still available?", listingTitle: "iPhone 15 Pro", conversationUrl: "#" },
      "order-confirmed":     { buyerName: "Kofi", sellerName: "TechHub GH", orderRef: "MKL-123456", listingTitle: "iPhone 15 Pro Max", amount: "8755", currency: "GH₵", payMethod: "Mobile Money (MTN)" },
      "kyc-result":          { name: "Kofi", status: "verified" },
      "listing-approved":    { sellerName: "Kofi", listingTitle: "iPhone 15 Pro Max 256GB", listingUrl: "#" },
      "review-received":     { sellerName: "Kofi", buyerName: "Ama", rating: 5, reviewText: "Excellent seller, fast delivery!", listingTitle: "iPhone 15 Pro", replyUrl: "#" },
      "seller-weekly-stats": { sellerName: "Kofi", weekRevenue: "4800", currency: "GH₵", totalOrders: 12, profileViews: 840, dashboardUrl: "#" },
    };

    if (!testData[template]) return res.status(400).json({ message: "Unknown template" });

    await queueEmail({ to: to || req.user.email, templateName: template, data: testData[template], priority: "high" });
    res.json({ success: true, message: `Test email queued: ${template} → ${to || req.user.email}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
