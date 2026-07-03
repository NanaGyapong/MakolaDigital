"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    const body = encodeURIComponent(
      "Name: " + form.name + "\nEmail: " + form.email + "\nSubject: " + form.subject + "\n\nMessage:\n" + form.message
    );
    window.location.href = "mailto:hello@makoladigital.online?subject=" + encodeURIComponent(form.subject || "Contact from " + form.name) + "&body=" + body;
    setSent(true);
    setSending(false);
  };

  const inp = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "13px 16px", color: "#F0EDE8", fontSize: 14, fontFamily: "sans-serif", boxSizing: "border-box", outline: "none" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "rgba(240,237,232,0.5)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" };

  const faqs = [
    { q: "How do I list a product for free?", a: "Click 'Sell' in the navigation, fill in your product details, upload photos and click publish. Your listing goes live after a quick review." },
    { q: "How do I contact a seller?", a: "Open any listing and click 'Chat on WhatsApp' or use the 'Send Message' button to contact the seller directly through Makola Digital." },
    { q: "Is Makola Digital really free?", a: "Yes! Listing on Makola Digital is 100% free. We charge no fees or commission on sales." },
    { q: "How do I delete my account?", a: "Visit our account deletion page at makoladigital.online/delete-account and follow the instructions to request account deletion." },
    { q: "How do I report a suspicious listing?", a: "Contact us at hello@makoladigital.online with the listing URL and reason for concern. We review all reports within 24 hours." },
    { q: "Which countries can use Makola Digital?", a: "Makola Digital is open to everyone globally, with a focus on Ghana and the African diaspora in the UK, USA, Europe and beyond." },
  ];

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#E8533A", cursor: "pointer", fontSize: 20 }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 16 }}>🌍 Makola Digital</div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#E8533A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>💬</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>Contact & Help</h1>
          <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 15, margin: 0 }}>We're here to help — reach out anytime</p>
        </div>

        {/* Quick contact cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 40 }}>
          {[
            { icon: "📧", title: "Email Us", sub: "hello@makoladigital.online", href: "mailto:hello@makoladigital.online", color: "#E8533A" },
            { icon: "💬", title: "WhatsApp", sub: "Chat with support", href: "https://wa.me/233000000000?text=Hi Makola Digital, I need help", color: "#25D366" },
            { icon: "📸", title: "Instagram", sub: "@makoladigital", href: "https://instagram.com/makoladigital", color: "#E1306C" },
          ].map(card => (
            <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 16px", textAlign: "center", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: card.color, marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>{card.sub}</div>
            </a>
          ))}
        </div>

        {/* Contact form */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, marginTop: 0 }}>Send us a message</h2>
          {sent ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Message ready to send!</div>
              <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)" }}>Your email app should have opened. Send the email to reach us!</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Your Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="John Mensah" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Email Address *</label>
                  <input value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="john@gmail.com" style={inp} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Subject</label>
                <input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} placeholder="e.g. Problem with my listing" style={inp} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Message *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} rows={5} placeholder="Describe your issue or question in detail..." style={{ ...inp, resize: "vertical" }} />
              </div>
              <button onClick={handleSubmit} disabled={sending || !form.name || !form.email || !form.message} style={{ width: "100%", background: "#E8533A", border: "none", color: "#fff", padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: (!form.name || !form.email || !form.message) ? 0.5 : 1 }}>
                {sending ? "Opening email..." : "Send Message →"}
              </button>
              <p style={{ fontSize: 11, color: "rgba(240,237,232,0.3)", textAlign: "center", marginTop: 10 }}>We typically respond within 24 hours</p>
            </>
          )}
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#F0EDE8" }}>❓ {faq.q}</div>
                <div style={{ fontSize: 13, color: "rgba(240,237,232,0.6)", lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 40, paddingTop: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button onClick={() => router.push("/privacy")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,232,0.5)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Privacy Policy</button>
          <button onClick={() => router.push("/terms")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,232,0.5)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Terms & Conditions</button>
          <button onClick={() => router.push("/delete-account")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,232,0.5)", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Delete Account</button>
        </div>

      </div>
    </div>
  );
}
