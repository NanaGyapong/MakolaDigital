// controllers/subscriptions.controller.js
// Handles plan management, Paystack recurring billing, and enforcement

import { v4 as uuid } from "uuid";
import { db } from "../config/db.js";
import { redis } from "../config/redis.js";
import { initiatePaystack, verifyPaystack } from "../payments/paystack.js";
import { queueEmail } from "../jobs/email.queue.js";

// ── Plan definitions ─────────────────────────────────────────
export const PLANS = {
  free: {
    id: "free", name: "Free", price: 0, currency: "GHS",
    commission: 0.05,
    limits: { listings: 10, boosts: 0, photos: 1, teamMembers: 1, apiCalls: 0 },
    features: { analytics: "basic", support: "email", kycBadge: false, proBadge: false, escrow: false },
  },
  starter: {
    id: "starter", name: "Starter",
    price: { monthly: 150, annual: 1440 }, currency: "GHS",
    commission: 0.04,
    limits: { listings: 30, boosts: 2, photos: 8, teamMembers: 1, apiCalls: 0 },
    features: { analytics: "standard", support: "email", kycBadge: true, proBadge: false, escrow: false },
    trialDays: 14,
  },
  pro: {
    id: "pro", name: "Pro",
    price: { monthly: 300, annual: 2880 }, currency: "GHS",
    commission: 0.03,
    limits: { listings: -1, boosts: 5, photos: 8, teamMembers: 3, apiCalls: 10000 },
    features: { analytics: "advanced", support: "priority", kycBadge: true, proBadge: true, escrow: true },
    trialDays: 14,
  },
  enterprise: {
    id: "enterprise", name: "Enterprise",
    price: null, currency: "GHS",
    commission: 0.02,
    limits: { listings: -1, boosts: -1, photos: -1, teamMembers: -1, apiCalls: -1 },
    features: { analytics: "custom", support: "dedicated", kycBadge: true, proBadge: true, escrow: true },
  },
};

// ── GET /api/v1/subscriptions/plans ──────────────────────────
export async function getPlans(req, res) {
  const plans = Object.values(PLANS).map(p => ({
    ...p,
    // Don't expose internal commission directly in public response
  }));
  res.json({ plans });
}

// ── GET /api/v1/subscriptions/current ────────────────────────
export async function getCurrent(req, res) {
  try {
    const sub = await getActiveSub(req.user.id);
    const plan = PLANS[sub?.plan_id || "free"];

    // Fetch current usage
    const usage = await getUsage(req.user.id);

    res.json({
      subscription: sub,
      plan,
      usage,
      nextBillingDate: sub?.current_period_end,
      isTrial: sub?.is_trial,
      trialEndsAt: sub?.trial_ends_at,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load subscription" });
  }
}

// ── POST /api/v1/subscriptions/subscribe ─────────────────────
export async function subscribe(req, res) {
  try {
    const { planId, billing = "monthly", startTrial = true } = req.body;
    const userId = req.user.id;
    const plan = PLANS[planId];

    if (!plan || plan.id === "free") {
      return res.status(400).json({ message: "Invalid plan" });
    }
    if (plan.id === "enterprise") {
      return res.status(400).json({ message: "Contact sales for Enterprise pricing" });
    }

    // Check existing subscription
    const existing = await getActiveSub(userId);
    if (existing && existing.plan_id !== "free" && !existing.is_trial) {
      return res.status(400).json({ message: "Already subscribed. Upgrade or cancel first." });
    }

    // Start free trial
    if (startTrial && plan.trialDays) {
      const trialEnd = new Date(Date.now() + plan.trialDays * 86400000);
      await db.query(
        `INSERT INTO subscriptions (id, user_id, plan_id, billing_period, status, is_trial,
          trial_ends_at, current_period_start, current_period_end, created_at)
         VALUES ($1,$2,$3,$4,'trialing',true,$5,NOW(),$5,NOW())
         ON CONFLICT (user_id) DO UPDATE
         SET plan_id=$3, billing_period=$4, status='trialing', is_trial=true,
             trial_ends_at=$5, current_period_end=$5, updated_at=NOW()`,
        [uuid(), userId, planId, billing, trialEnd]
      );

      // Bust plan cache
      await redis.del(`plan:${userId}`).catch(() => {});

      await queueEmail({
        to: req.user.email,
        templateName: "welcome",
        data: { name: req.user.fullName?.split(" ")[0], accountType: "seller" },
      });

      return res.json({
        message: `${plan.trialDays}-day free trial started`,
        trialEndsAt: trialEnd,
        requiresPayment: false,
      });
    }

    // Paid subscription — initiate payment
    const amount = billing === "annual" ? plan.price.annual : plan.price.monthly;
    const orderId = uuid();

    const payment = await initiatePaystack({
      email: req.user.email,
      amount,
      currency: plan.currency,
      orderId,
      metadata: { userId, planId, billing, type: "subscription" },
      callbackUrl: `${process.env.CLIENT_URL}/dashboard/billing?sub=confirm`,
    });

    // Create pending subscription record
    await db.query(
      `INSERT INTO subscriptions (id, user_id, plan_id, billing_period, status, payment_reference, created_at)
       VALUES ($1,$2,$3,$4,'pending',$5,NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET plan_id=$3, billing_period=$4, status='pending', payment_reference=$5, updated_at=NOW()`,
      [orderId, userId, planId, billing, payment.reference]
    );

    res.json({
      ...payment,
      requiresPayment: true,
      amount,
      currency: plan.currency,
    });
  } catch (err) {
    console.error("subscribe:", err);
    res.status(500).json({ message: err.message || "Subscription failed" });
  }
}

// ── POST /api/v1/subscriptions/verify ────────────────────────
export async function verifySubscription(req, res) {
  try {
    const { reference } = req.body;
    const verified = await verifyPaystack(reference);

    if (verified.status !== "paid") {
      return res.status(400).json({ message: "Payment not confirmed" });
    }

    const { userId, planId, billing } = verified.metadata;
    const plan = PLANS[planId];
    const periodEnd = billing === "annual"
      ? new Date(Date.now() + 365 * 86400000)
      : new Date(Date.now() + 30 * 86400000);

    await db.query(
      `UPDATE subscriptions SET
         status='active', is_trial=false,
         current_period_start=NOW(), current_period_end=$1,
         paystack_subscription_code=$2, updated_at=NOW()
       WHERE payment_reference=$3`,
      [periodEnd, verified.metadata?.subscriptionCode || null, reference]
    );

    // Invalidate plan cache
    await redis.del(`plan:${userId}`).catch(() => {});

    // Email confirmation
    await queueEmail({
      to: verified.customerEmail,
      templateName: "order-confirmed",
      data: {
        buyerName: "there",
        sellerName: "Makola Digital",
        orderRef: reference.slice(0, 12).toUpperCase(),
        listingTitle: `${plan.name} Plan (${billing})`,
        amount: verified.amount.toLocaleString(),
        currency: verified.currency,
        payMethod: verified.channel,
      },
      priority: "critical",
    });

    res.json({ success: true, plan: planId, activatedAt: new Date(), expiresAt: periodEnd });
  } catch (err) {
    console.error("verifySubscription:", err);
    res.status(500).json({ message: err.message || "Verification failed" });
  }
}

// ── POST /api/v1/subscriptions/cancel ────────────────────────
export async function cancelSubscription(req, res) {
  try {
    const sub = await getActiveSub(req.user.id);
    if (!sub) return res.status(404).json({ message: "No active subscription" });

    await db.query(
      "UPDATE subscriptions SET cancel_at_period_end=true, updated_at=NOW() WHERE user_id=$1",
      [req.user.id]
    );

    res.json({
      message: "Subscription will cancel at end of billing period",
      cancelsAt: sub.current_period_end,
    });
  } catch (err) {
    res.status(500).json({ message: "Cancellation failed" });
  }
}

// ── POST /api/v1/subscriptions/upgrade ───────────────────────
export async function upgradeSubscription(req, res) {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan || plan.id === "free") return res.status(400).json({ message: "Invalid plan" });

    const current = await getActiveSub(req.user.id);
    const currentPlan = PLANS[current?.plan_id || "free"];

    // Prorate: calculate days remaining on current plan
    const daysLeft = current?.current_period_end
      ? Math.max(0, (new Date(current.current_period_end) - Date.now()) / 86400000)
      : 0;
    const dailyRate = (currentPlan.price?.monthly || 0) / 30;
    const credit = Math.round(daysLeft * dailyRate * 100) / 100;

    await db.query(
      "UPDATE subscriptions SET plan_id=$1, updated_at=NOW() WHERE user_id=$2",
      [planId, req.user.id]
    );

    await redis.del(`plan:${req.user.id}`).catch(() => {});

    res.json({
      message: `Upgraded to ${plan.name}`,
      credit,
      newPlan: plan,
    });
  } catch (err) {
    res.status(500).json({ message: "Upgrade failed" });
  }
}

// ── GET /api/v1/subscriptions/invoices ───────────────────────
export async function getInvoices(req, res) {
  try {
    const result = await db.query(
      `SELECT * FROM subscription_invoices WHERE user_id=$1 ORDER BY created_at DESC LIMIT 24`,
      [req.user.id]
    );
    res.json({ invoices: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to load invoices" });
  }
}

// ── MIDDLEWARE: requirePlan ───────────────────────────────────
// Use as middleware on any route that needs a certain plan
export function requirePlan(...allowedPlans) {
  return async (req, res, next) => {
    try {
      const plan = await getUserPlan(req.user.id);
      if (!allowedPlans.includes(plan)) {
        return res.status(403).json({
          message: `This feature requires a ${allowedPlans.join(" or ")} plan`,
          currentPlan: plan,
          upgradeUrl: "/pricing",
        });
      }
      req.userPlan = plan;
      next();
    } catch {
      res.status(500).json({ message: "Plan check failed" });
    }
  };
}

// ── MIDDLEWARE: enforceLimits ─────────────────────────────────
export async function enforceListing(req, res, next) {
  try {
    const plan = await getUserPlan(req.user.id);
    const planDef = PLANS[plan];
    const limit = planDef.limits.listings;
    if (limit === -1) return next(); // unlimited

    const count = await db.query(
      "SELECT COUNT(*) FROM listings WHERE seller_id=$1 AND status='active'",
      [req.user.id]
    );
    if (parseInt(count.rows[0].count) >= limit) {
      return res.status(403).json({
        message: `Your ${planDef.name} plan allows ${limit} active listings. Upgrade to add more.`,
        limit,
        currentPlan: plan,
        upgradeUrl: "/pricing",
      });
    }
    next();
  } catch {
    next();
  }
}

// ── HELPERS ───────────────────────────────────────────────────
async function getActiveSub(userId) {
  const r = await db.query(
    `SELECT * FROM subscriptions WHERE user_id=$1 AND status IN ('active','trialing')
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return r.rows[0] || null;
}

export async function getUserPlan(userId) {
  const cached = await redis.get(`plan:${userId}`).catch(() => null);
  if (cached) return cached;

  const sub = await getActiveSub(userId);
  const plan = sub?.plan_id || "free";

  // If trial expired, downgrade to free
  if (sub?.is_trial && sub?.trial_ends_at && new Date(sub.trial_ends_at) < new Date()) {
    await db.query(
      "UPDATE subscriptions SET status='expired', updated_at=NOW() WHERE user_id=$1",
      [userId]
    );
    await redis.setex(`plan:${userId}`, 300, "free").catch(() => {});
    return "free";
  }

  await redis.setex(`plan:${userId}`, 300, plan).catch(() => {});
  return plan;
}

async function getUsage(userId) {
  const [listings, boosts, apiCalls] = await Promise.all([
    db.query("SELECT COUNT(*) FROM listings WHERE seller_id=$1 AND status='active'", [userId]),
    db.query(
      "SELECT COUNT(*) FROM listings WHERE seller_id=$1 AND is_featured=true AND featured_until > NOW()",
      [userId]
    ),
    db.query(
      "SELECT COUNT(*) FROM api_logs WHERE user_id=$1 AND created_at > DATE_TRUNC('month',NOW())",
      [userId]
    ).catch(() => ({ rows: [{ count: "0" }] })),
  ]);
  return {
    listings: parseInt(listings.rows[0].count),
    boosts: parseInt(boosts.rows[0].count),
    apiCalls: parseInt(apiCalls.rows[0].count),
  };
}
