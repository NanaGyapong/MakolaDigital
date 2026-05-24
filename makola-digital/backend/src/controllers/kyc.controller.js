// controllers/kyc.controller.js
import { v4 as uuid } from "uuid";
import cloudinary from "../config/storage.js";
import { db } from "../config/db.js";
import { emailQueue } from "../jobs/email.job.js";

export async function submitKyc(req, res) {
  try {
    const userId = req.user.id;
    const { idType, idNumber, name: bizName, type: bizType, category, address, description, regNo } = req.body;

    // Check for existing pending/verified KYC
    const existing = await db.query("SELECT id, status FROM kyc_submissions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1", [userId]);
    if (existing.rows[0]?.status === "pending") {
      return res.status(400).json({ message: "You already have a KYC application under review" });
    }
    if (existing.rows[0]?.status === "verified") {
      return res.status(400).json({ message: "Your identity is already verified" });
    }

    // Upload files to Cloudinary
    const uploads = {};
    for (const [field, file] of Object.entries(req.files || {})) {
      const result = await cloudinary.uploader.upload(file[0].path, {
        folder: `makola/kyc/${userId}`,
        resource_type: "auto",
        access_mode: "authenticated", // private files
      });
      uploads[field] = result.secure_url;
    }

    // Insert KYC record
    const kycId = uuid();
    await db.query(
      `INSERT INTO kyc_submissions
       (id, user_id, id_type, id_number, id_front_url, id_back_url,
        business_name, business_type, business_category, business_address,
        business_description, business_reg_no, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',NOW())`,
      [kycId, userId, idType, idNumber, uploads.idFront || null, uploads.idBack || null,
       bizName, bizType, category, address, description, regNo || null]
    );

    // Update user kyc_status
    await db.query("UPDATE users SET kyc_status='pending', updated_at=NOW() WHERE id=$1", [userId]);

    // Update seller profile
    if (bizName) {
      await db.query(
        `UPDATE seller_profiles SET business_name=$1, business_reg_no=$2, updated_at=NOW() WHERE user_id=$3`,
        [bizName, regNo || null, userId]
      );
    }

    // Notify admin
    await emailQueue.add("kyc-submitted", {
      kycId, userId, userName: req.user.full_name, idType
    });

    res.status(201).json({ message: "KYC application submitted successfully", kycId });
  } catch (err) {
    console.error("submitKyc:", err);
    res.status(500).json({ message: "KYC submission failed. Please try again." });
  }
}

// Admin: approve/reject KYC
export async function reviewKyc(req, res) {
  try {
    const { id } = req.params;
    const { action, note } = req.body; // action: 'approve' | 'reject'
    if (!["approve","reject"].includes(action)) return res.status(400).json({ message: "Invalid action" });

    const result = await db.query("SELECT * FROM kyc_submissions WHERE id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "KYC not found" });
    const kyc = result.rows[0];

    const status = action === "approve" ? "verified" : "rejected";
    await db.query("UPDATE kyc_submissions SET status=$1, reviewed_by=$2, review_note=$3, reviewed_at=NOW() WHERE id=$4",
      [status, req.user.id, note || null, id]);

    await db.query("UPDATE users SET kyc_status=$1, updated_at=NOW() WHERE id=$2", [status, kyc.user_id]);

    if (action === "approve") {
      await db.query("UPDATE seller_profiles SET is_verified=true, verified_at=NOW() WHERE user_id=$1", [kyc.user_id]);
    }

    // Notify user
    const userResult = await db.query("SELECT email, full_name FROM users WHERE id=$1", [kyc.user_id]);
    if (userResult.rows[0]) {
      await emailQueue.add("kyc-result", { to: userResult.rows[0].email, name: userResult.rows[0].full_name, status, note });
    }

    res.json({ message: `KYC ${action}d successfully` });
  } catch (err) {
    console.error("reviewKyc:", err);
    res.status(500).json({ message: "Review failed" });
  }
}
