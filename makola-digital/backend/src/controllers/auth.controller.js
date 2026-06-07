// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { db } from "../config/db.js";
import { emailQueue } from "../jobs/email.job.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH = process.env.JWT_REFRESH_SECRET;

function signAccess(userId) {
  return jwt.sign({ sub: userId, type: "access" }, JWT_SECRET, { expiresIn: "24h" });
}
function signRefresh(userId, remember = true) {
  return jwt.sign({ sub: userId, type: "refresh" }, JWT_REFRESH, { expiresIn: remember ? "30d" : "1d" });
}

// ── REGISTER ────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { fullName, email, phone, password, country, accountType = "buyer" } = req.body;

    // Check existing user
    const existing = await db.query("SELECT id FROM users WHERE email = $1 OR phone = $2", [email, phone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "An account with this email or phone already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(Math.random() * 1000);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const result = await db.query(
      `INSERT INTO users (id, full_name, email, phone, password_hash, username, country, role, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) RETURNING id, email, full_name`,
      [uuid(), fullName, email, phone, passwordHash, username, country, accountType === "seller" || accountType === "individual_seller" ? "seller" : "buyer"]
    );
    const user = result.rows[0];

    // Store OTP in Redis
    await req.redis.set(`otp:${email}`, otp, { EX: 600 });

    // Queue verification email
    await emailQueue.add("verify-email", { to: email, name: fullName, otp });

    // If seller, create seller profile
    if (accountType === "seller") {
      await db.query(
        "INSERT INTO seller_profiles (id, user_id, business_name, plan, created_at) VALUES ($1,$2,$3,'free',NOW())",
        [uuid(), user.id, fullName]
      );
    }

    res.status(201).json({ message: "Account created. Please verify your email.", userId: user.id });
  } catch (err) {
    console.error("register:", err);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
}

// ── LOGIN ────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password, remember = true } = req.body;

    const result = await db.query(
      "SELECT id, email, full_name, password_hash, role, email_verified, is_active FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (!user.is_active) return res.status(403).json({ message: "Your account has been suspended" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.email_verified) {
      return res.status(403).json({ message: "Please verify your email before logging in", code: "EMAIL_NOT_VERIFIED" });
    }

    // Update last seen
    await db.query("UPDATE users SET last_seen_at = NOW() WHERE id = $1", [user.id]);

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id, remember);

    // Store refresh token hash in DB
    const tokenHash = await bcrypt.hash(refreshToken, 8);
    await db.query(
      "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES ($1,$2,$3,$4,NOW())",
      [uuid(), user.id, tokenHash, new Date(Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000)]
    );


    // OTP for sellers and admins
    if (user.role === 'seller' || user.role === 'admin') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await db.query('UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3', [otp, otpExpiry, user.id]);
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Makola Digital <hello@makoladigital.online>',
        to: user.email,
        subject: 'Your Makola Digital login code',
        html: '<div style="font-family:sans-serif;padding:32px;background:#0A0A0A;color:#F0EDE8"><h2 style="color:#E8533A">Login Verification Code</h2><p>Hi ' + user.full_name + ',</p><p>Your login code is:</p><div style="background:#1A1A1A;padding:24px;text-align:center;border-radius:12px;margin:16px 0"><h1 style="font-size:48px;letter-spacing:8px;color:#E8533A;margin:0">' + otp + '</h1></div><p style="color:rgba(240,237,232,0.5)">Expires in 10 minutes. Do not share.</p></div>'
      });
      return res.json({ requiresOtp: true, email: user.email });
    }
    res.json({
      accessToken, refreshToken,
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role }
    });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
}

// ── VERIFY EMAIL ─────────────────────────────────────────────
export async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;

    const stored = await req.redis.get(`otp:${email}`);
    if (!stored || stored !== otp) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    await db.query("UPDATE users SET email_verified = true, updated_at = NOW() WHERE email = $1", [email]);
    await req.redis.del(`otp:${email}`);

    const result = await db.query("SELECT id, email, full_name, role FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);

    res.json({ message: "Email verified successfully", accessToken, refreshToken, user });
  } catch (err) {
    console.error("verifyEmail:", err);
    res.status(500).json({ message: "Verification failed" });
  }
}

// ── RESEND OTP ───────────────────────────────────────────────
export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    const result = await db.query("SELECT full_name FROM users WHERE email = $1", [email]);
    if (!result.rows.length) return res.status(404).json({ message: "User not found" });

    // Rate limit: max 3 resends per 15 mins
    const attempts = await req.redis.incr(`otp_attempts:${email}`);
    if (attempts === 1) await req.redis.expire(`otp_attempts:${email}`, 900);
    if (attempts > 3) return res.status(429).json({ message: "Too many attempts. Please wait 15 minutes." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await req.redis.set(`otp:${email}`, otp, { EX: 600 });
    await emailQueue.add("verify-email", { to: email, name: result.rows[0].full_name, otp });

    res.json({ message: "Verification code resent" });
  } catch (err) {
    console.error("resendOtp:", err);
    res.status(500).json({ message: "Failed to resend code" });
  }
}

// ── REFRESH TOKEN ────────────────────────────────────────────
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    const payload = jwt.verify(refreshToken, JWT_REFRESH);
    if (payload.type !== "refresh") return res.status(401).json({ message: "Invalid token type" });

    const newAccess = signAccess(payload.sub);
    res.json({ accessToken: newAccess });
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

// ── LOGOUT ───────────────────────────────────────────────────
export async function logout(req, res) {
  try {
    if (req.user?.id) {
      // Invalidate all refresh tokens for user (optional: only current one)
      await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [req.user.id]);
    }
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
}

// ── FORGOT PASSWORD ──────────────────────────────────────────
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const result = await db.query("SELECT id, full_name FROM users WHERE email = $1", [email]);

    // Always respond same way (don't leak whether email exists)
    res.json({ message: "If that email is registered, a reset link has been sent." });
    if (!result.rows.length) return;

    const user = result.rows[0];
    const token = uuid();
    await req.redis.setex(`pw_reset:${token}`, 1800, user.id); // 30 min

    await emailQueue.add("forgot-password", { to: email, name: user.full_name, token });
  } catch (err) {
    console.error("forgotPassword:", err);
    res.status(500).json({ message: "Request failed" });
  }
}

// ── RESET PASSWORD ───────────────────────────────────────────
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    const userId = await req.redis.get(`pw_reset:${token}`);
    if (!userId) return res.status(400).json({ message: "Invalid or expired reset link" });

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2", [hash, userId]);
    await req.redis.del(`pw_reset:${token}`);
    await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [userId]);

    res.json({ message: "Password reset successfully. Please log in." });
  } catch (err) {
    console.error("resetPassword:", err);
    res.status(500).json({ message: "Reset failed" });
  }
}
