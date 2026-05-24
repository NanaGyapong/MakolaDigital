// middleware/admin.js
import { addAuditLog } from "../services/audit.service.js";

// Only allow admin role
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
}

// Log all admin write actions automatically
export function auditMiddleware(req, res, next) {
  const original = res.json.bind(res);
  res.json = (body) => {
    if (["POST","PATCH","DELETE"].includes(req.method) && res.statusCode < 400 && req.user?.role === "admin") {
      addAuditLog(req.user.id, req.method + " " + req.path, {
        body: req.body, params: req.params, statusCode: res.statusCode
      }).catch(console.error);
    }
    return original(body);
  };
  next();
}

// Rate limit admin actions (extra cautious)
export function adminRateLimit(req, res, next) {
  // In production use express-rate-limit with Redis store
  next();
}
