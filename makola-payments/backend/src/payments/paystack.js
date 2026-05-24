// payments/paystack.js
// Paystack integration — Ghana & Nigeria (MoMo, Card, Bank)
// Docs: https://paystack.com/docs/api

import axios from "axios";

const BASE = "https://api.paystack.co";
const SECRET = process.env.PAYSTACK_SECRET_KEY;

const ps = axios.create({
  baseURL: BASE,
  headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
});

// ── Initiate payment ────────────────────────────────────────
export async function initiatePaystack({ email, amount, currency = "GHS", orderId, metadata = {}, callbackUrl }) {
  // Paystack amounts are in kobo/pesewas (smallest unit)
  const amountInSubunit = Math.round(parseFloat(amount) * 100);

  const { data } = await ps.post("/transaction/initialize", {
    email,
    amount: amountInSubunit,
    currency: currency.toUpperCase(),
    reference: `MKL-PS-${orderId}-${Date.now()}`,
    callback_url: callbackUrl || `${process.env.CLIENT_URL}/payments/verify`,
    metadata: {
      orderId,
      platform: "makola-digital",
      ...metadata,
    },
    channels: getPaystackChannels(currency),
  });

  return {
    provider: "paystack",
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
    accessCode: data.data.access_code,
  };
}

// ── Verify payment ──────────────────────────────────────────
export async function verifyPaystack(reference) {
  const { data } = await ps.get(`/transaction/verify/${reference}`);
  const tx = data.data;

  return {
    provider: "paystack",
    reference: tx.reference,
    status: tx.status === "success" ? "paid" : tx.status,
    amount: tx.amount / 100,
    currency: tx.currency,
    paidAt: tx.paid_at,
    channel: tx.channel,
    customerEmail: tx.customer?.email,
    metadata: tx.metadata,
    raw: tx,
  };
}

// ── Initiate refund ─────────────────────────────────────────
export async function refundPaystack({ transactionId, amount, reason }) {
  const { data } = await ps.post("/refund", {
    transaction: transactionId,
    amount: amount ? Math.round(amount * 100) : undefined,
    merchant_note: reason,
    customer_note: reason,
  });
  return { refundId: data.data.id, status: data.data.status };
}

// ── Transfer to seller (payout) ─────────────────────────────
export async function paystackTransfer({ amount, currency, recipientCode, reason, reference }) {
  // Step 1: create transfer
  const { data } = await ps.post("/transfer", {
    source: "balance",
    amount: Math.round(amount * 100),
    currency,
    recipient: recipientCode,
    reason,
    reference: reference || `PAYOUT-${Date.now()}`,
  });
  return { transferCode: data.data.transfer_code, status: data.data.status };
}

// ── Create transfer recipient (seller bank/MoMo) ────────────
export async function createPaystackRecipient({ type, name, accountNumber, bankCode, currency }) {
  const { data } = await ps.post("/transferrecipient", {
    type: type || "mobile_money",
    name,
    account_number: accountNumber,
    bank_code: bankCode,
    currency,
  });
  return { recipientCode: data.data.recipient_code, id: data.data.id };
}

// ── Verify webhook signature ────────────────────────────────
export function verifyPaystackWebhook(rawBody, signature) {
  const crypto = await import("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

// ── Supported channels by currency ─────────────────────────
function getPaystackChannels(currency) {
  const map = {
    GHS: ["mobile_money", "card", "bank"],
    NGN: ["card", "bank", "ussd", "bank_transfer"],
    USD: ["card"],
    ZAR: ["card"],
  };
  return map[currency.toUpperCase()] || ["card"];
}

// ── Mobile Money networks by country ───────────────────────
export const MOMO_NETWORKS = {
  GH: [
    { name: "MTN Mobile Money", code: "MTN" },
    { name: "Vodafone Cash", code: "VDF" },
    { name: "AirtelTigo Money", code: "ATL" },
  ],
  NG: [
    { name: "MTN", code: "MTN" },
    { name: "Airtel", code: "Airtel" },
  ],
};
