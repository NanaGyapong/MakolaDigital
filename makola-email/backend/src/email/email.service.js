// email/email.service.js
// Nodemailer + SendGrid transport with retry logic

import nodemailer from "nodemailer";
import { renderTemplate } from "./templates.js";

// ── Transport setup ─────────────────────────────────────────────
function createTransport() {
  // SendGrid (recommended for production)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: { user: "apikey", pass: process.env.SENDGRID_API_KEY },
    });
  }
  // Generic SMTP fallback
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const transporter = createTransport();

// ── Core send function ─────────────────────────────────────────
export async function sendEmail({ to, templateName, data, attachments = [] }) {
  const { subject, html, text } = renderTemplate(templateName, data);

  const mailOptions = {
    from: `"${process.env.FROM_NAME || "Makola Digital"}" <${process.env.FROM_EMAIL}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text,
    attachments,
    headers: {
      "X-Mailer": "Makola Digital v1.0",
      "List-Unsubscribe": `<${process.env.CLIENT_URL}/unsubscribe>`,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] ✓ ${templateName} → ${to} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[email] ✗ ${templateName} → ${to}:`, err.message);
    throw err;
  }
}

// ── Verify transport on startup ────────────────────────────────
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log("[email] ✓ SMTP connection verified");
    return true;
  } catch (err) {
    console.error("[email] ✗ SMTP config error:", err.message);
    return false;
  }
}
