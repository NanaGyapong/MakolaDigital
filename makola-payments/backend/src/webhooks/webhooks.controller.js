// webhooks/webhooks.controller.js
// Handles incoming payment webhooks from Paystack, Flutterwave, Stripe
// All webhook endpoints skip JWT auth (verified by signature instead)

import { createHmac } from "crypto";
import { db } from "../config/db.js";
import { constructStripeEvent } from "../payments/stripe.js";
import { queueEmail } from "../jobs/email.queue.js";
import { v4 as uuid } from "uuid";

// ── Log all webhooks ─────────────────────────────────────────
async function logWebhook(provider, event, status, data) {
  await db.query(
    "INSERT INTO webhook_logs (id, provider, event_type, status, payload, created_at) VALUES ($1,$2,$3,$4,$5,NOW())",
    [uuid(), provider, event, status, JSON.stringify(data)]
  ).catch(() => {});
}

// ── PAYSTACK WEBHOOK ─────────────────────────────────────────
export async function paystackWebhook(req, res) {
  const signature = req.headers["x-paystack-signature"];
  const rawBody = req.rawBody; // set by express middleware

  // Verify signature
  const hash = createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody).digest("hex");
  if (hash !== signature) {
    await logWebhook("paystack", "unknown", "rejected", { reason: "invalid_signature" });
    return res.status(400).json({ message: "Invalid signature" });
  }

  // Always respond 200 immediately (Paystack requires <5s response)
  res.status(200).send("OK");

  const event = req.body;
  await logWebhook("paystack", event.event, "received", event);

  try {
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment({
          provider: "paystack",
          reference: event.data.reference,
          amount: event.data.amount / 100,
          currency: event.data.currency,
          metadata: event.data.metadata,
          customerEmail: event.data.customer?.email,
          channel: event.data.channel,
          paidAt: event.data.paid_at,
        });
        break;

      case "charge.failed":
        await handleFailedPayment({
          reference: event.data.reference,
          reason: event.data.gateway_response,
          metadata: event.data.metadata,
          customerEmail: event.data.customer?.email,
          amount: event.data.amount / 100,
          currency: event.data.currency,
        });
        break;

      case "transfer.success":
        await handleTransferSuccess(event.data);
        break;

      case "refund.processed":
        await handleRefundProcessed(event.data);
        break;

      default:
        console.log(`[webhook] Unhandled Paystack event: ${event.event}`);
    }
    await logWebhook("paystack", event.event, "processed", { reference: event.data?.reference });
  } catch (err) {
    console.error(`[webhook] Paystack ${event.event} error:`, err.message);
    await logWebhook("paystack", event.event, "error", { error: err.message });
  }
}

// ── FLUTTERWAVE WEBHOOK ──────────────────────────────────────
export async function flutterwaveWebhook(req, res) {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const signature = req.headers["verif-hash"];

  if (signature !== secretHash) {
    await logWebhook("flutterwave", "unknown", "rejected", { reason: "invalid_signature" });
    return res.status(401).json({ status: "error", message: "Invalid signature" });
  }

  res.status(200).send("OK");

  const event = req.body;
  await logWebhook("flutterwave", event.event, "received", event);

  try {
    if (event.event === "charge.completed" && event.data?.status === "successful") {
      await handleSuccessfulPayment({
        provider: "flutterwave",
        reference: event.data.tx_ref,
        flwRef: event.data.flw_ref,
        amount: event.data.amount,
        currency: event.data.currency,
        metadata: event.data.meta,
        customerEmail: event.data.customer?.email,
        channel: event.data.payment_type,
        paidAt: event.data.created_at,
      });
    } else if (event.event === "transfer.completed") {
      await handleTransferSuccess(event.data);
    }
    await logWebhook("flutterwave", event.event, "processed", { txRef: event.data?.tx_ref });
  } catch (err) {
    console.error(`[webhook] Flutterwave error:`, err.message);
    await logWebhook("flutterwave", event.event, "error", { error: err.message });
  }
}

// ── STRIPE WEBHOOK ───────────────────────────────────────────
export async function stripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = constructStripeEvent(req.rawBody, signature);
  } catch (err) {
    await logWebhook("stripe", "unknown", "rejected", { reason: err.message });
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  res.status(200).json({ received: true });
  await logWebhook("stripe", stripeEvent.type, "received", stripeEvent);

  try {
    const pi = stripeEvent.data.object;

    switch (stripeEvent.type) {
      case "payment_intent.succeeded":
        await handleSuccessfulPayment({
          provider: "stripe",
          reference: pi.id,
          amount: pi.amount / 100,
          currency: pi.currency.toUpperCase(),
          metadata: pi.metadata,
          customerEmail: pi.receipt_email,
          channel: pi.payment_method_types?.[0] || "card",
          paidAt: new Date(pi.created * 1000).toISOString(),
        });
        break;

      case "payment_intent.payment_failed":
        await handleFailedPayment({
          reference: pi.id,
          reason: pi.last_payment_error?.message,
          metadata: pi.metadata,
          customerEmail: pi.receipt_email,
          amount: pi.amount / 100,
          currency: pi.currency.toUpperCase(),
        });
        break;

      case "charge.refunded":
        await handleRefundProcessed({ reference: pi.payment_intent, amount: pi.amount_refunded / 100 });
        break;

      default:
        console.log(`[webhook] Unhandled Stripe event: ${stripeEvent.type}`);
    }
    await logWebhook("stripe", stripeEvent.type, "processed", { id: stripeEvent.id });
  } catch (err) {
    console.error(`[webhook] Stripe ${stripeEvent.type} error:`, err.message);
    await logWebhook("stripe", stripeEvent.type, "error", { error: err.message });
  }
}

// ══════════════════════════════════════════════════════════════
// SHARED HANDLERS
// ══════════════════════════════════════════════════════════════

async function handleSuccessfulPayment({ provider, reference, amount, currency, metadata, customerEmail, channel, paidAt }) {
  const orderId = metadata?.orderId || metadata?.order_id;

  // Idempotency check
  const dup = await db.query("SELECT id FROM payments WHERE provider_ref=$1 AND status='paid'", [reference]);
  if (dup.rows.length) return console.log(`[webhook] Duplicate payment: ${reference}`);

  // Update payment
  await db.query(
    `UPDATE payments SET status='paid', paid_at=$1, provider_data=provider_data||$2
     WHERE provider_ref=$3`,
    [paidAt || new Date(), JSON.stringify({ channel, verifiedViaWebhook: true }), reference]
  );

  if (orderId) {
    await db.query(
      "UPDATE orders SET status='confirmed', updated_at=NOW() WHERE id=$1 AND status='pending'",
      [orderId]
    );

    // Fetch order for emails
    const order = await db.query(
      `SELECT o.*, l.title AS listing_title, buyer.email, buyer.full_name,
              seller.email AS seller_email, seller.full_name AS seller_name
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       JOIN users buyer ON buyer.id = o.buyer_id
       JOIN users seller ON seller.id = o.seller_id
       WHERE o.id = $1`,
      [orderId]
    );
    const ord = order.rows[0];
    if (ord) {
      const orderRef = orderId.slice(0, 12).toUpperCase();
      await Promise.all([
        queueEmail({ to: ord.email, templateName: "order-confirmed", priority: "critical", data: {
          buyerName: ord.full_name?.split(" ")[0],
          sellerName: ord.seller_name, orderRef,
          listingTitle: ord.listing_title,
          amount: amount.toLocaleString(), currency,
          payMethod: channel?.replace(/_/g, " "),
        }}),
        queueEmail({ to: ord.seller_email, templateName: "new-order-seller", priority: "critical", data: {
          sellerName: ord.seller_name?.split(" ")[0],
          buyerName: ord.full_name, orderRef,
          listingTitle: ord.listing_title,
          amount: amount.toLocaleString(), currency,
          payoutAmount: (amount * 0.97).toFixed(2),
        }}),
      ]);
    }
  }
  console.log(`[webhook] Payment confirmed: ${reference} (${currency} ${amount})`);
}

async function handleFailedPayment({ reference, reason, metadata, customerEmail, amount, currency }) {
  await db.query(
    "UPDATE payments SET status='failed', provider_data=provider_data||$1 WHERE provider_ref=$2",
    [JSON.stringify({ failureReason: reason }), reference]
  );

  if (customerEmail) {
    const orderId = metadata?.orderId;
    const order = orderId ? await db.query(
      "SELECT l.title FROM orders o JOIN listings l ON l.id=o.listing_id WHERE o.id=$1",
      [orderId]
    ) : null;

    await queueEmail({
      to: customerEmail,
      templateName: "payment-failed",
      priority: "high",
      data: {
        name: "there",
        listingTitle: order?.rows[0]?.title || "your order",
        amount: amount?.toLocaleString(),
        currency,
        retryUrl: `${process.env.CLIENT_URL}/checkout/${orderId || ""}`,
      },
    });
  }
  console.log(`[webhook] Payment failed: ${reference} — ${reason}`);
}

async function handleTransferSuccess(data) {
  console.log("[webhook] Transfer/payout completed:", data.reference || data.id);
  // Update payout record if tracked
}

async function handleRefundProcessed(data) {
  await db.query(
    "UPDATE payments SET status='refunded' WHERE provider_ref=$1",
    [data.reference || data.id]
  );
  console.log("[webhook] Refund processed:", data.reference);
}
