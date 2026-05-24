// jobs/email.queue.js
// Bull queue for async, reliable email delivery with retry logic

import Queue from "bull";
import { sendEmail } from "../email/email.service.js";
import { db } from "../config/db.js";
import { v4 as uuid } from "uuid";

// ── Queue init ─────────────────────────────────────────────────
export const emailQueue = new Queue("makola:emails", process.env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 }, // 5s, 25s, 125s
    removeOnComplete: 100,  // keep last 100 completed jobs
    removeOnFail: 500,      // keep last 500 failed for debugging
    timeout: 30000,         // 30s timeout per attempt
  },
});

// ── Worker ────────────────────────────────────────────────────
emailQueue.process("send-email", 5, async (job) => {
  const { to, templateName, data, logId } = job.data;
  await sendEmail({ to, templateName, data });
  // Update log record to "sent"
  if (logId) {
    await db.query(
      "UPDATE email_logs SET status=$1, sent_at=NOW() WHERE id=$2",
      ["sent", logId]
    ).catch(() => {});
  }
  return { sent: true };
});

// ── Event handlers ─────────────────────────────────────────────
emailQueue.on("failed", async (job, err) => {
  console.error(`[email-queue] Job ${job.id} failed (attempt ${job.attemptsMade}):`, err.message);
  if (job.data.logId) {
    await db.query(
      "UPDATE email_logs SET status=$1, error=$2 WHERE id=$3",
      [job.attemptsMade >= job.opts.attempts ? "failed" : "retrying", err.message, job.data.logId]
    ).catch(() => {});
  }
});

emailQueue.on("completed", (job) => {
  console.log(`[email-queue] Job ${job.id} completed (${job.data.templateName} → ${job.data.to})`);
});

// ── Public API ─────────────────────────────────────────────────
export async function queueEmail({ to, templateName, data, priority = "normal", delay = 0 }) {
  // Check user email preferences before sending
  const prefs = await getUserEmailPrefs(to);
  if (!isAllowed(templateName, prefs)) {
    console.log(`[email-queue] Skipped ${templateName} → ${to} (user opted out)`);
    return null;
  }

  // Log to DB for tracking
  const logId = uuid();
  await db.query(
    `INSERT INTO email_logs (id, recipient, template, status, queued_at)
     VALUES ($1, $2, $3, 'queued', NOW())`,
    [logId, to, templateName]
  ).catch(() => {});

  const priorityMap = { critical: 1, high: 5, normal: 10, low: 20 };
  const job = await emailQueue.add("send-email",
    { to, templateName, data, logId },
    {
      priority: priorityMap[priority] || 10,
      delay,
      jobId: `${templateName}:${to}:${Date.now()}`,
    }
  );

  return job;
}

// ── Check user email preferences ───────────────────────────────
async function getUserEmailPrefs(email) {
  try {
    const r = await db.query(
      "SELECT email_preferences FROM users WHERE email=$1",
      [email]
    );
    return r.rows[0]?.email_preferences || {};
  } catch { return {}; }
}

// ── Email category gate ─────────────────────────────────────────
const TRANSACTIONAL = new Set([
  "verify-email", "forgot-password", "order-confirmed",
  "new-order-seller", "payment-failed", "dispute-opened", "kyc-result",
]);

function isAllowed(templateName, prefs) {
  // Always send transactional emails
  if (TRANSACTIONAL.has(templateName)) return true;
  // Check marketing/notification prefs
  if (templateName === "weekly-digest" && prefs.marketing === false) return false;
  if (templateName === "seller-weekly-stats" && prefs.analytics === false) return false;
  if (templateName === "listing-expiring" && prefs.listing_alerts === false) return false;
  if (templateName === "new-message" && prefs.messages === false) return false;
  return true;
}

// ── Batch/scheduled helpers ─────────────────────────────────────
export async function scheduleWeeklyDigests() {
  const buyers = await db.query(
    `SELECT u.email, u.full_name,
            COUNT(sl.listing_id) AS saved_count
     FROM users u
     LEFT JOIN saved_listings sl ON sl.user_id = u.id
     WHERE u.role = 'buyer' AND u.is_active = true
       AND (u.email_preferences->>'marketing')::boolean IS NOT FALSE
     GROUP BY u.id
     ORDER BY u.last_seen_at DESC
     LIMIT 10000`
  );

  for (const user of buyers.rows) {
    await queueEmail({
      to: user.email,
      templateName: "weekly-digest",
      data: {
        name: user.full_name.split(" ")[0],
        savedCount: parseInt(user.saved_count),
        newMatchCount: Math.floor(Math.random() * 20) + 5, // replace with real data
        topListings: [],
      },
      priority: "low",
      delay: Math.random() * 3600000, // stagger over 1 hour
    });
  }
  console.log(`[email] Queued ${buyers.rows.length} weekly digests`);
}

export async function scheduleSellerWeeklyStats() {
  const sellers = await db.query(
    `SELECT u.email, u.full_name, sp.business_name,
            COALESCE(SUM(o.total * 0.97), 0) AS week_revenue,
            COUNT(o.id) AS total_orders,
            COALESCE(SUM(l.views_count), 0) AS profile_views
     FROM users u
     JOIN seller_profiles sp ON sp.user_id = u.id
     LEFT JOIN listings l ON l.seller_id = u.id
     LEFT JOIN orders o ON o.seller_id = u.id
       AND o.created_at >= NOW() - INTERVAL '7 days'
       AND o.status = 'completed'
     WHERE u.is_active = true
     GROUP BY u.id, sp.business_name
     HAVING COALESCE(SUM(o.total), 0) > 0 OR COALESCE(SUM(l.views_count), 0) > 0`
  );

  for (const seller of sellers.rows) {
    await queueEmail({
      to: seller.email,
      templateName: "seller-weekly-stats",
      data: {
        sellerName: seller.full_name.split(" ")[0],
        weekRevenue: parseFloat(seller.week_revenue).toFixed(2),
        currency: "GH₵",
        totalOrders: parseInt(seller.total_orders),
        profileViews: parseInt(seller.profile_views),
        dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
      },
      priority: "low",
    });
  }
}
