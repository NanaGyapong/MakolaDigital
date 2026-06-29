import { db } from "../config/db.js";
import { Resend } from "resend";
export async function sendBuyerRecommendations() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const buyers = await db.query("SELECT id, email, COALESCE(display_name, full_name) as full_name FROM users WHERE email IS NOT NULL");
    const listings = await db.query(`
      SELECT l.*, COALESCE(u.display_name, u.full_name) as seller_name,
      (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order) as image
      FROM listings l
      JOIN users u ON u.id = l.seller_id
      WHERE l.status = 'active'
      ORDER BY (l.views_count + l.saves_count * 3) DESC, l.created_at DESC
    `);
    const top6 = listings.rows.slice(0, 6);
    for (const buyer of buyers.rows) {
      const firstName = buyer.full_name ? buyer.full_name.split(' ')[0] : 'there';
      const listingCards = top6.map(l => `
        <tr>
          <td style="padding:0 0 16px 0">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden">
              <tr>
                <td>
                  ${l.image
                    ? `<img src="${l.image}" width="100%" style="height:180px;object-fit:cover;display:block" />`
                    : `<div style="height:100px;background:#2A2A2A;text-align:center;padding:32px 0;font-size:32px">🛍️</div>`
                  }
                </td>
              </tr>
              <tr>
                <td style="padding:16px">
                  <div style="font-size:10px;color:rgba(240,237,232,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${l.type?.toUpperCase()} · ${l.category_name || ''}</div>
                  <div style="font-weight:700;font-size:15px;color:#F0EDE8;margin-bottom:6px">${l.title}</div>
                  <div style="font-size:12px;color:rgba(240,237,232,0.4);margin-bottom:12px">📍 ${l.city || l.country || 'Ghana'} · by ${l.seller_name}</div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:20px;font-weight:900;color:#E8533A">${l.price ? l.price_currency + ' ' + Number(l.price).toLocaleString() : 'Price on request'}</td>
                      <td align="right"><a href="https://makoladigital.online/listing/${l.id}" style="background:#E8533A;color:#fff;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;display:inline-block">View →</a></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `).join('');

      await resend.emails.send({
        from: "Makola Digital <hello@makoladigital.online>",
        to: buyer.email,
        subject: `${firstName}, fresh listings picked for you! 🔥`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F4;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <!-- HEADER -->
        <tr><td style="background:#0A0A0A;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
          <div style="display:inline-block;background:#E8533A;border-radius:10px;padding:8px 14px;margin-bottom:12px">
            <span style="color:#fff;font-size:18px;font-weight:900;letter-spacing:-0.5px">M</span>
          </div>
          <div style="color:#F0EDE8;font-size:20px;font-weight:900;letter-spacing:-0.5px">Makola<span style="color:#E8533A">Digital</span></div>
          <div style="color:rgba(240,237,232,0.4);font-size:11px;margin-top:4px;letter-spacing:2px;text-transform:uppercase">Fresh Picks For You</div>
        </td></tr>

        <!-- GREETING -->
        <tr><td style="background:#111111;padding:24px 32px">
          <p style="color:#F0EDE8;font-size:16px;margin:0 0 8px">Hey ${firstName}! 👋</p>
          <p style="color:rgba(240,237,232,0.6);font-size:14px;margin:0;line-height:1.6">We handpicked the hottest listings on Makola Digital just for you. Don't miss out!</p>
        </td></tr>

        <!-- LISTINGS -->
        <tr><td style="background:#151515;padding:24px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${listingCards}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#111111;padding:24px 32px;text-align:center">
          <a href="https://makoladigital.online/search" style="display:inline-block;background:linear-gradient(135deg,#E8533A,#C47F17);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;margin-bottom:12px">Browse All Listings →</a>
          <br>
          <a href="https://makoladigital.online/sell" style="display:inline-block;background:rgba(255,255,255,0.06);color:#F0EDE8;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;border:1px solid rgba(255,255,255,0.1)">Sell something today →</a>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#0A0A0A;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center">
          <div style="color:rgba(240,237,232,0.3);font-size:11px;line-height:1.8">
            <strong style="color:#E8533A">Makola Digital Technologies Ltd</strong><br>
            Africa's Marketplace for Everyone 🌍<br>
            <a href="https://makoladigital.online" style="color:#E8533A;text-decoration:none">makoladigital.online</a> ·
            <a href="https://makoladigital.online/delete-account" style="color:rgba(240,237,232,0.3);text-decoration:none;font-size:10px">Unsubscribe</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
      });
    }
    console.log("Buyer recommendations sent to", buyers.rows.length, "users");
  } catch (err) {
    console.error("Buyer recommendations error:", err);
  }
}
