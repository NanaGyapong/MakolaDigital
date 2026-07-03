import { db } from "../config/db.js";
import { Resend } from "resend";

export async function sendHolidayCampaign() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const users = await db.query("SELECT id, email, COALESCE(display_name, full_name) as full_name FROM users WHERE email IS NOT NULL");
    
    const listings = await db.query(`
      SELECT l.*, COALESCE(u.display_name, u.full_name) as seller_name, c.name as category_name,
      (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order LIMIT 1) as image
      FROM listings l
      JOIN users u ON u.id = l.seller_id
      LEFT JOIN categories c ON c.id = l.category_id
      WHERE l.id IN (
        '07ea6d6c-b594-4499-a9f1-0800ce7659d6',
        'f4112729-87ed-4d0f-a048-9e8d2e985191',
        '22601189-f0f5-45cd-9d28-e724c8c68ccc',
        'd180b10e-d670-43e3-9adc-0c4d7eb40e8b',
        '26d6351e-2020-488b-ac97-b178644d4bab',
        '5205f049-1e8f-4eaf-a8c9-21777e5f3894',
        'f7bd821c-f730-4ff5-a193-cab24188f073',
        '99b93b08-d88b-481f-b15c-ffcea28a2bee',
        '85fb69c2-9b07-4420-bcba-06db5396a208',
        '985dbd88-9961-4a3a-8bf3-d8aa33078978'
      )
      ORDER BY l.views_count DESC
    `);

    const allListings = listings.rows;

    for (const user of users.rows) {
      const firstName = user.full_name ? user.full_name.split(' ')[0] : 'there';
      
      const listingCards = allListings.map(l => `
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;margin-bottom:12px">
          <tr><td>
            ${l.image
              ? `<img src="${l.image}" width="100%" style="height:160px;object-fit:cover;display:block" />`
              : `<div style="height:90px;background:#2A2A2A;text-align:center;padding:28px 0;font-size:28px">🛍️</div>`
            }
          </td></tr>
          <tr><td style="padding:14px">
            <div style="font-size:10px;color:rgba(240,237,232,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${l.category_name || l.type}</div>
            <div style="font-weight:700;font-size:14px;color:#F0EDE8;margin-bottom:6px">${l.title}</div>
            <div style="font-size:11px;color:rgba(240,237,232,0.4);margin-bottom:10px">📍 ${l.city || 'Ghana'} · by ${l.seller_name}</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:18px;font-weight:900;color:#E8533A">${l.price ? l.price_currency + ' ' + Number(l.price).toLocaleString() : 'Contact for price'}</td>
                <td align="right"><a href="https://makoladigital.online/listing/${l.id}" style="background:#E8533A;color:#fff;text-decoration:none;padding:7px 14px;border-radius:8px;font-size:11px;font-weight:700;display:inline-block">View →</a></td>
              </tr>
            </table>
          </td></tr>
        </table>
      `).join('');

      await resend.emails.send({
        from: "Makola Digital <hello@makoladigital.online>",
        to: user.email,
        subject: `🎉 Happy Holiday ${firstName}! Shop from the comfort of your home`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F4;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <!-- HEADER -->
        <tr><td style="background:#0A0A0A;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
          <div style="font-size:40px;margin-bottom:8px">🎉🇬🇭🎊</div>
          <div style="display:inline-block;background:#E8533A;border-radius:10px;padding:8px 14px;margin-bottom:12px">
            <span style="color:#fff;font-size:18px;font-weight:900">M</span>
          </div>
          <div style="color:#F0EDE8;font-size:20px;font-weight:900">Makola<span style="color:#E8533A">Digital</span></div>
          <div style="color:rgba(240,237,232,0.4);font-size:11px;margin-top:4px;letter-spacing:2px;text-transform:uppercase">Holiday Special 🎁</div>
        </td></tr>

        <!-- GREETING -->
        <tr><td style="background:#111111;padding:28px 32px;text-align:center">
          <h1 style="color:#F0EDE8;font-size:24px;font-weight:900;margin:0 0 12px;line-height:1.3">Happy Holiday, ${firstName}! 🎉</h1>
          <p style="color:rgba(240,237,232,0.7);font-size:15px;margin:0 0 8px;line-height:1.7">Stay in the comfort of your home and shop online today.</p>
          <p style="color:rgba(240,237,232,0.5);font-size:13px;margin:0;line-height:1.7">We've handpicked the best household deals and services<br>on Makola Digital just for you!</p>
        </td></tr>

        <!-- BANNER -->
        <tr><td style="background:#151515;padding:20px 32px 8px">
          <div style="background:linear-gradient(135deg,rgba(232,83,58,0.15),rgba(196,127,23,0.15));border:1px solid rgba(232,83,58,0.25);border-radius:12px;padding:16px;text-align:center">
            <div style="color:#E8533A;font-size:14px;font-weight:700;margin-bottom:6px">🏠 Shop From Home This Holiday</div>
            <div style="color:rgba(240,237,232,0.6);font-size:12px;line-height:1.7">Browse verified sellers across Ghana · Chat directly on WhatsApp<br>No fees · No commission · 100% Free</div>
          </div>
        </td></tr>

        <!-- LISTINGS -->
        <tr><td style="background:#151515;padding:20px 32px 24px">
          <div style="color:#F0EDE8;font-size:15px;font-weight:700;margin-bottom:16px">🛍️ Holiday Picks For You</div>
          ${listingCards}
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#111111;padding:24px 32px;text-align:center">
          <a href="https://makoladigital.online/search" style="display:inline-block;background:linear-gradient(135deg,#E8533A,#C47F17);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;margin-bottom:12px">Browse All Holiday Deals →</a>
          <br>
          <a href="https://makoladigital.online/sell" style="display:inline-block;background:rgba(255,255,255,0.06);color:#F0EDE8;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;border:1px solid rgba(255,255,255,0.1);margin-top:10px">Have something to sell? List for free →</a>
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
      console.log(`Sent to ${user.email}`);
    }
    console.log(`Holiday campaign sent to ${users.rows.length} users!`);
  } catch (err) {
    console.error("Holiday campaign error:", err);
  }
}
