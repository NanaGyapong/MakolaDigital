// routes/notifications.routes.js
import { Router } from "express";
import { body, query } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as n from "../controllers/notifications.controller.js";

const router = Router();
router.use(authenticate);

// In-app notifications
router.get("/",            n.getNotifications);
router.patch("/:id/read",  n.markRead);
router.patch("/read-all",  n.markAllRead);

// Email preferences
router.get("/preferences",    n.getPreferences);
router.patch("/preferences",  n.updatePreferences);

// Admin only
router.get("/email-logs",     requireAdmin, n.getEmailLogs);
router.post("/test",          requireAdmin, [
  body("template").notEmpty(),
  body("to").optional().isEmail(),
], n.sendTestEmail);

export default router;
