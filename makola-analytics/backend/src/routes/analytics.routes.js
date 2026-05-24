// routes/analytics.routes.js
import { Router } from "express";
import { query, validationResult } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import { requireSeller } from "../middleware/role.js";
import * as analytics from "../controllers/analytics.controller.js";

const router = Router();
const validate = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ message: e.array()[0].msg });
  next();
};

const periodValidation = [
  query("period").optional().isIn(["today","7d","30d","90d","12m","all"]).withMessage("Invalid period"),
];

// All routes require authenticated seller
router.use(authenticate, requireSeller);

router.get("/overview",  periodValidation, validate, analytics.getOverview);
router.get("/listings",  periodValidation, validate, analytics.getListingsAnalytics);
router.get("/traffic",   periodValidation, validate, analytics.getTrafficSources);
router.get("/insights",  analytics.getInsights);
router.get("/export",    periodValidation, validate, analytics.exportCSV);

export default router;
