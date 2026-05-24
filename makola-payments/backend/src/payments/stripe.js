// payments/stripe.js
// Stripe — Diaspora payments (USD, GBP, EUR)
// Docs: https://stripe.com/docs/api

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

// ── Initiate Payment Intent ──────────────────────────────────
export async function initiateStripe({ amount, currency, orderId, customerEmail, metadata = {} }) {
  // Stripe amounts in smallest unit (cents, pence)
  const amountInCents = Math.round(parseFloat(amount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: currency.toLowerCase(),
    receipt_email: customerEmail,
    metadata: { orderId, platform: "makola-digital", ...metadata },
    automatic_payment_methods: { enabled: true },
    description: `Makola Digital — Order #${orderId}`,
  });

  return {
    provider: "stripe",
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

// ── Retrieve & verify ────────────────────────────────────────
export async function verifyStripe(paymentIntentId) {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    provider: "stripe",
    reference: pi.id,
    status: pi.status === "succeeded" ? "paid" : pi.status,
    amount: pi.amount / 100,
    currency: pi.currency.toUpperCase(),
    paidAt: pi.status === "succeeded" ? new Date(pi.created * 1000).toISOString() : null,
    channel: pi.payment_method_types?.[0] || "card",
    customerEmail: pi.receipt_email,
    metadata: pi.metadata,
    raw: pi,
  };
}

// ── Refund ───────────────────────────────────────────────────
export async function refundStripe({ paymentIntentId, amount, reason }) {
  const refundParams = {
    payment_intent: paymentIntentId,
    reason: reason || "requested_by_customer",
  };
  if (amount) refundParams.amount = Math.round(amount * 100);

  const refund = await stripe.refunds.create(refundParams);
  return { refundId: refund.id, status: refund.status };
}

// ── Create Stripe Connect account (seller payouts) ───────────
export async function createStripeConnectAccount({ email, country = "GH", businessName }) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    country,
    business_type: "individual",
    capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    business_profile: { name: businessName },
  });
  return { accountId: account.id };
}

// ── Onboarding link for seller ───────────────────────────────
export async function stripeConnectOnboardingLink(accountId) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.CLIENT_URL}/dashboard/payments?stripe=refresh`,
    return_url:  `${process.env.CLIENT_URL}/dashboard/payments?stripe=success`,
    type: "account_onboarding",
  });
  return link.url;
}

// ── Transfer payout to seller ────────────────────────────────
export async function stripeTransfer({ amount, currency, destinationAccountId, orderId }) {
  const transfer = await stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    destination: destinationAccountId,
    transfer_group: `ORDER-${orderId}`,
    metadata: { orderId, platform: "makola-digital" },
  });
  return { transferId: transfer.id };
}

// ── Construct & verify webhook event ────────────────────────
export function constructStripeEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export { stripe };
