import { db } from "../config/db.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const GIFTS = [
  { id: "c45a1be7-ede0-41a3-a7ce-e1d17037eb4e", title: "iPhone 13 Pro", price: "GHS 4,650" },
  { id: "7970c212-c018-466c-871a-d7a5939f1e69", title: "Suits", price: "GHS 600" },
  { id: "8ea398ba-1652-47bb-ab97-b5d6a91d8a2e", title: "Authentic African Footwear", price: "GHS 250" },
  { id: "843cb59f-4a7a-4814-9f7a-276010509e89", title: "Samsung Galaxy A25 5G", price: "GHS 1,920" },
  { id: "c0d86481-bf57-4cd4-8541-8fa9851392b0", title: "Lenovo 300e Laptop", price: "GHS 1,900" },
  { id: "11fbd733-0edb-4da7-9cfa-4a806e300b8c", title: "PS4", price: "GHS 3,000" },
];

function buildHtml(name) {
  const gridRows = [];
  for (let i = 0; i < GIFTS.length; i += 2) {
    const pair = GIFTS.slice(i, i + 2);
    gridRows.push(`
      <tr>
        ${pair.map(g => `
          <td style="width:50%;padding:8px;">
            <a href="https://www.makoladigital.online/listing/${g.id}" style="text-decoration:none;display:block;background:#151515;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
              <div style="color:#F0EDE8;font-size:14px;font-weight:700;margin-bottom:6px;">${g.title}</div>
              <div style="color:#E8533A;font-size:15px;font-weight:700;">${g.price}</div>
            </a>
          </td>
        `).join("")}
      </tr>
    `);
  }

  return `
  <div style="font-family:sans-serif;background:#0A0A0A;padding:32px;color:#F0EDE8;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;">🎁</div>
      <h1 style="color:#E8533A;font-size:26px;margin:8px 0 4px;">Happy Father's Day!</h1>
      <p style="color:rgba(240,237,232,0.6);font-size:15px;margin:0;">Hi ${name}, find the perfect gift for Dad on Makola Digital</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${gridRows.join("")}
    </table>
    <div style="text-align:center;">
      <a href="https://www.makoladigital.online/search" style="display:inline-block;background:#E8533A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">Shop All Father's Day Gifts →</a>
    </div>
    <p style="text-align:center;color:rgba(240,237,232,0.35);font-size:12px;margin-top:32px;">Makola Digital — Africa's Marketplace for Everyone<br/>makoladigital.online</p>
  </div>
  `;
}

export async function sendFathersDayCampaign() {
  const { rows: users } = await db.query(
    "SELECT email, COALESCE(display_name, full_name) as name FROM users WHERE email IS NOT NULL"
  );

  console.log(`Sending Father's Day campaign to ${users.length} users...`);
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await resend.emails.send({
        from: "Makola Digital <hello@makoladigital.online>",
        to: user.email,
        subject: "🎁 Happy Father's Day — Find the perfect gift for Dad",
        html: buildHtml(user.name || "there"),
      });
      sent++;
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      failed++;
      console.error(`Failed for ${user.email}:`, err.message);
    }
  }

  console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
}
