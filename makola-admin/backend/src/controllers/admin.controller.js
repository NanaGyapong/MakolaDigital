// controllers/admin.controller.js
import { db } from "../config/db.js";
import { emailQueue } from "../jobs/email.job.js";
import { addAuditLog } from "../services/audit.service.js";

// DASHBOARD STATS
export async function getDashboardStats(req, res) {
  try {
    const [users, listings, gmv, kycPending] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE is_active = true"),
      db.query("SELECT COUNT(*) FROM listings WHERE status = 'active'"),
      db.query("SELECT COALESCE(SUM(total),0) AS gmv FROM orders WHERE status='completed' AND created_at >= date_trunc('month', NOW())"),
      db.query("SELECT COUNT(*) FROM users WHERE kyc_status = 'pending'"),
    ]);
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      activeListings: parseInt(listings.rows[0].count),
      gmvThisMonth: parseFloat(gmv.rows[0].gmv),
      kycPending: parseInt(kycPending.rows[0].count),
    });
  } catch (err) { res.status(500).json({ message: "Failed to load stats" }); }
}

// KYC QUEUE
export async function getKycQueue(req, res) {
  try {
    const { status = "pending", search = "", page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [status];
    let extra = "";
    if (search) { params.push("%" + search + "%"); extra = " AND (u.full_name ILIKE  OR u.email ILIKE )"; }
    const result = await db.query(
      "SELECT k.*, u.full_name, u.email, u.country, COUNT(*) OVER() AS total FROM kyc_submissions k JOIN users u ON u.id=k.user_id WHERE k.status=" + extra + " ORDER BY k.created_at DESC LIMIT $" + (params.length+1) + " OFFSET $" + (params.length+2),
      [...params, limit, offset]
    );
    res.json({ applications: result.rows, total: parseInt(result.rows[0]?.total || 0) });
  } catch (err) { res.status(500).json({ message: "Failed to load KYC queue" }); }
}

// REVIEW KYC
export async function reviewKyc(req, res) {
  try {
    const { id } = req.params;
    const { action, note } = req.body;
    if (!["approve","reject"].includes(action)) return res.status(400).json({ message: "Invalid action" });
    const r = await db.query("SELECT k.*, u.email, u.full_name, k.user_id FROM kyc_submissions k JOIN users u ON u.id=k.user_id WHERE k.id=", [id]);
    if (!r.rows.length) return res.status(404).json({ message: "Not found" });
    if (r.rows[0].status !== "pending") return res.status(400).json({ message: "Already reviewed" });
    const kyc = r.rows[0];
    const status = action === "approve" ? "verified" : "rejected";
    await db.query("UPDATE kyc_submissions SET status=, review_note=, reviewed_by=, reviewed_at=NOW() WHERE id=", [status, note||null, req.user.id, id]);
    await db.query("UPDATE users SET kyc_status=, updated_at=NOW() WHERE id=", [status, kyc.user_id]);
    if (action === "approve") await db.query("UPDATE seller_profiles SET is_verified=true, verified_at=NOW() WHERE user_id=", [kyc.user_id]);
    await emailQueue.add("kyc-result", { to: kyc.email, name: kyc.full_name, status, note: note||null });
    await addAuditLog(req.user.id, action === "approve" ? "KYC_APPROVED" : "KYC_REJECTED", { kycId: id, note });
    res.json({ message: "KYC " + action + "d", status });
  } catch (err) { console.error(err); res.status(500).json({ message: "Review failed" }); }
}

// GET USERS
export async function getUsers(req, res) {
  try {
    const { search = "", role, page = 1, limit = 20 } = req.query;
    const params = [];
    const where = [];
    if (search) { params.push("%" + search + "%"); where.push("(u.full_name ILIKE $" + params.length + " OR u.email ILIKE $" + params.length + ")"); }
    if (role) { params.push(role); where.push("u.role=$" + params.length); }
    const result = await db.query(
      "SELECT u.id,u.full_name,u.email,u.role,u.country,u.kyc_status,u.is_active,u.created_at,sp.business_name,sp.is_verified,COUNT(*) OVER() AS total FROM users u LEFT JOIN seller_profiles sp ON sp.user_id=u.id" + (where.length ? " WHERE "+where.join(" AND ") : "") + " ORDER BY u.created_at DESC LIMIT $" + (params.length+1) + " OFFSET $" + (params.length+2),
      [...params, limit, (page-1)*limit]
    );
    res.json({ users: result.rows, total: parseInt(result.rows[0]?.total||0) });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
}

// SUSPEND / RESTORE USER
export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    if (id === req.user.id) return res.status(400).json({ message: "Cannot modify own account" });
    await db.query("UPDATE users SET is_active=, updated_at=NOW() WHERE id=", [action==="restore", id]);
    await addAuditLog(req.user.id, action==="suspend" ? "USER_SUSPENDED" : "USER_RESTORED", { targetUserId: id, reason });
    res.json({ message: "User " + action + "d" });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
}

// FLAGGED LISTINGS
export async function getFlaggedListings(req, res) {
  try {
    const { status = "flagged", page = 1, limit = 20 } = req.query;
    const result = await db.query(
      "SELECT l.*,u.full_name AS seller_name,u.email AS seller_email,sp.business_name,COUNT(r.id) AS report_count,COUNT(*) OVER() AS total FROM listings l JOIN users u ON u.id=l.seller_id LEFT JOIN seller_profiles sp ON sp.user_id=l.seller_id LEFT JOIN reports r ON r.listing_id=l.id WHERE l.status= GROUP BY l.id,u.full_name,u.email,sp.business_name ORDER BY report_count DESC LIMIT  OFFSET ",
      [status, limit, (page-1)*limit]
    );
    res.json({ listings: result.rows, total: parseInt(result.rows[0]?.total||0) });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
}

// MODERATE LISTING
export async function moderateListing(req, res) {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const statusMap = { approve: "active", remove: "removed", flag: "flagged" };
    await db.query("UPDATE listings SET status=, updated_at=NOW() WHERE id=", [statusMap[action], id]);
    await addAuditLog(req.user.id, "LISTING_"+action.toUpperCase(), { listingId: id, reason });
    res.json({ message: "Listing " + action + "d" });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
}

// REPORTS
export async function getReports(req, res) {
  try {
    const result = await db.query("SELECT r.*,reporter.full_name AS reporter_name,l.title AS listing_title FROM reports r JOIN users reporter ON reporter.id=r.reporter_id LEFT JOIN listings l ON l.id=r.listing_id WHERE r.status='open' ORDER BY r.created_at DESC");
    res.json({ reports: result.rows });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
}

// AUDIT LOG
export async function getAuditLog(req, res) {
  try {
    const result = await db.query("SELECT al.*,u.full_name AS admin_name FROM admin_audit_log al JOIN users u ON u.id=al.admin_id ORDER BY al.created_at DESC LIMIT 100");
    res.json({ logs: result.rows });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
}
