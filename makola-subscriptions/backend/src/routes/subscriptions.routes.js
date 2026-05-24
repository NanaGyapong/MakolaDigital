// routes/subscriptions.routes.js
import { Router } from "express";
import { body, validationResult } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import * as subs from "../controllers/subscriptions.controller.js";

const router = Router();
const validate = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ message: e.array()[0].msg });
  next();
};

// Public
router.get("/plans", subs.getPlans);

// Authenticated
router.use(authenticate);
router.get("/current",   subs.getCurrent);
router.get("/invoices",  subs.getInvoices);

router.post("/subscribe", [
  body("planId").isIn(["starter","pro","enterprise"]).withMessage("Invalid plan"),
  body("billing").optional().isIn(["monthly","annual"]),
  body("startTrial").optional().isBoolean(),
], validate, subs.subscribe);

router.post("/verify",  [body("reference").notEmpty()], validate, subs.verifySubscription);
router.post("/upgrade", [body("planId").notEmpty()],    validate, subs.upgradeSubscription);
router.post("/cancel",  subs.cancelSubscription);

export default router;
