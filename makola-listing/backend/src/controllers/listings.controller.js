// controllers/listings.controller.js
import { v4 as uuid } from "uuid";
import slugify from "slugify";
import { db } from "../config/db.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/storage.js";
import { queueEmail } from "../jobs/email.queue.js";

// ── POST /api/v1/listings — Create listing ───────────────────
export async function createListing(req, res) {
  try {
    const sellerId = req.user.id;
    const {
      type, categoryId, title, description,
      price, priceMax, priceCurrency = "GHS", priceLabel, priceType = "fixed",
      isNegotiable = false, locationText, country, city, isRemote = false,
      tags = [], metadata = {}, expiresInDays = 90,
    } = req.body;

    // Generate unique slug
    let slug = slugify(title, { lower: true, strict: true });
    const existing = await db.query("SELECT id FROM listings WHERE slug LIKE $1", [`${slug}%`]);
    if (existing.rows.length) slug = `${slug}-${existing.rows.length + 1}`;

    const listingId = uuid();
    const expiresAt = new Date(Date.now() + (expiresInDays * 86400000));

    await db.query(
      `INSERT INTO listings
       (id, seller_id, category_id, type, status, title, slug, description,
        price, price_max, price_currency, price_label, is_negotiable, price_type,
        location_text, country, city, is_remote, tags, metadata, expires_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'draft',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW())`,
      [listingId, sellerId, categoryId, type, title, slug, description,
       priceType !== "free" ? parseFloat(price || 0) : null,
       priceMax ? parseFloat(priceMax) : null,
       priceCurrency, priceLabel || null, isNegotiable, priceType,
       locationText, country, city, isRemote, tags, JSON.stringify(metadata), expiresAt]
    );

    res.status(201).json({
      message: "Listing created as draft",
      listing: { id: listingId, slug, status: "draft" },
    });
  } catch (err) {
    console.error("createListing:", err);
    res.status(500).json({ message: err.message || "Failed to create listing" });
  }
}

// ── POST /api/v1/listings/:id/images — Upload images ─────────
export async function uploadImages(req, res) {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    // Verify ownership
    const listing = await db.query(
      "SELECT id FROM listings WHERE id=$1 AND seller_id=$2",
      [id, sellerId]
    );
    if (!listing.rows.length) return res.status(404).json({ message: "Listing not found" });

    // Get current image count
    const countResult = await db.query(
      "SELECT COUNT(*) FROM listing_images WHERE listing_id=$1",
      [id]
    );
    const currentCount = parseInt(countResult.rows[0].count);
    if (currentCount + req.files.length > 8) {
      return res.status(400).json({ message: `Maximum 8 photos allowed. You have ${currentCount} already.` });
    }

    // Upload each file to Cloudinary
    const uploads = await Promise.all(
      req.files.map(async (file, i) => {
        const result = await uploadToCloudinary(file.buffer, {
          folder: `makola/listings/${id}`,
          transformation: [
            { width: 1200, height: 900, crop: "limit", quality: "auto:good" },
          ],
        });
        return {
          url: result.secure_url,
          thumbnail: result.secure_url.replace("/upload/", "/upload/w_400,h_300,c_fill/"),
          sortOrder: currentCount + i,
          isPrimary: currentCount === 0 && i === 0,
          publicId: result.public_id,
        };
      })
    );

    // Insert image records
    for (const img of uploads) {
      await db.query(
        `INSERT INTO listing_images (id, listing_id, url, thumbnail, sort_order, is_primary, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
        [uuid(), id, img.url, img.thumbnail, img.sortOrder, img.isPrimary]
      );
    }

    res.json({ message: `${uploads.length} photo(s) uploaded`, images: uploads });
  } catch (err) {
    console.error("uploadImages:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
}

// ── PATCH /api/v1/listings/:id — Update listing ──────────────
export async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    const updates = req.body;

    const result = await db.query(
      "SELECT id, status FROM listings WHERE id=$1 AND seller_id=$2",
      [id, sellerId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Listing not found" });

    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = [
      "title","description","price","price_max","price_currency","price_label",
      "is_negotiable","price_type","location_text","country","city","is_remote",
      "tags","metadata","category_id",
    ];

    for (const [key, val] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (allowedFields.includes(dbKey)) {
        fields.push(`${dbKey}=$${idx}`);
        values.push(typeof val === "object" ? JSON.stringify(val) : val);
        idx++;
      }
    }

    if (!fields.length) return res.status(400).json({ message: "No valid fields to update" });

    values.push(id, sellerId);
    await db.query(
      `UPDATE listings SET ${fields.join(",")}, updated_at=NOW() WHERE id=$${idx} AND seller_id=$${idx+1}`,
      values
    );

    res.json({ message: "Listing updated", id });
  } catch (err) {
    console.error("updateListing:", err);
    res.status(500).json({ message: err.message || "Update failed" });
  }
}

// ── PATCH /api/v1/listings/:id/publish — Publish listing ─────
export async function publishListing(req, res) {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const result = await db.query(
      `SELECT l.*, u.full_name, u.email,
              COUNT(li.id) AS image_count
       FROM listings l
       JOIN users u ON u.id = l.seller_id
       LEFT JOIN listing_images li ON li.listing_id = l.id
       WHERE l.id=$1 AND l.seller_id=$2
       GROUP BY l.id, u.full_name, u.email`,
      [id, sellerId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Listing not found" });
    const listing = result.rows[0];

    // Validation
    const errors = [];
    if (!listing.title || listing.title.length < 10) errors.push("Title must be at least 10 characters");
    if (!listing.description || listing.description.length < 30) errors.push("Description must be at least 30 characters");
    if (!listing.location_text && !listing.country) errors.push("Location is required");
    if (parseInt(listing.image_count) === 0) errors.push("At least one photo is required");
    if (errors.length) return res.status(400).json({ message: "Cannot publish", errors });

    await db.query(
      "UPDATE listings SET status='active', updated_at=NOW() WHERE id=$1 AND seller_id=$2",
      [id, sellerId]
    );

    // Send confirmation email
    await queueEmail({
      to: listing.email,
      templateName: "listing-approved",
      data: {
        sellerName: listing.full_name.split(" ")[0],
        listingTitle: listing.title,
        listingUrl: `${process.env.CLIENT_URL}/listing/${listing.slug}`,
      },
      priority: "normal",
    });

    res.json({ message: "Listing is now live", slug: listing.slug, status: "active" });
  } catch (err) {
    console.error("publishListing:", err);
    res.status(500).json({ message: err.message || "Publish failed" });
  }
}

// ── GET /api/v1/listings/my — Seller's own listings ──────────
export async function getMyListings(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const params = [req.user.id];
    let where = "l.seller_id = $1";
    if (status) { params.push(status); where += ` AND l.status = $${params.length}`; }
    params.push(limit, (page - 1) * limit);

    const result = await db.query(
      `SELECT l.id, l.title, l.slug, l.type, l.status, l.price, l.price_currency,
              l.views_count, l.saves_count, l.is_featured, l.created_at, l.expires_at,
              c.name AS category_name,
              (SELECT li.url FROM listing_images li WHERE li.listing_id=l.id AND li.is_primary ORDER BY li.sort_order LIMIT 1) AS primary_image,
              COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating,
              COUNT(DISTINCT r.id) AS review_count,
              COUNT(DISTINCT o.id) AS order_count,
              COUNT(*) OVER() AS total
       FROM listings l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN reviews r ON r.listing_id = l.id
       LEFT JOIN orders o ON o.listing_id = l.id AND o.status = 'completed'
       WHERE ${where}
       GROUP BY l.id, c.name
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ listings: result.rows, total: parseInt(result.rows[0]?.total || 0) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load listings" });
  }
}

// ── DELETE /api/v1/listings/:id — Delete listing ─────────────
export async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE listings SET status='deleted', updated_at=NOW() WHERE id=$1 AND seller_id=$2 RETURNING id",
      [id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Listing not found" });
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing" });
  }
}

// ── POST /api/v1/listings/:id/boost — Boost listing ──────────
export async function boostListing(req, res) {
  try {
    const { id } = req.params;
    const { days = 7 } = req.body;
    const featuredUntil = new Date(Date.now() + days * 86400000);

    await db.query(
      "UPDATE listings SET is_featured=true, featured_until=$1, updated_at=NOW() WHERE id=$2 AND seller_id=$3",
      [featuredUntil, id, req.user.id]
    );
    res.json({ message: `Listing boosted for ${days} days`, featuredUntil });
  } catch (err) {
    res.status(500).json({ message: "Boost failed" });
  }
}

// ── POST /api/v1/listings/:id/renew — Renew expiring listing ─
export async function renewListing(req, res) {
  try {
    const { id } = req.params;
    const expiresAt = new Date(Date.now() + 90 * 86400000);
    await db.query(
      "UPDATE listings SET expires_at=$1, status='active', updated_at=NOW() WHERE id=$2 AND seller_id=$3",
      [expiresAt, id, req.user.id]
    );
    res.json({ message: "Listing renewed for 90 days", expiresAt });
  } catch (err) {
    res.status(500).json({ message: "Renewal failed" });
  }
}

// ── PATCH /api/v1/listings/:id/images/reorder — Reorder ──────
export async function reorderImages(req, res) {
  try {
    const { id } = req.params;
    const { imageIds } = req.body; // ordered array of image IDs

    for (let i = 0; i < imageIds.length; i++) {
      await db.query(
        "UPDATE listing_images SET sort_order=$1, is_primary=$2 WHERE id=$3 AND listing_id=$4",
        [i, i === 0, imageIds[i], id]
      );
    }
    res.json({ message: "Image order updated" });
  } catch (err) {
    res.status(500).json({ message: "Reorder failed" });
  }
}

// ── DELETE /api/v1/listings/:id/images/:imageId ───────────────
export async function deleteImage(req, res) {
  try {
    const { id, imageId } = req.params;
    const result = await db.query(
      "SELECT url FROM listing_images WHERE id=$1 AND listing_id=$2",
      [imageId, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Image not found" });

    // Delete from Cloudinary
    const publicId = result.rows[0].url.match(/\/upload\/(.+)\./)?.[1];
    if (publicId) await deleteFromCloudinary(publicId).catch(() => {});

    await db.query("DELETE FROM listing_images WHERE id=$1 AND listing_id=$2", [imageId, id]);
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
}
