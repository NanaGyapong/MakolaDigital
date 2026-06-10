import { db } from "../config/db.js";
import { Resend } from "resend";

export async function sendWeeklyAnalytics() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Get all sellers
    const sellers = await db.query("SELECT id, email, full_name FROM users WHERE role = 'seller'");
    
    for (const seller of sellers.rows) {
      // Get their listings stats for the week
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

      await resend.emails.send({
        from: "Makola Digital <hello@makoladigital.online>",
        to: seller.email,
        subject: "Your weekly performance on Makola Digital",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0A0A0A;color:#F0EDE8;border-radius:16px">
            <h1 style="color:#E8533A;margin-bottom:4px">🌍 Makola Digital</h1>
            <p style="color:rgba(240,237,232,0.5);margin-top:0">Weekly Performance Report</p>
            <p>Hi ${seller.full_name},</p>
            <p>Here's how your listings performed this week:</p>
            <div style="background:#1A1A1A;border-radius:12px;padding:24px;margin:20px 0">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div style="text-align:center">
                  <div style="font-size:32px;font-weight:900;color:#E8533A">${s.total_views || 0}</div>
                  <div style="font-size:12px;color:rgba(240,237,232,0.5)">Total Views</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:32px;font-weight:900;color:#2D9E6B">${s.total_saves || 0}</div>
                  <div style="font-size:12px;color:rgba(240,237,232,0.5)">Total Saves</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:32px;font-weight:900;color:#C47F17">${s.total_listings || 0}</div>
                  <div style="font-size:12px;color:rgba(240,237,232,0.5)">Active Listings</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:32px;font-weight:900;color:#8B5CF6">${s.sold_out || 0}</div>
                  <div style="font-size:12px;color:rgba(240,237,232,0.5)">Sold Out</div>
                </div>
              </div>
            </div>
            <a href="https://makoladigital.online/dashboard/analytics" style="display:block;background:linear-gradient(135deg,#E8533A,#C47F17);color:#fff;text-decoration:none;padding:14px;border-radius:10px;text-align:center;font-weight:700">View My Dashboard →</a>
            <p style="color:rgba(240,237,232,0.4);font-size:12px;margin-top:24px">Makola Digital · Africa's Marketplace · <a href="https://makoladigital.online" style="color:#E8533A">makoladigital.online</a></p>
          </div>
        `
      });
    }
    console.log("Weekly analytics sent to", sellers.rows.length, "sellers");
  } catch (err) {
    console.error("Weekly analytics error:", err);
  }
}
