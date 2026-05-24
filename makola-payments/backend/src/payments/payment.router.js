// payments/payment.router.js
// Auto-selects the right gateway based on currency and country

import { initiatePaystack, verifyPaystack, refundPaystack, paystackTransfer } from "./paystack.js";
import { initiateFlutterwave, verifyFlutterwave, verifyFlutterwaveByRef, refundFlutterwave, flutterwaveTransfer } from "./flutterwave.js";
import { initiateStripe, verifyStripe, refundStripe, stripeTransfer } from "./stripe.js";

// ── Gateway selection rules ──────────────────────────────────
export function selectGateway(currency, country) {
  const c = currency?.toUpperCase();
  const cc = country?.toUpperCase();

  // Diaspora: USD, GBP, EUR → Stripe
  if (["USD","GBP","EUR"].includes(c)) return "stripe";

  // Ghana: Paystack (best MoMo support for GHS)
  if (c === "GHS" || cc === "GH") return "paystack";

  // Nigeria: Paystack (best NGN support)
  if (c === "NGN" || cc === "NG") return "paystack";

  // East/Southern Africa: Flutterwave
  if (["KES","UGX","TZS","RWF","ZAR","MWK","ZMW","ETB"].includes(c)) return "flutterwave";

  // West Africa (non-GH/NG): Flutterwave
  if (["XOF","XAF","GNF","SLL","LRD","GMD"].includes(c)) return "flutterwave";

  // Default: Flutterwave (broadest Africa coverage)
  return "flutterwave";
}

// ── Unified initiate ─────────────────────────────────────────
export async function initiatePayment({ provider, email, amount, currency, country, orderId, customerName, customerPhone, metadata, callbackUrl }) {
  const gateway = provider || selectGateway(currency, country);

  switch (gateway) {
    case "paystack":
      return initiatePaystack({ email, amount, currency, orderId, metadata, callbackUrl });

    case "flutterwave":
      return initiateFlutterwave({ email, amount, currency, orderId, customerName, customerPhone, metadata, redirectUrl: callbackUrl });

    case "stripe":
      return initiateStripe({ amount, currency, orderId, customerEmail: email, metadata });

    default:
      throw new Error(`Unknown payment gateway: ${gateway}`);
  }
}

// ── Unified verify ───────────────────────────────────────────
export async function verifyPayment({ provider, reference, transactionId }) {
  switch (provider) {
    case "paystack":
      return verifyPaystack(reference);
    case "flutterwave":
      return transactionId
        ? verifyFlutterwave(transactionId)
        : verifyFlutterwaveByRef(reference);
    case "stripe":
      return verifyStripe(reference); // reference = paymentIntentId for Stripe
    default:
      // Auto-detect by reference prefix
      if (reference?.startsWith("MKL-PS-")) return verifyPaystack(reference);
      if (reference?.startsWith("MKL-FW-")) return verifyFlutterwaveByRef(reference);
      throw new Error(`Cannot detect provider from reference: ${reference}`);
  }
}

// ── Unified refund ───────────────────────────────────────────
export async function refundPayment({ provider, transactionId, paymentIntentId, amount, reason }) {
  switch (provider) {
    case "paystack":
      return refundPaystack({ transactionId, amount, reason });
    case "flutterwave":
      return refundFlutterwave({ transactionId, amount, comments: reason });
    case "stripe":
      return refundStripe({ paymentIntentId, amount, reason });
    default:
      throw new Error(`Unknown provider for refund: ${provider}`);
  }
}

// ── Fee calculation ──────────────────────────────────────────
export function calculateFees(amount, currency) {
  const amt = parseFloat(amount);
  const gateway = selectGateway(currency, null);

  let gatewayFee, platformFee, total;

  // Paystack: 1.5% + GHS 0 (local), 3.9% + GHS 10 (intl) cap GHS 2000
  if (gateway === "paystack") {
    gatewayFee = Math.min(amt * 0.015, 200 * 100) / 100;
    if (gatewayFee < 100) gatewayFee = amt * 0.015;
  }
  // Flutterwave: 1.4% (Africa) cap $10
  else if (gateway === "flutterwave") {
    gatewayFee = Math.min(amt * 0.014, 10);
  }
  // Stripe: 2.9% + $0.30 (card)
  else {
    gatewayFee = amt * 0.029 + 0.30;
  }

  const platformFeeRate = parseFloat(process.env.PLATFORM_FEE_PERCENT || "3") / 100;
  platformFee = amt * platformFeeRate;
  total = amt + platformFee;

  return {
    subtotal: amt,
    platformFee: Math.round(platformFee * 100) / 100,
    gatewayFee: Math.round(gatewayFee * 100) / 100,
    total: Math.round(total * 100) / 100,
    sellerPayout: Math.round((amt - gatewayFee) * 100) / 100,
    gateway,
    currency,
  };
}
