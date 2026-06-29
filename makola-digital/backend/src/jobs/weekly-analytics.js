import { db } from "../config/db.js";
import { Resend } from "resend";
export async function sendWeeklyAnalytics() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const sellers = await db.query("SELECT id, email, COALESCE(display_name, full_name) as full_name, role FROM users WHERE role = 'seller' AND email IS NOT NULL");
    for (const seller of sellers.rows) {
      const stats = await db.query(`
        SELECT
          COUNT(*) as total_listings,
          SUM(views_count) as total_views,
          SUM(saves_count) as total_saves,
          COUNT(CASE WHEN is_sold_out = true THEN 1 END) as sold_out
        FROM listings
        WHERE seller_id = $1 AND status = 'active'
      `, [seller.id]);
      const s = stats.rows[0];
      if (!s || s.total_listings === '0') continue;
      const views = s.total_views || 0;
      const saves = s.total_saves || 0;
      const listings = s.total_listings || 0;
      const soldOut = s.sold_out || 0;
      await resend.emails.send({
        from: "Makola Digital <hello@makoladigital.online>",
        to: seller.email,
        subject: `📊 Your Makola Digital performance — ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long" })}`,
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
          <div style="color:rgba(240,237,232,0.4);font-size:11px;margin-top:4px;letter-spacing:2px;text-transform:uppercase">Weekly Performance Report</div>
        </td></tr>

        <!-- GREETING -->
        <tr><td style="background:#111111;padding:28px 32px">
          <p style="color:#F0EDE8;font-size:16px;margin:0 0 8px">Hi ${seller.full_name} 👋</p>
          <p style="color:rgba(240,237,232,0.6);font-size:14px;margin:0;line-height:1.6">Here's how your listings performed this week on Makola Digital. Keep it up! 🔥</p>
        </td></tr>

        <!-- STATS -->
        <tr><td style="background:#151515;padding:24px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding:0 8px 16px 0">
                <div style="background:#1A1A1A;border:1px solid rgba(232,83,58,0.2);border-radius:12px;padding:20px;text-align:center">
                  <div style="font-size:36px;font-weight:900;color:#E8533A">${views}</div>
                  <div style="font-size:11px;color:rgba(240,237,232,0.5);margin-top:4px;text-transform:uppercase;letter-spacing:1px">👁️ Total Views</div>
                </div>
              </td>
              <td width="50%" style="padding:0 0 16px 8px">
                <div style="background:#1A1A1A;border:1px solid rgba(45,158,107,0.2);border-radius:12px;padding:20px;text-align:center">
                  <div style="font-size:36px;font-weight:900;color:#2D9E6B">${saves}</div>
                  <div style="font-size:11px;color:rgba(240,237,232,0.5);margin-top:4px;text-transform:uppercase;letter-spacing:1px">❤️ Total Saves</div>
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding:0 8px 0 0">
                <div style="background:#1A1A1A;border:1px solid rgba(196,127,23,0.2);border-radius:12px;padding:20px;text-align:center">
                  <div style="font-size:36px;font-weight:900;color:#C47F17">${listings}</div>
                  <div style="font-size:11px;color:rgba(240,237,232,0.5);margin-top:4px;text-transform:uppercase;letter-spacing:1px">📦 Active Listings</div>
                </div>
              </td>
              <td width="50%" style="padding:0 0 0 8px">
                <div style="background:#1A1A1A;border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:20px;text-align:center">
                  <div style="font-size:36px;font-weight:900;color:#8B5CF6">${soldOut}</div>
                  <div style="font-size:11px;color:rgba(240,237,232,0.5);margin-top:4px;text-transform:uppercase;letter-spacing:1px">✅ Sold Out</div>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- TIP -->
        <tr><td style="background:#111111;padding:20px 32px">
          <div style="background:rgba(232,83,58,0.08);border:1px solid rgba(232,83,58,0.2);border-radius:10px;padding:16px">
            <div style="color:#E8533A;font-size:12px;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">💡 Tip of the week</div>
            <div style="color:rgba(240,237,232,0.7);font-size:13px;line-height:1.6">Listings with clear photos get <strong style="color:#F0EDE8">3x more views</strong>. Add at least 3 photos to each listing to attract more buyers!</div>
          </div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#151515;padding:24px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding-bottom:12px">
                <a href="https://makoladigital.online/dashboard/analytics" style="display:inline-block;background:linear-gradient(135deg,#E8533A,#C47F17);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px">View My Dashboard →</a>
              </td>
            </tr>
            <tr>
              <td align="center">
                <a href="https://makoladigital.online/sell" style="display:inline-block;background:rgba(255,255,255,0.06);color:#F0EDE8;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;border:1px solid rgba(255,255,255,0.1)">+ Add New Listing</a>
              </td>
            </tr>
          </table>
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
    console.log("Weekly analytics sent to", sellers.rows.length, "sellers");
  } catch (err) {
    console.error("Weekly analytics error:", err);
  }
}
