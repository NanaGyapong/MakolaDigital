"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    fetch(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setUsers(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchFilter = filter === "all" || u.role === filter || u.kyc_status === filter;
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getRoleColor = (role) => {
    if (role === "admin") return "#E8533A";
    if (role === "seller") return "#2D9E6B";
    return "#3B7DD8";
  };

  const getKycColor = (status) => {
    if (status === "verified") return "#2D9E6B";
    if (status === "pending") return "#C47F17";
    if (status === "rejected") return "#E8533A";
    return "rgba(240,237,232,0.4)";
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>👥 User Management</h1>
          <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)" }}>{users.length} total users</div>
        </div>
        <a href="/admin/dashboard" style={{ color: "#E8533A", fontSize: 13 }}>← Dashboard</a>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 14px", color: "#F0EDE8", fontSize: 13, outline: "none" }}
        />
        {["all", "seller", "buyer", "verified", "pending", "unverified"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "#E8533A" : "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: filter === f ? 700 : 400, textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(240,237,232,0.4)" }}>Loading users...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(240,237,232,0.4)" }}>No users found</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(u => (
            <div key={u.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {u.full_name?.charAt(0) || "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{u.full_name}</div>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>{u.email}</div>
                {u.phone && <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>{u.phone}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: getRoleColor(u.role), background: getRoleColor(u.role) + "22", padding: "3px 8px", borderRadius: 6, textTransform: "capitalize" }}>{u.role}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: getKycColor(u.kyc_status), background: getKycColor(u.kyc_status) + "22", padding: "3px 8px", borderRadius: 6, textTransform: "capitalize" }}>{u.kyc_status}</span>
                <span style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>{new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
