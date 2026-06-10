import { db } from "../config/db.js";
import { Resend } from "resend";

export async function sendBuyerRecommendations() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get all buyers
    const buyers = await db.query("SELECT id, email, full_name FROM users WHERE role = 'buyer'");

    // Get 6 latest active listings
    const listings = await db.query(`
      SELECT l.*, u.full_name as seller_name,
      (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order LIMIT 1) as image
      FROM listings l
      JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
      LIMIT 6
    `);

    for (const buyer of buyers.rows) {
      const listingCards = listings.rows.map(l => `
        <div style="border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;margin-bottom:16px;background:#1A1A1A">
          ${l.image ? `<img src="${l.image}" style="width:100%;height:180px;object-fit:cover" />` : `<div style="width:100%;height:100px;background:#2A2A2A;display:flex;align-items:center;justify-content:center;font-size:32px">🛍️</div>`}
          <div style="padding:14px">
            <div style="font-weight:700;font-size:15px;color:#F0EDE8;margin-bottom:4px">${l.title}</div>
            <div style="font-size:12px;color:rgba(240,237,232,0.5);margin-bottom:8px">📍 ${l.city || l.country} · by ${l.seller_name}</div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:18px;font-weight:900;color:#E8533A">${l.price_currency} ${Number(l.price).toLocaleString()}</div>
              <a href="https://makoladigital.online/listing/${l.id}" style="background:#E8533A;color:#fff;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700">View details</a>
            </div>
          </div>
        </div>
      `).join('');

      await resend.emails.send({
        from: "Makola Digital <hello@makoladigital.online>",
        to: buyer.email,
        subject: `${buyer.full_name.split(' ')[0]}, fresh listings just arrived for you! 👀`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#F0EDE8;border-radius:16px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#E8533A,#C47F17);padding:24px;text-align:center">
              <div style="font-size:28px;font-weight:900;letter-spacing:2px">🌍 MAKOLA DIGITAL</div>
              <div style="font-size:13px;margin-top:4px;opacity:0.9">SELL FASTER · BUY SMARTER · CONNECT AFRICA</div>
            </div>
            <div style="padding:24px">
              <h2 style="font-size:20px;margin-bottom:4px">Hello, ${buyer.full_name}!</h2>
              <p style="color:rgba(240,237,232,0.6);margin-bottom:24px">We found awesome listings for you on Makola Digital!</p>
              ${listingCards}
              <a href="https://makoladigital.online" style="display:block;background:linear-gradient(135deg,#E8533A,#C47F17);color:#fff;text-decoration:none;padding:14px;border-radius:10px;text-align:center;font-weight:700;margin-top:8px">View all listings →</a>
            </div>
            <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
              <p style="font-size:11px;color:rgba(240,237,232,0.3)">You're receiving this because you're a member of Makola Digital.</p>
              <p style="font-size:11px;color:rgba(240,237,232,0.3)"><a href="https://makoladigital.online" style="color:#E8533A">makoladigital.online</a></p>
            </div>
          </div>
        `
      });
    }
    console.log("Buyer recommendations sent to", buyers.rows.length, "buyers");
  } catch (err) {
    console.error("Buyer recommendations error:", err);
  }
}
