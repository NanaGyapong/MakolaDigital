"use client";
import { useRouter } from "next/navigation";

export default function DeleteAccountPage() {
  const router = useRouter();
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: "40px 24px", maxWidth: 680, margin: "0 auto" }}>
      <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#E8533A", fontSize: 14, cursor: "pointer", marginBottom: 32, padding: 0 }}>← Back to Makola Digital</button>

      <div style={{ width: 48, height: 48, borderRadius: 10, background: "#E8533A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>🗑️</div>

      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Delete Your Account</h1>
      <p style={{ color: "rgba(240,237,232,0.6)", fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>
        We're sorry to see you go. You can request deletion of your Makola Digital account and all associated data by following the steps below.
      </p>

      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "#E8533A" }}>How to Request Account Deletion</h2>
        {[
          { step: "1", title: "Send an email", body: "Send an email to hello@makoladigital.online with the subject line: Delete My Account" },
          { step: "2", title: "Include your details", body: "Include your registered email address and full name so we can identify your account." },
          { step: "3", title: "Confirmation", body: "We will send you a confirmation email within 2 business days acknowledging your request." },
          { step: "4", title: "Deletion completed", body: "Your account and all associated data will be permanently deleted within 30 days of your request." },
        ].map(item => (
          <div key={item.step} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E8533A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{item.step}</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 14, color: "rgba(240,237,232,0.6)", lineHeight: 1.5 }}>{item.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>What Gets Deleted</h2>
        {["Your profile and personal information", "All your listings and photos", "Your messages and conversations", "Your saved listings and preferences", "Your account login credentials"].map(item => (
          <div key={item} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center" }}>
            <span style={{ color: "#E8533A", fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 14, color: "rgba(240,237,232,0.7)" }}>{item}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(196,127,23,0.08)", border: "1px solid rgba(196,127,23,0.2)", borderRadius: 16, padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: "#C47F17" }}>What May Be Retained</h2>
        <p style={{ fontSize: 14, color: "rgba(240,237,232,0.6)", lineHeight: 1.6 }}>
          Certain data may be retained for legal, regulatory or fraud prevention purposes for up to 90 days after deletion, including transaction records and communications related to disputes.
        </p>
      </div>

      <a href="mailto:hello@makoladigital.online?subject=Delete My Account" style={{ display: "block", background: "#E8533A", color: "#fff", textDecoration: "none", padding: "16px", borderRadius: 12, fontSize: 15, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>
        📧 Send Deletion Request
      </a>

      <p style={{ fontSize: 12, color: "rgba(240,237,232,0.3)", textAlign: "center", lineHeight: 1.6 }}>
        Makola Digital Technologies Ltd · hello@makoladigital.online<br/>
        Account deletion requests are processed within 30 days.
      </p>
    </div>
  );
}
