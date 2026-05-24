// email/templates.js
// All Makola Digital email templates — HTML + plain text

const BASE_URL = process.env.CLIENT_URL || "https://makoladigital.com";
const BRAND = {
  name: "Makola Digital",
  color: "#E8533A",
  gold: "#C47F17",
  green: "#2D9E6B",
  bg: "#0A0A0A",
  text: "#F0EDE8",
};

// ── Shared layout wrapper ──────────────────────────────────────
const layout = (content, { previewText = "" } = {}) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${BRAND.name}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body{margin:0;padding:0;background:#111;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-text-size-adjust:100%}
  .email-wrap{max-width:560px;margin:0 auto;padding:24px 16px}
  .card{background:#1A1A1A;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}
  .header{background:linear-gradient(135deg,#1a0800,#1a1000);padding:28px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07)}
  .logo-icon{width:44px;height:44px;background:linear-gradient(135deg,${BRAND.color},${BRAND.gold});border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:10px}
  .logo-text{font-size:20px;font-weight:900;color:#F0EDE8;letter-spacing:-0.03em;margin:0}
  .logo-text span{color:${BRAND.color}}
  .body{padding:32px}
  .h1{font-size:24px;font-weight:900;color:#F0EDE8;margin:0 0 10px;letter-spacing:-0.03em;line-height:1.2}
  .h2{font-size:16px;font-weight:800;color:#F0EDE8;margin:0 0 8px}
  .p{font-size:14px;color:rgba(240,237,232,0.65);line-height:1.7;margin:0 0 16px}
  .btn{display:inline-block;background:${BRAND.color};color:#fff;font-size:15px;font-weight:800;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:-0.01em;box-shadow:0 4px 18px rgba(232,83,58,0.35)}
  .btn-outline{display:inline-block;background:transparent;color:#F0EDE8;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;border:1px solid rgba(255,255,255,0.2)}
  .btn-green{background:${BRAND.green};box-shadow:0 4px 18px rgba(45,158,107,0.35)}
  .divider{height:1px;background:rgba(255,255,255,0.07);margin:24px 0}
  .info-box{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:16px 18px;margin:16px 0}
  .info-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)}
  .info-row:last-child{border-bottom:none}
  .info-label{color:rgba(240,237,232,0.5)}
  .info-value{color:#F0EDE8;font-weight:700}
  .stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:16px 0}
  .stat-box{background:rgba(255,255,255,0.05);border-radius:10px;padding:14px;text-align:center}
  .stat-val{font-size:22px;font-weight:900;color:${BRAND.color};display:block}
  .stat-lbl{font-size:11px;color:rgba(240,237,232,0.45);margin-top:3px;display:block;text-transform:uppercase;letter-spacing:0.06em}
  .otp-box{background:${BRAND.color};border-radius:12px;padding:20px;text-align:center;margin:20px 0}
  .otp-code{font-size:36px;font-weight:900;color:#fff;letter-spacing:0.18em;font-family:monospace}
  .badge{display:inline-block;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700}
  .badge-green{background:rgba(45,158,107,0.2);color:${BRAND.green};border:1px solid rgba(45,158,107,0.3)}
  .badge-red{background:rgba(232,83,58,0.2);color:${BRAND.color};border:1px solid rgba(232,83,58,0.3)}
  .badge-gold{background:rgba(196,127,23,0.2);color:${BRAND.gold};border:1px solid rgba(196,127,23,0.3)}
  .footer{padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06)}
  .footer p{font-size:12px;color:rgba(240,237,232,0.28);margin:4px 0;line-height:1.6}
  .footer a{color:rgba(240,237,232,0.45);text-decoration:none}
  .social-row{display:flex;justify-content:center;gap:12px;margin:12px 0}
  .social-link{font-size:18px;text-decoration:none}
  .unsubscribe{margin-top:16px;font-size:11px;color:rgba(240,237,232,0.25)}
  @media(max-width:560px){.body{padding:20px}.h1{font-size:20px}.stat-grid{grid-template-columns:1fr 1fr}}
</style>
${previewText ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:transparent">${previewText}</div>` : ""}
</head>
<body>
<div class="email-wrap">
  <div class="card">
    <div class="header">
      <div class="logo-icon">🌍</div>
      <h1 class="logo-text">Makola<span>Digital</span></h1>
    </div>
    ${content}
    <div class="footer">
      <div class="social-row">
        <a class="social-link" href="${BASE_URL}" title="Website">🌍</a>
        <a class="social-link" href="https://twitter.com/makoladigital" title="Twitter">🐦</a>
        <a class="social-link" href="https://instagram.com/makoladigital" title="Instagram">📸</a>
      </div>
      <p>🌍 Makola Digital — Africa's trusted marketplace</p>
      <p>© ${new Date().getFullYear()} Makola Digital Ltd · Accra, Ghana</p>
      <p><a href="${BASE_URL}/privacy">Privacy</a> · <a href="${BASE_URL}/terms">Terms</a> · <a href="${BASE_URL}/help">Help</a></p>
      <div class="unsubscribe">
        <a href="${BASE_URL}/unsubscribe?token={{unsubscribe_token}}" style="color:rgba(240,237,232,0.25)">Unsubscribe from these emails</a>
      </div>
    </div>
  </div>
</div>
</body>
</html>
`;

// ══════════════════════════════════════════════════════════════
// TEMPLATE DEFINITIONS
// ══════════════════════════════════════════════════════════════

export const templates = {

  // ── 1. VERIFY EMAIL ────────────────────────────────────────
  "verify-email": ({ name, otp, expiresMin = 10 }) => ({
    subject: "Verify your Makola Digital account",
    previewText: `Your verification code is ${otp} — expires in ${expiresMin} minutes`,
    html: layout(`
      <div class="body">
        <h1 class="h1">Verify your email 📧</h1>
        <p class="p">Hi ${name}, welcome to Makola Digital! Enter the code below to activate your account and start buying or selling across Africa.</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="p" style="text-align:center;font-size:13px">Code expires in <strong style="color:#F0EDE8">${expiresMin} minutes</strong>. Don't share it with anyone.</p>
        <div class="divider"></div>
        <p class="p" style="font-size:12px">If you didn't create a Makola Digital account, you can safely ignore this email.</p>
      </div>
    `, { previewText: `Your verification code: ${otp}` }),
    text: `Hi ${name},\n\nYour Makola Digital verification code is: ${otp}\n\nExpires in ${expiresMin} minutes.\n\nIf you didn't sign up, ignore this email.`,
  }),

  // ── 2. FORGOT PASSWORD ─────────────────────────────────────
  "forgot-password": ({ name, resetUrl, expiresMin = 30 }) => ({
    subject: "Reset your Makola Digital password",
    previewText: "Click the link to reset your password — expires in 30 minutes",
    html: layout(`
      <div class="body">
        <h1 class="h1">Reset your password 🔑</h1>
        <p class="p">Hi ${name}, we received a request to reset your Makola Digital password. Click the button below to set a new one.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetUrl}" class="btn">Reset password →</a>
        </div>
        <p class="p" style="text-align:center;font-size:12px;color:rgba(240,237,232,0.4)">This link expires in <strong style="color:#F0EDE8">${expiresMin} minutes</strong>.</p>
        <div class="divider"></div>
        <p class="p" style="font-size:12px">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
        <p class="p" style="font-size:11px;color:rgba(240,237,232,0.3)">If the button doesn't work, copy this link: <br>${resetUrl}</p>
      </div>
    `),
    text: `Hi ${name},\n\nReset your password: ${resetUrl}\n\nExpires in ${expiresMin} minutes.\n\nIf you didn't request this, ignore this email.`,
  }),

  // ── 3. WELCOME (post-verification) ─────────────────────────
  "welcome": ({ name, accountType = "buyer" }) => ({
    subject: `Welcome to Makola Digital, ${name}! 🌍`,
    previewText: "Your account is ready. Here's how to get started.",
    html: layout(`
      <div class="body">
        <h1 class="h1">You're in! Welcome, ${name} 🎉</h1>
        <p class="p">Your Makola Digital account is active. You can now ${accountType === "seller" ? "list products, services, and more" : "browse thousands of listings"} across Africa and the diaspora.</p>
        <div class="stat-grid">
          <div class="stat-box"><span class="stat-val">180k+</span><span class="stat-lbl">Active listings</span></div>
          <div class="stat-box"><span class="stat-val">54</span><span class="stat-lbl">Countries</span></div>
          <div class="stat-box"><span class="stat-val">22k+</span><span class="stat-lbl">Sellers</span></div>
        </div>
        <div style="text-align:center;margin:24px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="${BASE_URL}" class="btn">Explore marketplace →</a>
          ${accountType === "seller" ? `<a href="${BASE_URL}/sell" class="btn-outline">Create your first listing</a>` : ""}
        </div>
        ${accountType === "seller" ? `
        <div class="divider"></div>
        <h2 class="h2">Complete your seller profile</h2>
        <p class="p">Verified sellers get a trust badge and 3x more visibility in search results.</p>
        <div style="text-align:center">
          <a href="${BASE_URL}/auth/kyc" class="btn btn-green">Get verified →</a>
        </div>` : ""}
      </div>
    `),
    text: `Welcome to Makola Digital, ${name}!\n\nYour account is ready. Explore the marketplace: ${BASE_URL}`,
  }),

  // ── 4. NEW MESSAGE ─────────────────────────────────────────
  "new-message": ({ recipientName, senderName, senderAvatar = "💬", preview, listingTitle, conversationUrl }) => ({
    subject: `${senderName} sent you a message on Makola Digital`,
    previewText: `"${preview.slice(0, 80)}${preview.length > 80 ? "..." : ""}"`,
    html: layout(`
      <div class="body">
        <h1 class="h1">New message 💬</h1>
        <p class="p">Hi ${recipientName}, you have a new message from <strong style="color:#F0EDE8">${senderName}</strong>${listingTitle ? ` about <em>${listingTitle}</em>` : ""}.</p>
        <div class="info-box" style="border-left:3px solid ${BRAND.color}">
          <p style="margin:0;font-size:14px;color:rgba(240,237,232,0.75);font-style:italic;line-height:1.6">"${preview}"</p>
          <p style="margin:8px 0 0;font-size:12px;color:rgba(240,237,232,0.4)">— ${senderName}</p>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${conversationUrl}" class="btn">Reply now →</a>
        </div>
        <p class="p" style="font-size:12px;text-align:center">Don't leave them waiting — sellers and buyers respond within minutes on Makola.</p>
      </div>
    `),
    text: `Hi ${recipientName},\n\n${senderName} sent you a message:\n\n"${preview}"\n\nReply here: ${conversationUrl}`,
  }),

  // ── 5. ORDER CONFIRMED ─────────────────────────────────────
  "order-confirmed": ({ buyerName, sellerName, orderRef, listingTitle, amount, currency, payMethod, deliveryInfo }) => ({
    subject: `Order confirmed — ${listingTitle}`,
    previewText: `Your payment of ${currency} ${amount} was received. Order #${orderRef}`,
    html: layout(`
      <div class="body">
        <div style="text-align:center;font-size:48px;margin-bottom:16px">✅</div>
        <h1 class="h1" style="text-align:center">Order confirmed!</h1>
        <p class="p" style="text-align:center">Hi ${buyerName}, your payment was received. The seller has been notified.</p>
        <div class="info-box">
          <div class="info-row"><span class="info-label">Order ref</span><span class="info-value" style="font-family:monospace">#${orderRef}</span></div>
          <div class="info-row"><span class="info-label">Item</span><span class="info-value">${listingTitle}</span></div>
          <div class="info-row"><span class="info-label">Seller</span><span class="info-value">${sellerName}</span></div>
          <div class="info-row"><span class="info-label">Amount paid</span><span class="info-value" style="color:${BRAND.color}">${currency} ${parseFloat(amount).toLocaleString()}</span></div>
          <div class="info-row"><span class="info-label">Payment method</span><span class="info-value">${payMethod}</span></div>
          ${deliveryInfo ? `<div class="info-row"><span class="info-label">Delivery</span><span class="info-value">${deliveryInfo}</span></div>` : ""}
        </div>
        <div style="text-align:center;margin:24px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="${BASE_URL}/orders/${orderRef}" class="btn">View order →</a>
          <a href="${BASE_URL}/messages" class="btn-outline">Message seller</a>
        </div>
        <div class="info-box" style="background:rgba(45,158,107,0.08);border-color:rgba(45,158,107,0.2)">
          <p style="margin:0;font-size:13px;color:rgba(240,237,232,0.7)">🛡️ <strong>Makola Buyer Guarantee:</strong> Your payment is protected. If the item doesn't arrive or isn't as described, contact us within 7 days for a full refund.</p>
        </div>
      </div>
    `),
    text: `Order confirmed!\n\nRef: #${orderRef}\nItem: ${listingTitle}\nAmount: ${currency} ${amount}\n\nView order: ${BASE_URL}/orders/${orderRef}`,
  }),

  // ── 6. NEW ORDER (seller) ──────────────────────────────────
  "new-order-seller": ({ sellerName, buyerName, orderRef, listingTitle, amount, currency, payoutAmount }) => ({
    subject: `🎉 New order! ${buyerName} bought "${listingTitle}"`,
    previewText: `You earned ${currency} ${payoutAmount} — fulfill order #${orderRef}`,
    html: layout(`
      <div class="body">
        <div style="text-align:center;font-size:48px;margin-bottom:16px">🎉</div>
        <h1 class="h1" style="text-align:center">You have a new order!</h1>
        <p class="p" style="text-align:center">Hi ${sellerName}, <strong style="color:#F0EDE8">${buyerName}</strong> just bought one of your listings.</p>
        <div class="info-box">
          <div class="info-row"><span class="info-label">Order ref</span><span class="info-value" style="font-family:monospace">#${orderRef}</span></div>
          <div class="info-row"><span class="info-label">Item sold</span><span class="info-value">${listingTitle}</span></div>
          <div class="info-row"><span class="info-label">Buyer</span><span class="info-value">${buyerName}</span></div>
          <div class="info-row"><span class="info-label">Sale price</span><span class="info-value">${currency} ${parseFloat(amount).toLocaleString()}</span></div>
          <div class="info-row"><span class="info-label">Your payout</span><span class="info-value" style="color:${BRAND.green}">${currency} ${parseFloat(payoutAmount).toLocaleString()}</span></div>
        </div>
        <div style="text-align:center;margin:24px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="${BASE_URL}/orders/${orderRef}" class="btn btn-green">Fulfill order →</a>
          <a href="${BASE_URL}/messages" class="btn-outline">Contact buyer</a>
        </div>
        <p class="p" style="font-size:12px;text-align:center">Payout is released once the buyer confirms receipt or after 7 days, whichever comes first.</p>
      </div>
    `),
    text: `New order!\n\nRef: #${orderRef}\nItem: ${listingTitle}\nBuyer: ${buyerName}\nYour payout: ${currency} ${payoutAmount}\n\nFulfill: ${BASE_URL}/orders/${orderRef}`,
  }),

  // ── 7. KYC RESULT ─────────────────────────────────────────
  "kyc-result": ({ name, status, note }) => ({
    subject: status === "verified" ? "🎉 You're now verified on Makola Digital!" : "Makola Digital KYC — Action needed",
    previewText: status === "verified" ? "Your Verified badge is live on all your listings" : "Your KYC application needs attention",
    html: layout(`
      <div class="body">
        <div style="text-align:center;font-size:48px;margin-bottom:16px">${status === "verified" ? "✅" : "❌"}</div>
        <h1 class="h1" style="text-align:center">${status === "verified" ? "You're verified!" : "KYC not approved"}</h1>
        <p class="p" style="text-align:center">Hi ${name}, ${status === "verified"
          ? "your identity has been verified. Your listings now show a Verified badge — which means more trust and more sales."
          : "we were unable to verify your identity with the documents provided."}</p>
        ${status === "verified" ? `
        <div class="stat-grid">
          <div class="stat-box"><span class="stat-val">✓</span><span class="stat-lbl">Verified badge</span></div>
          <div class="stat-box"><span class="stat-val">3×</span><span class="stat-lbl">More visibility</span></div>
          <div class="stat-box"><span class="stat-val">★</span><span class="stat-lbl">Pro seller</span></div>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${BASE_URL}/dashboard" class="btn">Go to dashboard →</a>
        </div>` : `
        ${note ? `<div class="info-box" style="border-left:3px solid ${BRAND.color}"><p style="margin:0;font-size:13px;color:rgba(240,237,232,0.7)"><strong style="color:#F0EDE8">Reason:</strong> ${note}</p></div>` : ""}
        <p class="p">Please re-submit with clearer documents. Make sure your ID is fully visible with no glare, and all details are readable.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${BASE_URL}/auth/kyc" class="btn">Resubmit documents →</a>
        </div>`}
      </div>
    `),
    text: `Hi ${name},\n\nKYC status: ${status}${note ? `\nReason: ${note}` : ""}\n\n${status === "verified" ? `Dashboard: ${BASE_URL}/dashboard` : `Resubmit: ${BASE_URL}/auth/kyc`}`,
  }),

  // ── 8. LISTING APPROVED ────────────────────────────────────
  "listing-approved": ({ sellerName, listingTitle, listingUrl, views = 0 }) => ({
    subject: `Your listing is live — "${listingTitle}"`,
    previewText: "Your listing is now visible to buyers across Africa and the diaspora",
    html: layout(`
      <div class="body">
        <div style="text-align:center;font-size:48px;margin-bottom:16px">🚀</div>
        <h1 class="h1" style="text-align:center">Your listing is live!</h1>
        <p class="p" style="text-align:center">Hi ${sellerName}, <strong style="color:#F0EDE8">"${listingTitle}"</strong> is now visible to millions of buyers across Africa and the diaspora.</p>
        <div style="text-align:center;margin:24px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="${listingUrl}" class="btn">View your listing →</a>
          <a href="${BASE_URL}/dashboard" class="btn-outline">Go to dashboard</a>
        </div>
        <div class="divider"></div>
        <h2 class="h2">Tips to get more views 💡</h2>
        <div class="info-box">
          <p style="margin:0 0 8px;font-size:13px;color:rgba(240,237,232,0.7)">📸 <strong style="color:#F0EDE8">Add more photos</strong> — listings with 5+ images get 4x more views</p>
          <p style="margin:8px 0;font-size:13px;color:rgba(240,237,232,0.7)">⚡ <strong style="color:#F0EDE8">Boost your listing</strong> — get featured at the top of search results</p>
          <p style="margin:8px 0 0;font-size:13px;color:rgba(240,237,232,0.7)">✅ <strong style="color:#F0EDE8">Get verified</strong> — verified sellers get 3x more clicks</p>
        </div>
      </div>
    `),
    text: `Hi ${sellerName},\n\nYour listing "${listingTitle}" is now live!\n\nView it: ${listingUrl}`,
  }),

  // ── 9. LISTING REMOVED ─────────────────────────────────────
  "listing-removed": ({ sellerName, listingTitle, reason }) => ({
    subject: `Action needed: Your Makola listing was removed`,
    previewText: `"${listingTitle}" has been removed — here's why`,
    html: layout(`
      <div class="body">
        <div style="text-align:center;font-size:48px;margin-bottom:16px">⚠️</div>
        <h1 class="h1">Listing removed</h1>
        <p class="p">Hi ${sellerName}, your listing <strong style="color:#F0EDE8">"${listingTitle}"</strong> has been removed from Makola Digital.</p>
        ${reason ? `<div class="info-box" style="border-left:3px solid ${BRAND.color}"><p style="margin:0;font-size:13px;color:rgba(240,237,232,0.7)"><strong style="color:#F0EDE8">Reason:</strong> ${reason}</p></div>` : ""}
        <p class="p">If you believe this was a mistake, you can appeal the decision or contact our support team.</p>
        <div style="text-align:center;margin:24px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="${BASE_URL}/help/appeal" class="btn">Appeal decision →</a>
          <a href="${BASE_URL}/help" class="btn-outline">Contact support</a>
        </div>
        <div class="divider"></div>
        <p class="p" style="font-size:12px">Please review our <a href="${BASE_URL}/terms" style="color:${BRAND.color}">Terms of Service</a> and <a href="${BASE_URL}/community-guidelines" style="color:${BRAND.color}">Community Guidelines</a> before re-listing.</p>
      </div>
    `),
    text: `Hi ${sellerName},\n\nYour listing "${listingTitle}" was removed.\n\nReason: ${reason || "Policy violation"}\n\nAppeal: ${BASE_URL}/help/appeal`,
  }),

  // ── 10. REVIEW RECEIVED ────────────────────────────────────
  "review-received": ({ sellerName, buyerName, rating, reviewText, listingTitle, replyUrl }) => ({
    subject: `${buyerName} left you a ${rating}★ review`,
    previewText: `"${reviewText.slice(0, 80)}..."`,
    html: layout(`
      <div class="body">
        <h1 class="h1">New review received ⭐</h1>
        <p class="p">Hi ${sellerName}, <strong style="color:#F0EDE8">${buyerName}</strong> left a review for <em>${listingTitle}</em>.</p>
        <div class="info-box">
          <div style="font-size:24px;color:#C47F17;margin-bottom:10px">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
          <p style="margin:0;font-size:14px;color:rgba(240,237,232,0.75);font-style:italic;line-height:1.65">"${reviewText}"</p>
          <p style="margin:10px 0 0;font-size:12px;color:rgba(240,237,232,0.4)">— ${buyerName}</p>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${replyUrl}" class="btn">Reply to review →</a>
        </div>
        <p class="p" style="font-size:12px;text-align:center">Responding to reviews builds trust and improves your seller rating.</p>
      </div>
    `),
    text: `Hi ${sellerName},\n\n${buyerName} left a ${rating}-star review:\n\n"${reviewText}"\n\nReply: ${replyUrl}`,
  }),

  // ── 11. LISTING EXPIRING ───────────────────────────────────
  "listing-expiring": ({ sellerName, listingTitle, listingUrl, daysLeft, renewUrl }) => ({
    subject: `⏰ Your listing expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
    previewText: `Renew "${listingTitle}" to keep it visible to buyers`,
    html: layout(`
      <div class="body">
        <div style="text-align:center;font-size:48px;margin-bottom:16px">⏰</div>
        <h1 class="h1">Listing expiring soon</h1>
        <p class="p">Hi ${sellerName}, your listing <strong style="color:#F0EDE8">"${listingTitle}"</strong> will be removed from search results in <strong style="color:${BRAND.color}">${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>.</p>
        <div style="text-align:center;margin:24px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="${renewUrl}" class="btn">Renew listing →</a>
          <a href="${listingUrl}" class="btn-outline">View listing</a>
        </div>
        <p class="p" style="font-size:12px;text-align:center">Renewing is free for basic listings. Upgrade to Pro for unlimited listings.</p>
      </div>
    `),
    text: `Hi ${sellerName},\n\nYour listing "${listingTitle}" expires in ${daysLeft} days.\n\nRenew: ${renewUrl}`,
  }),

  // ── 12. WEEKLY DIGEST (buyer) ─────────────────────────────
  "weekly-digest": ({ name, savedCount, newMatchCount, topListings = [] }) => ({
    subject: `${newMatchCount} new listings match your saved searches 🔔`,
    previewText: `${newMatchCount} new matches this week — don't miss out`,
    html: layout(`
      <div class="body">
        <h1 class="h1">Your weekly Makola digest 📬</h1>
        <p class="p">Hi ${name}, here's what's new on Makola Digital this week based on your saved searches and interests.</p>
        <div class="stat-grid">
          <div class="stat-box"><span class="stat-val">${newMatchCount}</span><span class="stat-lbl">New matches</span></div>
          <div class="stat-box"><span class="stat-val">${savedCount}</span><span class="stat-lbl">Saved listings</span></div>
          <div class="stat-box"><span class="stat-val">↑32%</span><span class="stat-lbl">New sellers</span></div>
        </div>
        ${topListings.length ? `
        <div class="divider"></div>
        <h2 class="h2">Recommended for you</h2>
        ${topListings.slice(0, 3).map(l => `
          <div class="info-box" style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
              <div>
                <p style="margin:0 0 4px;font-size:10px;color:rgba(240,237,232,0.35);text-transform:uppercase;letter-spacing:.06em">${l.type || "listing"}</p>
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#F0EDE8">${l.title}</p>
                <p style="margin:0;font-size:13px;color:rgba(240,237,232,0.5)">📍 ${l.location}</p>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <p style="margin:0 0 8px;font-size:16px;font-weight:900;color:${BRAND.color}">${l.price}</p>
                <a href="${l.url}" style="background:${BRAND.color};color:#fff;font-size:11px;font-weight:700;padding:5px 11px;border-radius:6px;text-decoration:none">View →</a>
              </div>
            </div>
          </div>`).join("")}` : ""}
        <div style="text-align:center;margin:24px 0">
          <a href="${BASE_URL}" class="btn">Explore all listings →</a>
        </div>
      </div>
    `),
    text: `Hi ${name},\n\n${newMatchCount} new listings match your saved searches this week.\n\nExplore: ${BASE_URL}`,
  }),

  // ── 13. PAYMENT FAILED ─────────────────────────────────────
  "payment-failed": ({ name, listingTitle, amount, currency, retryUrl }) => ({
    subject: "Payment failed — action required",
    previewText: `Your payment for "${listingTitle}" could not be processed`,
    html: layout(`
      <div class="body">
        <div style="text-align:center;font-size:48px;margin-bottom:16px">❌</div>
        <h1 class="h1">Payment unsuccessful</h1>
        <p class="p">Hi ${name}, your payment of <strong style="color:#F0EDE8">${currency} ${amount}</strong> for <em>${listingTitle}</em> could not be processed.</p>
        <div class="info-box" style="border-left:3px solid ${BRAND.color}">
          <p style="margin:0;font-size:13px;color:rgba(240,237,232,0.7)">Common reasons: insufficient funds, incorrect PIN, network timeout, or card declined by your bank.</p>
        </div>
        <div style="text-align:center;margin:24px 0">
          <a href="${retryUrl}" class="btn">Try again →</a>
        </div>
        <p class="p" style="font-size:12px;text-align:center">No money was deducted. Need help? <a href="${BASE_URL}/help" style="color:${BRAND.color}">Contact support</a>.</p>
      </div>
    `),
    text: `Hi ${name},\n\nYour payment for "${listingTitle}" failed.\n\nRetry: ${retryUrl}`,
  }),

  // ── 14. DISPUTE OPENED ─────────────────────────────────────
  "dispute-opened": ({ name, orderRef, disputeUrl, isSellerNotif = false }) => ({
    subject: `Dispute opened for order #${orderRef}`,
    previewText: `A dispute has been filed — please respond within 48 hours`,
    html: layout(`
      <div class="body">
        <div style="text-align:center;font-size:48px;margin-bottom:16px">⚖️</div>
        <h1 class="h1">Dispute opened</h1>
        <p class="p">Hi ${name}, a dispute has been opened for order <strong style="color:#F0EDE8">#${orderRef}</strong>. ${isSellerNotif ? "The buyer has raised an issue. Please respond within 48 hours to avoid automatic refund." : "Our team will review this and respond within 24-48 hours."}</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${disputeUrl}" class="btn">View dispute →</a>
        </div>
        <p class="p" style="font-size:12px;text-align:center">Payment is on hold until the dispute is resolved.</p>
      </div>
    `),
    text: `Hi ${name},\n\nDispute opened for order #${orderRef}.\n\nView: ${disputeUrl}`,
  }),

  // ── 15. SELLER WEEKLY STATS ────────────────────────────────
  "seller-weekly-stats": ({ sellerName, weekRevenue, currency, totalOrders, profileViews, topListing, dashboardUrl }) => ({
    subject: `Your Makola week in review — ${currency} ${weekRevenue} earned`,
    previewText: `${totalOrders} orders, ${profileViews} profile views this week`,
    html: layout(`
      <div class="body">
        <h1 class="h1">Your week in review 📊</h1>
        <p class="p">Hi ${sellerName}, here's how your Makola Digital store performed this week.</p>
        <div class="stat-grid">
          <div class="stat-box"><span class="stat-val">${currency} ${parseFloat(weekRevenue).toLocaleString()}</span><span class="stat-lbl">Revenue</span></div>
          <div class="stat-box"><span class="stat-val">${totalOrders}</span><span class="stat-lbl">Orders</span></div>
          <div class="stat-box"><span class="stat-val">${profileViews}</span><span class="stat-lbl">Profile views</span></div>
        </div>
        ${topListing ? `
        <div class="divider"></div>
        <h2 class="h2">Top performing listing</h2>
        <div class="info-box">
          <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#F0EDE8">${topListing.title}</p>
          <p style="margin:0;font-size:13px;color:rgba(240,237,232,0.55)">👁 ${topListing.views} views · 💰 ${topListing.sales} sales this week</p>
        </div>` : ""}
        <div style="text-align:center;margin:24px 0">
          <a href="${dashboardUrl}" class="btn">View full analytics →</a>
        </div>
      </div>
    `),
    text: `Hi ${sellerName},\n\nThis week: ${currency} ${weekRevenue} revenue, ${totalOrders} orders, ${profileViews} profile views.\n\nDashboard: ${dashboardUrl}`,
  }),
};

// ── Template renderer ──────────────────────────────────────────
export function renderTemplate(templateName, data) {
  const tmpl = templates[templateName];
  if (!tmpl) throw new Error(`Unknown email template: ${templateName}`);
  return tmpl(data);
}
