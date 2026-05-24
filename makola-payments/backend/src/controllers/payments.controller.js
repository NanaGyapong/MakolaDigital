// controllers/payments.controller.js
import { v4 as uuid } from "uuid";
import { db } from "../config/db.js";
import { initiatePayment, verifyPayment, refundPayment, calculateFees, selectGateway } from "../payments/payment.router.js";
import { queueEmail } from "../jobs/email.queue.js";

// ── POST /api/v1/payments/initiate ───────────────────────────
export async function initiate(req, res) {
  try {
    const { orderId, currency, country, provider, callbackUrl } = req.body;
    const userId = req.user.id;

    // Load order
    const orderResult = await db.query(
      `SELECT o.*, l.title AS listing_title, u.email AS seller_email,
              buyer.email AS buyer_email, buyer.full_name AS buyer_name
       FROM orders o
       JOIN listings l ON l.id = o.listing_id
       JOIN users u ON u.id = o.seller_id
       JOIN users buyer ON buyer.id = o.buyer_id
       WHERE o.id = $1 AND o.buyer_id = $2`,
      [orderId, userId]
    );
    if (!orderResult.rows.length) return res.status(404).json({ message: "Order not found" });
    const order = orderResult.rows[0];
    if (order.status !== "pending") return res.status(400).json({ message: `Order is already ${order.status}` });

    const fees = calculateFees(order.total, currency);
    const gateway = provider || selectGateway(currency, country);

    const result = await initiatePayment({
      provider: gateway,
      email: order.buyer_email,
      amount: fees.total,
      currency,
      country,
      orderId,
      customerName: order.buyer_name,
      metadata: { listingTitle: order.listing_title, buyerId: userId },
      callbackUrl,
    });

    // Log payment attempt
    await db.query(
      `INSERT INTO payments (id, order_id, payer_id, amount, currency, method, status, provider_ref, provider_data, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,NOW())`,
      [uuid(), orderId, userId, fees.total, currency, gateway, result.reference || result.txRef, JSON.stringify(result)]
    );

    res.json({ ...result, fees, gateway });
  } catch (err) {
    console.error("initiate payment:", err);
    res.status(500).json({ message: err.message || "Payment initiation failed" });
  }
}

// ── POST /api/v1/payments/verify ─────────────────────────────
export async function verify(req, res) {
  try {
    const { reference, provider, transactionId, orderId } = req.body;

    const verified = await verifyPayment({ provider, reference, transactionId });

    if (verified.status !== "paid") {
      return res.status(400).json({ message: `Payment status: ${verified.status}`, status: verified.status });
    }

    // Idempotency: check if already processed
    const existing = await db.query(
      "SELECT id FROM payments WHERE provider_ref=$1 AND status='paid'",
      [reference || transactionId]
    );
    if (existing.rows.length) {
      return res.json({ success: true, alreadyProcessed: true, payment: existing.rows[0] });
    }

    // Update payment record
    await db.query(
      `UPDATE payments SET status='paid', paid_at=NOW(), provider_data=provider_data || $1
       WHERE provider_ref=$2`,
      [JSON.stringify(verified), reference || transactionId]
    );

    // Update order status
    const oId = orderId || verified.metadata?.orderId;
    if (oId) {
      await db.query(
        "UPDATE orders SET status='confirmed', updated_at=NOW() WHERE id=$1",
        [oId]
      );

      // Send confirmation emails
      const order = await db.query(
        `SELECT o.*, l.title AS listing_title, buyer.email, buyer.full_name,
                seller.email AS seller_email, seller.full_name AS seller_name
         FROM orders o
         JOIN listings l ON l.id = o.listing_id
         JOIN users buyer ON buyer.id = o.buyer_id
         JOIN users seller ON seller.id = o.seller_id
         WHERE o.id = $1`,
        [oId]
      );
      const ord = order.rows[0];
      if (ord) {
        // Buyer confirmation
        await queueEmail({
          to: ord.email,
          templateName: "order-confirmed",
          data: {
            buyerName: ord.full_name?.split(" ")[0],
            sellerName: ord.seller_name,
            orderRef: oId.slice(0, 12).toUpperCase(),
            listingTitle: ord.listing_title,
            amount: verified.amount.toLocaleString(),
            currency: verified.currency,
            payMethod: verified.channel?.replace(/_/g, " "),
          },
          priority: "critical",
        });
        // Seller notification
        await queueEmail({
          to: ord.seller_email,
          templateName: "new-order-seller",
          data: {
            sellerName: ord.seller_name?.split(" ")[0],
            buyerName: ord.full_name,
            orderRef: oId.slice(0, 12).toUpperCase(),
            listingTitle: ord.listing_title,
            amount: verified.amount.toLocaleString(),
            currency: verified.currency,
            payoutAmount: (verified.amount * 0.97).toFixed(2),
          },
          priority: "critical",
        });
      }
    }

    res.json({ success: true, payment: verified });
  } catch (err) {
    console.error("verify payment:", err);
    res.status(500).json({ message: err.message || "Verification failed" });
  }
}

// ── GET /api/v1/payments/fees ─────────────────────────────────
export async function getFees(req, res) {
  try {
    const { amount, currency, country } = req.query;
    if (!amount || !currency) return res.status(400).json({ message: "amount and currency required" });
    const fees = calculateFees(amount, currency, country);
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── POST /api/v1/payments/:id/refund (admin) ─────────────────
export async function refund(req, res) {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const result = await db.query(
      "SELECT * FROM payments WHERE id=$1",
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Payment not found" });
    const payment = result.rows[0];
    if (payment.status !== "paid") return res.status(400).json({ message: "Payment is not in paid status" });

    const refundResult = await refundPayment({
      provider: payment.method,
      transactionId: payment.provider_ref,
      paymentIntentId: payment.provider_ref,
      amount,
      reason,
    });

    await db.query(
      "UPDATE payments SET status='refunded', provider_data=provider_data||$1 WHERE id=$2",
      [JSON.stringify({ refund: refundResult }), id]
    );

    // Update order
    await db.query(
      "UPDATE orders SET status='cancelled', updated_at=NOW() WHERE id=(SELECT order_id FROM payments WHERE id=$1)",
      [id]
    );

    res.json({ success: true, refund: refundResult });
  } catch (err) {
    console.error("refund:", err);
    res.status(500).json({ message: err.message || "Refund failed" });
  }
}

// ── GET /api/v1/payments/history ─────────────────────────────
export async function getHistory(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await db.query(
      `SELECT p.*, o.listing_id, l.title AS listing_title
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       JOIN listings l ON l.id = o.listing_id
       WHERE p.payer_id=$1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, (page-1)*limit]
    );
    res.json({ payments: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to load payment history" });
  }
}
