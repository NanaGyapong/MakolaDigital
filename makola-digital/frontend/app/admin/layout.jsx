"use client";
import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "Florence2026$$@makola";

export default function AdminLayout({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem("makola_admin_auth");
    if (auth === "true") setAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("makola_admin_auth", "true");
      setAuthenticated(true);
    } else {
      setError("Invalid password");
    }
  };

  if (!authenticated) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0A0A0A" }}>
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 40, width: 360, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🛡️</div>
        <h2 style={{ color: "#F0EDE8", marginBottom: 8 }}>Admin Access</h2>
        <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 14, marginBottom: 24 }}>Makola Digital · Restricted Area</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Enter admin password"
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#F0EDE8", fontSize: 15, marginBottom: 12, boxSizing: "border-box", outline: "none" }}
        />
        {error && <p style={{ color: "#E8533A", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={handleLogin} style={{ width: "100%", padding: "12px", background: "#E8533A", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Access Dashboard →
        </button>
      </div>
    </div>
  );

  return <>{children}</>;
}
