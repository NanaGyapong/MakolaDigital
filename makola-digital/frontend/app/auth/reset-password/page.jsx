"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
const API = process.env.NEXT_PUBLIC_API_URL;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token. Please request a new reset link.");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Reset failed. Please request a new link.");
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
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🔒</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#F0EDE8", marginBottom: 6 }}>Reset Password</h1>
          <p style={{ fontSize: 14, color: "rgba(240,237,232,0.5)" }}>Enter your new password below</p>
        </div>

        {success ? (
          <div style={{ background: "rgba(45,158,107,0.1)", border: "1px solid rgba(45,158,107,0.3)", borderRadius: 14, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2D9E6B", marginBottom: 8 }}>Password reset successful!</div>
            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.6)", marginBottom: 20 }}>Your password has been updated. You can now log in with your new password.</div>
            <button onClick={() => router.push("/auth/login")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Log in now</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            {error && <div style={{ background: "rgba(232,83,58,0.1)", border: "1px solid rgba(232,83,58,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#E8533A", marginBottom: 16 }}>{error}</div>}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(240,237,232,0.7)", display: "block", marginBottom: 8 }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 44px 12px 14px", color: "#F0EDE8", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                <span onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁️"}</span>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(240,237,232,0.7)", display: "block", marginBottom: 8 }}>Confirm New Password</label>
              <input type={show ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat new password" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#F0EDE8", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading || !token} style={{ width: "100%", background: loading ? "rgba(232,83,58,0.5)" : "#E8533A", border: "none", color: "#fff", padding: "13px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span onClick={() => router.push("/auth/forgot-password")} style={{ fontSize: 13, color: "#E8533A", cursor: "pointer", fontWeight: 600 }}>Request new reset link</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return <Suspense><ResetPasswordContent /></Suspense>;
}
