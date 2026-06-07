import jwt from "jsonwebtoken";
// routes/auth.routes.js
import { Router } from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import * as auth from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10, message: { message: "Too many attempts. Please wait 15 minutes." } });
const strictLimiter = rateLimit({ windowMs: 60*60*1000, max: 5, message: { message: "Too many requests. Please wait 1 hour." } });

// Validation helpers
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

// ── ROUTES ──────────────────────────────────────────────────
router.post("/register",
  authLimiter,
  [
    body("fullName").trim().isLength({ min: 2, max: 120 }).withMessage("Full name required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("country").notEmpty().withMessage("Country required"),
    body("accountType").optional().isIn(["buyer","seller","individual_seller"]),
  ],
  validate, auth.register
);

router.post("/login",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate, auth.login
);

router.post("/verify-email",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("Invalid OTP"),
  ],
  validate, auth.verifyEmail
);

router.post("/resend-otp",
  strictLimiter,
  [body("email").isEmail().normalizeEmail()],
  validate, auth.resendOtp
);

router.post("/refresh", auth.refreshToken);

router.post("/logout", authenticate, auth.logout);

router.post("/forgot-password",
  strictLimiter,
  [body("email").isEmail().normalizeEmail()],
  validate, auth.forgotPassword
);

router.post("/reset-password",
  authLimiter,
  [
    body("token").notEmpty(),
    body("newPassword").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate, auth.resetPassword
);

router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user.otp_code !== otp) return res.status(400).json({ message: 'Invalid OTP code' });
    if (new Date() > new Date(user.otp_expires_at)) return res.status(400).json({ message: 'OTP has expired. Please login again.' });
    await db.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = $1', [user.id]);
    const accessToken = jwt.sign({ sub: user.id, type: 'access' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  } catch(err) { console.error('verify-login-otp:', err); res.status(500).json({ message: 'Verification failed' }); }
});

export default router;
