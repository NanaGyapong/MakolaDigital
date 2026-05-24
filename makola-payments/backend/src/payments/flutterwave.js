// payments/flutterwave.js
// Flutterwave — Pan-Africa (GHS, NGN, KES, UGX, ZAR, EGP, TZS...)
// Docs: https://developer.flutterwave.com/docs

import axios from "axios";

const BASE = "https://api.flutterwave.com/v3";
const SECRET = process.env.FLUTTERWAVE_SECRET_KEY;

const fw = axios.create({
  baseURL: BASE,
  headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
});

// ── Supported currencies ─────────────────────────────────────
export const FW_CURRENCIES = [
  "GHS","NGN","KES","UGX","ZAR","EGP","TZS","RWF","XOF","XAF","GNF","SLL","LRD","GMD","SN","MWK"
];

// ── Initiate payment ─────────────────────────────────────────
export async function initiateFlutterwave({ email, amount, currency, orderId, customerName, customerPhone, metadata = {}, redirectUrl }) {
  const txRef = `MKL-FW-${orderId}-${Date.now()}`;

  const { data } = await fw.post("/payments", {
    tx_ref: txRef,
    amount: parseFloat(amount),
    currency: currency.toUpperCase(),
    redirect_url: redirectUrl || `${process.env.CLIENT_URL}/payments/verify?provider=flutterwave`,
    customer: { email, name: customerName, phonenumber: customerPhone },
    meta: { orderId, platform: "makola-digital", ...metadata },
    customizations: {
      title: "Makola Digital",
      description: `Order #${orderId}`,
      logo: `${process.env.CLIENT_URL}/logo.png`,
    },
    payment_options: getFlutterwaveOptions(currency),
  });

  return {
    provider: "flutterwave",
    paymentLink: data.data.link,
    txRef,
  };
}

// ── Verify payment ───────────────────────────────────────────
export async function verifyFlutterwave(transactionId) {
  const { data } = await fw.get(`/transactions/${transactionId}/verify`);
  const tx = data.data;

  return {
    provider: "flutterwave",
    reference: tx.tx_ref,
    flwRef: tx.flw_ref,
    status: tx.status === "successful" ? "paid" : tx.status,
    amount: tx.amount,
    chargedAmount: tx.charged_amount,
    currency: tx.currency,
    paidAt: tx.created_at,
    channel: tx.payment_type,
    customerEmail: tx.customer?.email,
    metadata: tx.meta,
    raw: tx,
  };
}

// ── Verify by tx_ref ─────────────────────────────────────────
export async function verifyFlutterwaveByRef(txRef) {
  const { data } = await fw.get(`/transactions?tx_ref=${txRef}`);
  const tx = data.data?.[0];
  if (!tx) throw new Error("Transaction not found");
  return verifyFlutterwave(tx.id);
}

// ── Initiate refund ──────────────────────────────────────────
export async function refundFlutterwave({ transactionId, amount, comments }) {
  const { data } = await fw.post(`/transactions/${transactionId}/refund`, {
    amount,
    comments: comments || "Customer refund",
  });
  return { refundId: data.data.id, status: data.data.status };
}

// ── Transfer (payout to seller) ──────────────────────────────
export async function flutterwaveTransfer({ amount, currency, accountNumber, accountBank, narration, reference, meta = {} }) {
  const { data } = await fw.post("/transfers", {
    account_bank: accountBank,
    account_number: accountNumber,
    amount,
    currency,
    narration: narration || "Makola seller payout",
    reference: reference || `PAYOUT-FW-${Date.now()}`,
    meta,
    debit_currency: currency,
  });
  return { transferId: data.data.id, status: data.data.status };
}

// ── Verify webhook ───────────────────────────────────────────
export function verifyFlutterwaveWebhook(rawBody, signature) {
  const crypto = require("crypto");
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const computedHash = crypto
    .createHmac("sha256", secretHash)
    .update(rawBody)
    .digest("hex");
  return computedHash === signature;
}

// ── Payment options by currency ──────────────────────────────
function getFlutterwaveOptions(currency) {
  const map = {
    GHS: "mobilemoney,card",
    NGN: "card,banktransfer,ussd",
    KES: "mpesa,card",
    UGX: "mobilemoney,card",
    ZAR: "card",
    EGP: "card",
    GBP: "card",
    USD: "card",
  };
  return map[currency] || "card";
}

// ── Get banks list ───────────────────────────────────────────
export async function flutterwaveBanks(country = "GH") {
  const { data } = await fw.get(`/banks/${country}`);
  return data.data;
}

// ── Get MoMo list ────────────────────────────────────────────
export async function flutterwaveMomoNetworks(country = "GH") {
  const networks = {
    GH: ["MTN","VODAFONE","TIGO"],
    UG: ["MTN","AIRTEL"],
    RW: ["MTN","AIRTEL"],
    ZM: ["MTN","AIRTEL"],
  };
  return networks[country] || [];
}
