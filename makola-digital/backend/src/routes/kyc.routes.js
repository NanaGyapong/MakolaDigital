import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { db } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/submit", authenticate, upload.fields([
  { name: "idFront", maxCount: 1 },
  { name: "idBack", maxCount: 1 }
]), async (req, res) => {
  try {
    const { idType, idNumber, name, type, category, address, description, regNo } = req.body;

    const uploadToCloudinary = async (file, folder) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: `makola-digital/kyc/${req.user.id}`, resource_type: "image" },
          (error, result) => error ? reject(error) : resolve(result.secure_url)
        ).end(file.buffer);
      });
    };

    let idFrontUrl = null;
    let idBackUrl = null;

    if (req.files?.idFront) idFrontUrl = await uploadToCloudinary(req.files.idFront[0]);
    if (req.files?.idBack) idBackUrl = await uploadToCloudinary(req.files.idBack[0]);

    await db.query(
      `UPDATE users SET kyc_status = 'pending', updated_at = NOW() WHERE id = $1`,
      [req.user.id]
    );

    await db.query(
      `INSERT INTO seller_profiles (id, user_id, business_name, description, plan, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'free', NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         business_name = $2, description = $3`,
      [req.user.id, name || "My Business", description || ""]
    );

    res.json({ message: "KYC submitted successfully. We will review within 24 hours." });
  } catch (err) {
    console.error("kyc submit:", err);
    res.status(500).json({ message: "KYC submission failed" });
  }
});

export default router;

router.get("/applications", authenticate, async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const result = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.kyc_status, u.created_at,
       sp.business_name, sp.description
       FROM users u
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       WHERE u.kyc_status = $1
       ORDER BY u.created_at DESC`,
      [status]
    );
    res.json({ applications: result.rows });
  } catch (err) {
    console.error("kyc applications:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

router.patch("/applications/:userId", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["verified", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    await db.query("UPDATE users SET kyc_status = $1, updated_at = NOW() WHERE id = $2", [status, req.params.userId]);
    if (status === 'verified') {
      try {
        const user = await db.query('SELECT email, full_name FROM users WHERE id = $1', [req.params.userId]);
        if (user.rows[0]) {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Makola Digital <hello@makoladigital.online>',
            to: user.rows[0].email,
            subject: 'Your account is verified on Makola Digital!',
            html: `<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0A0A0A;color:#F0EDE8;border-radius:16px'>
              <h1 style='color:#E8533A'>🌍 Makola Digital</h1>
              <p>Hi ${user.rows[0].full_name},</p>
              <p>Congratulations! Your identity has been <strong style='color:#2D9E6B'>verified ✅</strong> on Makola Digital.</p>
              <p>You can now list your products and services. Buyers will see a verified badge on your listings.</p>
              <a href='https://makoladigital.online/sell' style='display:inline-block;background:#E8533A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin:16px 0'>Start Listing Now →</a>
              <p style='color:rgba(240,237,232,0.5);font-size:13px'>— The Makola Digital Team 🇬🇭</p>
            </div>`
          });
        }
      } catch(e) { console.error('verification email:', e.message); }
    }
    res.json({ message: 'KYC status updated' });
  } catch (err) {
    console.error("kyc update:", err);
    res.status(500).json({ message: "Failed to update KYC status" });
  }
});
