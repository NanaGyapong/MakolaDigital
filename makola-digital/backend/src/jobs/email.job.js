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
  }
};
