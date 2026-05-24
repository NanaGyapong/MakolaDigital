// push.service.js
// Web Push notification sender using VAPID keys
// npm install web-push

import webPush from "web-push";
import { db } from "./config/db.js";

webPush.setVapidDetails(
  `mailto:${process.env.FROM_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// ── Save subscription ─────────────────────────────────────────
export async function savePushSubscription(userId, subscription) {
  const { endpoint, keys } = subscription;
  await db.query(
    `INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
     ON CONFLICT (endpoint) DO UPDATE SET user_id=$1, updated_at=NOW()`,
    [userId, endpoint, keys.p256dh, keys.auth]
  );
}

// ── Remove subscription ───────────────────────────────────────
export async function removePushSubscription(endpoint) {
  await db.query("DELETE FROM push_subscriptions WHERE endpoint=$1", [endpoint]);
}

// ── Send push to one user ─────────────────────────────────────
export async function sendPushToUser(userId, payload) {
  const subs = await db.query(
    "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id=$1",
    [userId]
  );

  const results = await Promise.allSettled(
    subs.rows.map(sub =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { urgency: payload.urgency || "normal", TTL: payload.ttl || 86400 }
      ).catch(async err => {
        // Remove invalid subscriptions (410 = Gone)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await removePushSubscription(sub.endpoint);
        }
        throw err;
      })
    )
  );

  const sent = results.filter(r => r.status === "fulfilled").length;
  return { sent, total: subs.rows.length };
}

// ── Pre-built notification payloads ──────────────────────────
export const pushPayloads = {
  newMessage: (senderName, preview, conversationUrl) => ({
    title: `💬 ${senderName}`,
    body: preview.slice(0, 100),
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: "message",
    url: conversationUrl,
    actions: [
      { action: "reply", title: "Reply" },
      { action: "dismiss", title: "Dismiss" },
    ],
    urgency: "high",
    ttl: 3600,
  }),

  orderConfirmed: (listingTitle, amount, currency) => ({
    title: "✅ Order confirmed!",
    body: `Your payment for "${listingTitle}" was successful. ${currency} ${amount}`,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: "order",
    url: "/orders",
    urgency: "high",
    ttl: 86400,
  }),

  newOrder: (buyerName, listingTitle, payout) => ({
    title: "🎉 New sale!",
    body: `${buyerName} bought "${listingTitle}". Payout: ${payout}`,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: "order",
    url: "/dashboard/orders",
    actions: [{ action: "view", title: "View order" }],
    urgency: "high",
    ttl: 86400,
  }),

  kycApproved: () => ({
    title: "✅ You're verified!",
    body: "Your Verified badge is now live on all your listings.",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: "kyc",
    url: "/dashboard",
    ttl: 86400,
  }),

  listingExpiring: (listingTitle, daysLeft) => ({
    title: "⏰ Listing expiring soon",
    body: `"${listingTitle}" expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Renew now.`,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: "listing",
    url: "/dashboard/listings",
    ttl: 86400,
  }),
};

// ── Generate VAPID keys (run once) ───────────────────────────
// node -e "const wp=require('web-push');const k=wp.generateVAPIDKeys();console.log(k)"
// Add to .env:
// VAPID_PUBLIC_KEY=...
// VAPID_PRIVATE_KEY=...
// NEXT_PUBLIC_VAPID_PUBLIC_KEY=... (same as VAPID_PUBLIC_KEY)
