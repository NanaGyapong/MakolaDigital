"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    fetch(`${API}/disputes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setDisputes(data.disputes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const resolve = async (id, action) => {
    const token = localStorage.getItem("makola_token");
    await fetch(`${API}/disputes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action })
    });
    setDisputes(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>⚖️ Disputes</h1>
          <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)" }}>{disputes.length} open disputes</div>
        </div>
        <a href="/admin/dashboard" style={{ color: "#E8533A", fontSize: 13 }}>← Dashboard</a>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(240,237,232,0.4)" }}>Loading...</div>
      ) : disputes.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No open disputes</div>
          <div style={{ fontSize: 14, color: "rgba(240,237,232,0.5)" }}>All transactions are running smoothly!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {disputes.map(d => (
            <div key={d.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.listing_title}</div>
                  <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>{d.buyer_name} vs {d.seller_name}</div>
                  <div style={{ fontSize: 13, color: "#C47F17", marginTop: 6 }}>"{d.reason}"</div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>{new Date(d.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => resolve(d.id, "refund")} style={{ background: "rgba(59,125,216,0.12)", border: "1px solid rgba(59,125,216,0.3)", color: "#3B7DD8", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>💰 Refund buyer</button>
                <button onClick={() => resolve(d.id, "release")} style={{ background: "rgba(45,158,107,0.12)", border: "1px solid rgba(45,158,107,0.3)", color: "#2D9E6B", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✅ Release to seller</button>
                <button onClick={() => resolve(d.id, "escalate")} style={{ background: "rgba(232,83,58,0.08)", border: "1px solid rgba(232,83,58,0.2)", color: "#E8533A", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🚨 Escalate</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
