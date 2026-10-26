"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const API = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.message || "Something went wrong. Try again.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🌍</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#F0EDE8", marginBottom: 6 }}>Forgot Password?</h1>
          <p style={{ fontSize: 14, color: "rgba(240,237,232,0.5)" }}>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div style={{ background: "rgba(45,158,107,0.1)", border: "1px solid rgba(45,158,107,0.3)", borderRadius: 14, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2D9E6B", marginBottom: 8 }}>Reset link sent!</div>
            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.6)", marginBottom: 20 }}>Check your email <strong style={{ color: "#F0EDE8" }}>{email}</strong> for a password reset link. Check your spam folder if you don't see it.</div>
            <button onClick={() => router.push("/auth/login")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Back to Login</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            {error && <div style={{ background: "rgba(232,83,58,0.1)", border: "1px solid rgba(232,83,58,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#E8533A", marginBottom: 16 }}>{error}</div>}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(240,237,232,0.7)", display: "block", marginBottom: 8 }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#F0EDE8", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "rgba(232,83,58,0.5)" : "#E8533A", border: "none", color: "#fff", padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: 13, color: "rgba(240,237,232,0.5)" }}>Remember your password? </span>
              <span onClick={() => router.push("/auth/login")} style={{ fontSize: 13, color: "#E8533A", cursor: "pointer", fontWeight: 600 }}>Log in</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
