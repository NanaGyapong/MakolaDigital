import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailQueue = {
  add: async (type, data) => {
    if (type === "verify-email") {
      await resend.emails.send({
        from: "Makola Digital <hello@makoladigital.online>",
        to: data.to,
        subject: "Verify your Makola Digital account",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0A0A0A;color:#F0EDE8;border-radius:16px">
            <h1 style="color:#E8533A;margin-bottom:8px">🌍 Makola Digital</h1>
            <p>Hi ${data.name},</p>
            <p>Your verification code is:</p>
            <div style="background:#1A1A1A;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
              <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#E8533A">${data.otp}</span>
            </div>
            <p style="color:rgba(240,237,232,0.5);font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
            <p style="color:rgba(240,237,232,0.5);font-size:13px">— The Makola Digital Team 🇬🇭</p>
          </div>
        `
      });
    }

    if (type === 'listing-approved') {
      await resend.emails.send({
        from: 'Makola Digital <hello@makoladigital.online>',
        to: data.to,
        subject: 'Your listing is now live on Makola Digital!',
        html: `<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0A0A0A;color:#F0EDE8;border-radius:16px'>
          <h1 style='color:#E8533A;margin-bottom:8px'>🌍 Makola Digital</h1>
          <p>Hi ${data.name},</p>
          <p>Great news! Your listing <strong style='color:#E8533A'>${data.title}</strong> has been approved and is now live on Makola Digital.</p>
          <a href='https://makoladigital.online/listing/${data.listingId}' style='display:inline-block;background:#E8533A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin:16px 0'>View Your Listing →</a>
          <p style='color:rgba(240,237,232,0.5);font-size:13px'>— The Makola Digital Team 🇬🇭</p>
        </div>`
      });
    }
    if (type === 'new-message') {
      await resend.emails.send({
        from: 'Makola Digital <hello@makoladigital.online>',
        to: data.to,
        subject: 'You have a new message on Makola Digital',
        html: `<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0A0A0A;color:#F0EDE8;border-radius:16px'>
          <h1 style='color:#E8533A;margin-bottom:8px'>🌍 Makola Digital</h1>
          <p>Hi ${data.sellerName},</p>
          <p>You have a new message about your listing <strong style='color:#E8533A'>${data.listingTitle}</strong>:</p>
          <div style='background:#1A1A1A;border-radius:12px;padding:16px;margin:16px 0;border-left:3px solid #E8533A'>
            <p style='margin:0;font-style:italic'>${data.message}</p>
            <p style='margin:8px 0 0;font-size:12px;color:rgba(240,237,232,0.5)'>— ${data.buyerName}</p>
          </div>
          <a href='https://makoladigital.online/dashboard/analytics' style='display:inline-block;background:#E8533A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700'>Reply in Dashboard →</a>
          <p style='color:rgba(240,237,232,0.5);font-size:13px'>— The Makola Digital Team 🇬🇭</p>
        </div>`
      });
    }
    if (type === 'new-offer') {
      await resend.emails.send({
        from: 'Makola Digital <hello@makoladigital.online>',
        to: data.to,
        subject: 'New offer received on your listing!',
        html: `<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0A0A0A;color:#F0EDE8;border-radius:16px'>
          <h1 style='color:#E8533A;margin-bottom:8px'>🌍 Makola Digital</h1>
          <p>Hi ${data.sellerName},</p>
          <p>You received a new offer on <strong style='color:#E8533A'>${data.listingTitle}</strong>:</p>
          <div style='background:#1A1A1A;border-radius:12px;padding:16px;margin:16px 0;text-align:center'>
            <div style='font-size:28px;font-weight:900;color:#2D9E6B'>${data.currency} ${Number(data.offerAmount).toLocaleString()}</div>
            <div style='font-size:12px;color:rgba(240,237,232,0.5);margin-top:4px'>Offer from ${data.buyerName}</div>
          </div>
          <a href='https://makoladigital.online/dashboard/analytics' style='display:inline-block;background:#E8533A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700'>Respond to Offer →</a>
          <p style='color:rgba(240,237,232,0.5);font-size:13px'>— The Makola Digital Team 🇬🇭</p>
        </div>`
      });
    }
  }
};
