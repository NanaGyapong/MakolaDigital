"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

export default function AdminSellers() {
  const router = useRouter();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const sellerList = (data.users || []).filter(u => u.role === "seller" || u.role === "admin");
        setSellers(sellerList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = sellers.filter(s =>
    !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getKycColor = (status) => {
    if (status === "verified") return "#2D9E6B";
    if (status === "pending") return "#C47F17";
    return "#E8533A";
  };

  const getKycIcon = (status) => {
    if (status === "verified") return "✅";
    if (status === "pending") return "⏳";
    return "❌";
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>👑 Seller Management</h1>
          <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)" }}>{filtered.length} sellers</div>
        </div>
        <a href="/admin/dashboard" style={{ color: "#E8533A", fontSize: 13 }}>← Dashboard</a>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search sellers by name or email..."
        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 14px", color: "#F0EDE8", fontSize: 13, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(240,237,232,0.4)" }}>Loading sellers...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(240,237,232,0.4)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👑</div>
          <div>No sellers found</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(s => (
            <div key={s.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              
              {/* Avatar */}
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                {s.full_name?.charAt(0)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.full_name}</div>
                  <span style={{ fontSize: 13 }}>{getKycIcon(s.kyc_status)}</span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 2 }}>{s.email}</div>
                {s.phone && <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>📞 {s.phone}</div>}
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>KYC</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: getKycColor(s.kyc_status), background: getKycColor(s.kyc_status) + "22", padding: "3px 8px", borderRadius: 6 }}>{s.kyc_status}</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>Plan</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#3B7DD8", background: "rgba(59,125,216,0.12)", padding: "3px 8px", borderRadius: 6 }}>Free</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>Joined</div>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.6)" }}>{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
                <button onClick={() => router.push(`/admin/users`)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>View →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
