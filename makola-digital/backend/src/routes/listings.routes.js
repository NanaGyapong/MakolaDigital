import { Router } from "express";
import { db } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { v4 as uuid } from "uuid";

const router = Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const { type, category, title, description, price, currency, priceLabel, isNegotiable, country, city, locationText, isRemote, images, phone, dialCode, showWhatsapp } = req.body;
    const contactPhone = phone ? (dialCode || "+233") + phone.replace(/^0/, "") : null;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + uuid().slice(0, 8);
    // Extract main category from subcategory string e.g. 'Beauty & Care > Skincare' -> 'Beauty & Health'
    const catMap = {
      'Beauty & Care': 'Beauty & Health',
      'Home & Furniture': 'Home & Garden',
      'Phones & Tablets': 'Electronics',
      'Electronics': 'Tech & Digital',
      'Food & Agriculture': 'Agriculture & Farm Produce',
      'Animals & Pets': 'Farm Animals & Pets',
      'Fashion': 'Fashion & Clothing',
      'Vehicles': 'Vehicles & Spare Parts',
      'Jobs': 'Jobs & Careers',
      'Property': 'Property & Land',
      'Services': 'Business Services',
      'Tech & Digital': 'Tech & Digital',
      'Education & Training': 'Education & Training',
      'Home Services': 'Home Services',
      'Arts & Crafts': 'Arts & Crafts',
      'Business Services': 'Business Services',
    };
    const mainCat = category?.includes(' > ') ? category.split(' > ')[0].trim() : category;
    const mappedCat = catMap[mainCat] || mainCat;
    const catResult = await db.query('SELECT id FROM categories WHERE name = $1 LIMIT 1', [mappedCat]);
    const categoryId = catResult.rows[0]?.id || 1;
    const result = await db.query(
      `INSERT INTO listings (id, seller_id, category_id, type, status, title, slug, description, price, price_currency, price_label, is_negotiable, country, city, location_text, is_remote, contact_phone, show_whatsapp, video, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'pending',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),NOW()) RETURNING id`,
      [uuid(), req.user.id, categoryId, type, title, slug, description, price || null, currency || "GHS", priceLabel || null, isNegotiable || false, country?.slice(0,2).toUpperCase() || "GH", city || null, locationText || null, isRemote || false, contactPhone, showWhatsapp || false, req.body.video || null]
    );
    const listingId = result.rows[0].id;
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.query("INSERT INTO listing_images (id, listing_id, url, sort_order, is_primary, created_at) VALUES ($1,$2,$3,$4,$5,NOW())", [uuid(), listingId, images[i], i, i === 0]);
      }
    }
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Makola Digital <hello@makoladigital.online>',
        to: 'nanababio18@gmail.com',
        subject: 'New listing pending review on Makola Digital',
        html: `<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0A0A0A;color:#F0EDE8;border-radius:16px'>
          <h1 style='color:#E8533A'>🌍 Makola Digital</h1>
          <p>A new listing has been submitted and needs your review.</p>
          <table style='width:100%;border-collapse:collapse;margin:16px 0'>
            <tr><td style='padding:8px;color:rgba(240,237,232,0.5);font-size:12px'>Title</td><td style='padding:8px;font-weight:700'>${title}</td></tr>
            <tr><td style='padding:8px;color:rgba(240,237,232,0.5);font-size:12px'>Type</td><td style='padding:8px;text-transform:capitalize'>${type}</td></tr>
            <tr><td style='padding:8px;color:rgba(240,237,232,0.5);font-size:12px'>Price</td><td style='padding:8px'>${currency || 'GHS'} ${price || 'Not set'}</td></tr>
            <tr><td style='padding:8px;color:rgba(240,237,232,0.5);font-size:12px'>Location</td><td style='padding:8px'>${locationText || city || 'Not set'}</td></tr>
          </table>
          <a href='https://makoladigital.online/admin/listings' style='display:inline-block;background:#E8533A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700'>Review Listing →</a>
          <p style='color:rgba(240,237,232,0.5);font-size:13px;margin-top:16px'>— Makola Digital Admin 🇬🇭</p>
        </div>`
      });
    } catch(e) { console.error('listing notification email:', e.message); }
    res.status(201).json({ message: 'Listing submitted for review', listingId });
  } catch (err) {
    console.error("create listing:", err);
    res.status(500).json({ message: "Failed to create listing" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status, type, limit = 20, offset = 0 } = req.query;
    const statusFilter = status || "active";
    let query = `SELECT l.*, COALESCE(u.display_name, u.full_name) as seller_name, c.name as category_name, (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order LIMIT 1) as primary_image FROM listings l JOIN users u ON u.id = l.seller_id LEFT JOIN categories c ON c.id = l.category_id WHERE l.status = '${statusFilter}'`;
    const params = [];
    if (type) { params.push(type); query += ` AND l.type = $${params.length}`; }
    query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await db.query(query, params);
    res.json({ listings: result.rows });
  } catch (err) {
    console.error("get listings:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["active", "pending", "rejected", "flagged", "paused"];
    if (valid.indexOf(status) === -1) {
      return res.status(400).json({ message: "Invalid status" });
    }
    await db.query("UPDATE listings SET status = $1, updated_at = NOW() WHERE id = $2", [status, req.params.id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("update status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});



router.get("/mine", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order LIMIT 1) as primary_image FROM listings l WHERE l.seller_id = $1 ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json({ listings: result.rows });
  } catch (err) {
    console.error("get my listings:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT l.*, u.full_name as seller_name FROM listings l JOIN users u ON u.id = l.seller_id WHERE l.id = $1",
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Listing not found" });
    db.query("UPDATE listings SET views_count = views_count + 1 WHERE id = $1", [req.params.id]).catch(() => {});
    const images = await db.query("SELECT url, is_primary, sort_order FROM listing_images WHERE listing_id = $1 ORDER BY sort_order", [req.params.id]);
    res.json({ listing: result.rows[0], images: images.rows });
  } catch (err) {
    console.error("get listing:", err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});

router.get("/:id/related", async (req, res) => {
  try {
    const listing = await db.query("SELECT type, category_id, country FROM listings WHERE id = $1", [req.params.id]);
    if (!listing.rows[0]) return res.json({ listings: [] });
    const { type, category_id, country } = listing.rows[0];
    const result = await db.query(
      `SELECT l.*, u.full_name as seller_name, (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order LIMIT 1) as primary_image FROM listings l JOIN users u ON u.id = l.seller_id WHERE l.status = 'active' AND l.id != $1 AND (l.type = $2 OR l.category_id = $3 OR l.country = $4) ORDER BY RANDOM()`,
      [req.params.id, type, category_id, country]
    );
    res.json({ listings: result.rows });
  } catch (err) {
    res.json({ listings: [] });
  }
});

export default router;

router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { title, description, price, currency, priceLabel, isNegotiable, country, city, locationText, isRemote, images } = req.body;
    await db.query(
      `UPDATE listings SET title=$1, description=$2, price=$3, price_currency=$4, price_label=$5, is_negotiable=$6, country=$7, city=$8, location_text=$9, is_remote=$10, status='pending', updated_at=NOW() WHERE id=$11 AND seller_id=$12`,
      [title, description, price||null, currency||"GHS", priceLabel||null, isNegotiable||false, country?.slice(0,2).toUpperCase()||"GH", city||null, locationText||null, isRemote||false, req.params.id, req.user.id]
    );
    if (images) {
      await db.query("DELETE FROM listing_images WHERE listing_id=$1", [req.params.id]);
      for (let i=0; i<images.length; i++) {
        await db.query("INSERT INTO listing_images (id,listing_id,url,sort_order,is_primary,created_at) VALUES (gen_random_uuid(),$1,$2,$3,$4,NOW())", [req.params.id, images[i], i, i===0]);
      }
    }
    res.json({ message: "Listing updated successfully" });
  } catch (err) {
    console.error("update listing:", err);
    res.status(500).json({ message: "Failed to update listing" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    await db.query("DELETE FROM listing_images WHERE listing_id = $1", [req.params.id]);
    await db.query("DELETE FROM listings WHERE id = $1 AND seller_id = $2", [req.params.id, req.user.id]);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("delete listing:", err);
    res.status(500).json({ message: "Failed to delete listing" });
  }
});

router.patch("/:id/sold-out", authenticate, async (req, res) => {
  try {
    const { isSoldOut } = req.body;
    await db.query("UPDATE listings SET is_sold_out = $1, updated_at = NOW() WHERE id = $2 AND seller_id = $3", [isSoldOut, req.params.id, req.user.id]);
    res.json({ message: isSoldOut ? "Marked as sold out" : "Marked as available" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update" });
  }
});
