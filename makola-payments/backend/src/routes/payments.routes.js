// routes/payments.routes.js
import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as payments from "../controllers/payments.controller.js";
import { paystackWebhook, flutterwaveWebhook, stripeWebhook } from "../webhooks/webhooks.controller.js";
import rateLimit from "express-rate-limit";

const router = Router();
const validate = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ message: e.array()[0].msg });
  next();
};
const paymentLimit = rateLimit({ windowMs: 60 * 1000, max: 10 });

// ── Authenticated routes ─────────────────────────────────────
router.post("/initiate", authenticate, paymentLimit, [
  body("orderId").isUUID(),
  body("currency").isLength({ min: 3, max: 3 }),
  body("amount").optional().isFloat({ min: 0.01 }),
], validate, payments.initiate);

router.post("/verify", authenticate, paymentLimit, [
  body("reference").optional().isString(),
  body("provider").optional().isIn(["paystack","flutterwave","stripe"]),
  body("transactionId").optional().isString(),
], validate, payments.verify);

router.get("/fees", authenticate, [
  query("amount").isFloat({ min: 0.01 }),
  query("currency").isLength({ min: 3, max: 3 }),
], validate, payments.getFees);

router.get("/history", authenticate, payments.getHistory);

// Admin only
router.post("/:id/refund", authenticate, requireAdmin, [
  body("reason").notEmpty().withMessage("Reason required"),
  body("amount").optional().isFloat({ min: 0.01 }),
], validate, payments.refund);

// ── Webhook routes (no JWT — verified by signature) ──────────
// Raw body needed for Stripe signature verification
router.post("/webhook/paystack",
  express.json({ type: "*/*" }),
  (req, res, next) => { req.rawBody = JSON.stringify(req.body); next(); },
  paystackWebhook
);

router.post("/webhook/flutterwave",
  express.json({ type: "*/*" }),
  flutterwaveWebhook
);

router.post("/webhook/stripe",
  express.raw({ type: "application/json" }),
  (req, res, next) => { req.rawBody = req.body; req.body = JSON.parse(req.body); next(); },
  stripeWebhook
);

export default router;
