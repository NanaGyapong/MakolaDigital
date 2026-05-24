// middleware/auth.js
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== "access") return res.status(401).json({ message: "Invalid token type" });

    const result = await db.query(
      "SELECT id, email, full_name, role, is_active FROM users WHERE id=$1",
      [payload.sub]
    );
    const user = result.rows[0];
    if (!user || !user.is_active) return res.status(401).json({ message: "User not found or inactive" });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Permission denied" });
    next();
  };
}

export function requireSeller(req, res, next) {
  return requireRole("seller", "admin")(req, res, next);
}
