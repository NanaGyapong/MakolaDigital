import { Router } from "express";
import { db } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { v4 as uuid } from "uuid";

const router = Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const { type, category, title, description, price, currency, priceLabel, isNegotiable, country, city, locationText, isRemote, images } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + uuid().slice(0, 8);
    const catResult = await db.query("SELECT id FROM categories WHERE name = $1 LIMIT 1", [category]);
    const categoryId = catResult.rows[0]?.id || 1;
    const result = await db.query(
      `INSERT INTO listings (id, seller_id, category_id, type, status, title, slug, description, price, price_currency, price_label, is_negotiable, country, city, location_text, is_remote, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'pending',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),NOW()) RETURNING id`,
      [uuid(), req.user.id, categoryId, type, title, slug, description, price || null, currency || "GHS", priceLabel || null, isNegotiable || false, country?.slice(0,2).toUpperCase() || "GH", city || null, locationText || null, isRemote || false]
    );
    const listingId = result.rows[0].id;
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.query("INSERT INTO listing_images (id, listing_id, url, sort_order, is_primary, created_at) VALUES ($1,$2,$3,$4,$5,NOW())", [uuid(), listingId, images[i], i, i === 0]);
      }
    }
    res.status(201).json({ message: "Listing submitted for review", listingId });
  } catch (err) {
    console.error("create listing:", err);
    res.status(500).json({ message: "Failed to create listing" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status, type, limit = 20, offset = 0 } = req.query;
    const statusFilter = status || "active";
    let query = `SELECT l.*, u.full_name as seller_name, (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order LIMIT 1) as primary_image FROM listings l JOIN users u ON u.id = l.seller_id WHERE l.status = '${statusFilter}'`;
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
    if (status === 'active') {
      try {
        const listing = await db.query('SELECT l.title, l.id, u.email, u.full_name FROM listings l JOIN users u ON u.id = l.seller_id WHERE l.id = $1', [req.params.id]);
        if (listing.rows[0]) {
          const { emailQueue } = await import('../jobs/email.job.js');
          await emailQueue.add('listing-approved', { to: listing.rows[0].email, name: listing.rows[0].full_name, title: listing.rows[0].title, listingId: listing.rows[0].id });
        }
      } catch(e) { console.error('email notification:', e.message); }
    }
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error("update status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT l.*, u.full_name as seller_name FROM listings l JOIN users u ON u.id = l.seller_id WHERE l.id = $1',
      [req.params.id]
    );
    const images = await db.query('SELECT url, is_primary, sort_order FROM listing_images WHERE listing_id = $1 ORDER BY sort_order', [req.params.id]);
    res.json({ listing: result.rows[0], images: images.rows });
  } catch (err) {
    console.error('get listing:', err);
    res.status(500).json({ message: 'Failed to fetch listing' });
  }
});

router.get('/:id/related', async (req, res) => {
  try {
    const listing = await db.query('SELECT type, category_id, country FROM listings WHERE id = $1', [req.params.id]);
    const { type, category_id, country } = listing.rows[0];
    const result = await db.query(
      `SELECT l.*, u.full_name as seller_name,
        (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order LIMIT 1) as primary_image
       FROM listings l JOIN users u ON u.id = l.seller_id
       WHERE l.status = 'active' AND l.id != $1
       AND (l.type = $2 OR l.category_id = $3 OR l.country = $4)
       ORDER BY RANDOM() LIMIT 6`,
      [req.params.id, type, category_id, country]
    );
    res.json({ listings: result.rows });
  } catch (err) {
    console.error('related:', err);
    res.json({ listings: [] });
  }
});
export default router;

router.get("/mine", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order LIMIT 1) as primary_image 
       FROM listings l WHERE l.seller_id = $1 ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json({ listings: result.rows });
  } catch (err) {
    console.error("get my listings:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});
