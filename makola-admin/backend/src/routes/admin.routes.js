// routes/admin.routes.js
import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import * as admin from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();
const validate = (req, res, next) => { const e=validationResult(req); if(!e.isEmpty()) return res.status(400).json({message:e.array()[0].msg}); next(); };

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

router.get("/stats", admin.getDashboardStats);
router.get("/kyc", admin.getKycQueue);
router.post("/kyc/:id/review",
  [body("action").isIn(["approve","reject"]), body("note").optional().isString().trim()],
  validate, admin.reviewKyc
);
router.get("/users", admin.getUsers);
router.patch("/users/:id/status",
  [body("action").isIn(["suspend","restore"]), body("reason").optional().isString()],
  validate, admin.updateUserStatus
);
router.get("/listings", admin.getFlaggedListings);
router.patch("/listings/:id/moderate",
  [body("action").isIn(["approve","remove","flag"]), body("reason").optional().isString()],
  validate, admin.moderateListing
);
router.get("/reports", admin.getReports);
router.get("/audit", admin.getAuditLog);

export default router;
