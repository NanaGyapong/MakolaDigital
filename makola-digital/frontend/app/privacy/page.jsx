"use client";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const s = { color: "rgba(240,237,232,0.7)", fontSize: 14, lineHeight: 1.8, marginBottom: 16 };
  const h = { fontSize: 18, fontWeight: 800, color: "#F0EDE8", marginBottom: 8, marginTop: 28 };
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: "40px 24px", maxWidth: 720, margin: "0 auto" }}>
      <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#E8533A", fontSize: 14, cursor: "pointer", marginBottom: 32, padding: 0 }}>← Back to Makola Digital</button>

      <div style={{ width: 48, height: 48, borderRadius: 10, background: "#E8533A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>🔒</div>

      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Privacy Policy</h1>
      <p style={{ color: "rgba(240,237,232,0.4)", fontSize: 13, marginBottom: 32 }}>Makola Digital Technologies Ltd · Last updated: June 2026</p>

      <p style={s}>This Privacy Policy explains how Makola Digital Technologies Ltd ("Makola Digital", "we", "us", or "our") collects, uses, and protects your personal information when you use our website and mobile application at makoladigital.online.</p>

      <h2 style={h}>1. Information We Collect</h2>
      <p style={s}>We collect the following types of information:</p>
      <ul style={{ ...s, paddingLeft: 20 }}>
        <li><strong style={{ color: "#F0EDE8" }}>Account information</strong> — name, email address, phone number, and password when you register</li>
        <li><strong style={{ color: "#F0EDE8" }}>Listing information</strong> — photos, videos, descriptions, prices and location details you provide when creating listings</li>
        <li><strong style={{ color: "#F0EDE8" }}>Messages</strong> — communications between buyers and sellers on our platform</li>
        <li><strong style={{ color: "#F0EDE8" }}>Usage data</strong> — pages visited, listings viewed, search queries, and device information</li>
        <li><strong style={{ color: "#F0EDE8" }}>Location data</strong> — approximate location when you use our Near Me feature (optional)</li>
      </ul>

      <h2 style={h}>2. How We Use Your Information</h2>
      <ul style={{ ...s, paddingLeft: 20 }}>
        <li>To create and manage your account</li>
        <li>To display your listings to potential buyers</li>
        <li>To send you email notifications, weekly updates and recommendations</li>
        <li>To verify your identity and prevent fraud</li>
        <li>To improve our platform and user experience</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 style={h}>3. How We Share Your Information</h2>
      <p style={s}>We do not sell your personal data to third parties. We may share your information with:</p>
      <ul style={{ ...s, paddingLeft: 20 }}>
        <li><strong style={{ color: "#F0EDE8" }}>Other users</strong> — your display name, location and listing details are visible to buyers</li>
        <li><strong style={{ color: "#F0EDE8" }}>Cloudinary</strong> — for storing and delivering your photos and videos</li>
        <li><strong style={{ color: "#F0EDE8" }}>Resend</strong> — for sending transactional and marketing emails</li>
        <li><strong style={{ color: "#F0EDE8" }}>Google Analytics</strong> — for anonymous usage statistics</li>
        <li><strong style={{ color: "#F0EDE8" }}>Law enforcement</strong> — when required by law or to protect our users</li>
      </ul>

      <h2 style={h}>4. Data Security</h2>
      <p style={s}>We take the security of your data seriously. All data is transmitted over HTTPS (encrypted). Passwords are hashed using bcrypt and never stored in plain text. We use industry-standard security practices to protect your information.</p>

      <h2 style={h}>5. Data Retention</h2>
      <p style={s}>We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal purposes (up to 90 days).</p>

      <h2 style={h}>6. Your Rights</h2>
      <p style={s}>You have the right to:</p>
      <ul style={{ ...s, paddingLeft: 20 }}>
        <li>Access the personal data we hold about you</li>
        <li>Correct inaccurate personal data</li>
        <li>Request deletion of your account and personal data</li>
        <li>Opt out of marketing emails at any time</li>
        <li>Lodge a complaint with a data protection authority</li>
      </ul>

      <h2 style={h}>7. Cookies</h2>
      <p style={s}>We use essential cookies to keep you logged in and remember your preferences. We also use Google Analytics cookies to understand how users interact with our platform. You can disable cookies in your browser settings.</p>

      <h2 style={h}>8. Children's Privacy</h2>
      <p style={s}>Makola Digital is not intended for users under the age of 18. We do not knowingly collect personal information from children under 18.</p>

      <h2 style={h}>9. Changes to This Policy</h2>
      <p style={s}>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our platform.</p>

      <h2 style={h}>10. Contact Us</h2>
      <p style={s}>If you have any questions about this Privacy Policy or how we handle your data, please contact us:</p>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 32 }}>
        <div style={{ fontSize: 14, color: "#F0EDE8", marginBottom: 6 }}>📧 <a href="mailto:hello@makoladigital.online" style={{ color: "#E8533A" }}>hello@makoladigital.online</a></div>
        <div style={{ fontSize: 14, color: "#F0EDE8", marginBottom: 6 }}>🌍 <a href="https://makoladigital.online" style={{ color: "#E8533A" }}>makoladigital.online</a></div>
        <div style={{ fontSize: 14, color: "#F0EDE8" }}>🏢 Makola Digital Technologies Ltd, Accra, Ghana</div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <button onClick={() => router.push("/terms")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,232,0.6)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Terms & Conditions</button>
        <button onClick={() => router.push("/delete-account")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,232,0.6)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Delete Account</button>
      </div>
    </div>
  );
}
