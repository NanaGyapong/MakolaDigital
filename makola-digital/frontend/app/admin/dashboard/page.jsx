"use client";
import React, { useState, useEffect } from "react";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

export default function AdminDashboard() {
  const [realStats, setRealStats] = useState({ users: 0, listings: 0, kyc_pending: 0, listings_pending: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [visitStats, setVisitStats] = useState({ today: 0, week: 0, total: 0 });

  useEffect(() => { (async () => {
    let token = localStorage.getItem('makola_token');
    const refresh = localStorage.getItem('makola_refresh');
    if (refresh) {
      try {
        const r = await fetch(API + '/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: refresh }) });
        const d = await r.json();
        if (d.accessToken) { localStorage.setItem('makola_token', d.accessToken); token = d.accessToken; }
      } catch(e) {}
    }
    Promise.all([
      fetch(API + "/admin/users", { headers: { Authorization: "Bearer " + token } }).then(r => r.json()),
      fetch(API + "/categories/counts").then(r => r.json()),
      fetch(API + "/listings?status=pending&limit=50").then(r => r.json()),
      fetch(API + "/kyc/applications?status=pending", { headers: { Authorization: "Bearer " + token } }).then(r => r.json()),
      fetch(API + "/listings?status=active&limit=5").then(r => r.json()),
    ]).then(([users, counts, pending, kyc, recent]) => {
      setRealStats({
        users: users.users?.length || 0,
        listings: counts.total || 0,
        kyc_pending: kyc.applications?.length || 0,
        listings_pending: pending.listings?.length || 0,
      });
      if (users.users) setRecentUsers(users.users.slice(0, 5));
      if (recent.listings) setRecentListings(recent.listings.slice(0, 5));
    }).catch(() => {}); })(); }, []);

  const stats = [
    { label: "Total users", val: realStats.users.toString(), color: "#3B7DD8" },
    { label: "Active listings", val: realStats.listings.toString(), color: "#2D9E6B" },
    { label: "Pending listings", val: realStats.listings_pending.toString(), color: "#C47F17" },
    { label: "KYC pending", val: realStats.kyc_pending.toString(), color: "#8B5CF6" },
    { label: "Today revenue", val: "GH₵ 0", color: "#E8533A" },
    { label: "Flagged listings", val: "0", color: "#C40F10" },
    { label: "Today visitors", val: visitStats.today.toString(), color: "#3B7DD8" },
    { label: "Week visitors", val: visitStats.week.toString(), color: "#2D9E6B" },
    { label: "Total visitors", val: visitStats.total.toString(), color: "#C47F17" },
  ];

  const pages = [
    { label: "✅ KYC Queue", url: "/admin/kyc", color: "#2D9E6B" },
    { label: "📦 Listings", url: "/admin/listings", color: "#3B7DD8" },
    { label: "👥 Users", url: "/admin/users", color: "#8B5CF6" },
    { label: "⚖️ Disputes", url: "/admin/disputes", color: "#E8533A" },
    { label: "👑 Sellers", url: "/admin/sellers", color: "#C47F17" },
    { label: "💼 Post Job", url: "/admin/post-job", color: "#2D9E6B" },
  ];

  const getRoleColor = (role) => role === "admin" ? "#E8533A" : role === "seller" ? "#2D9E6B" : "#3B7DD8";
  const getKycColor = (status) => status === "verified" ? "#2D9E6B" : status === "pending" ? "#C47F17" : "rgba(240,237,232,0.4)";

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: "sans-serif", color: "#F0EDE8", padding: 28 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>🛡️ Admin Dashboard</div>
          <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginTop: 4 }}>Makola Digital · Super Admin</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ background: "rgba(45,158,107,0.12)", border: "1px solid rgba(45,158,107,0.3)", color: "#2D9E6B", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✅ Live</div><button onClick={() => { localStorage.removeItem("makola_token"); localStorage.removeItem("makola_refresh"); window.location.href = "/"; }} style={{ background: "rgba(232,83,58,0.1)", border: "1px solid rgba(232,83,58,0.3)", color: "#E8533A", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🚪 Logout</button></div>
      </div>

      {/* Stats Grid */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,237,232,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Platform overview</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.5)", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Admin Sections */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,237,232,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Admin sections</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 28 }}>
        {pages.map(p => (
          <a key={p.url} href={p.url} style={{ border: `1px solid ${p.color}44`, borderRadius: 10, padding: "14px 10px", textAlign: "center", cursor: "pointer", textDecoration: "none", display: "block", background: "rgba(255,255,255,0.03)", fontSize: 13, fontWeight: 600, color: p.color }}>
            {p.label}
          </a>
        ))}
      </div>

      {/* Activity Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Recent Users */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            👥 Recent Users
            <a href="/admin/users" style={{ fontSize: 12, color: "#E8533A", textDecoration: "none" }}>View all →</a>
          </div>
          {recentUsers.length === 0 ? (
            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.4)", textAlign: "center", padding: 20 }}>No users yet</div>
          ) : recentUsers.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {u.full_name?.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.full_name}</div>
                <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: getRoleColor(u.role), background: getRoleColor(u.role) + "22", padding: "2px 6px", borderRadius: 4 }}>{u.role}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: getKycColor(u.kyc_status), background: getKycColor(u.kyc_status) + "22", padding: "2px 6px", borderRadius: 4 }}>{u.kyc_status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Listings */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            📦 Recent Listings
            <a href="/admin/listings" style={{ fontSize: 12, color: "#E8533A", textDecoration: "none" }}>View all →</a>
          </div>
          {recentListings.length === 0 ? (
            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.4)", textAlign: "center", padding: 20 }}>No listings yet</div>
          ) : recentListings.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {l.type === "product" ? "🛍️" : l.type === "service" ? "🔧" : l.type === "job" ? "💼" : "🏠"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>by {l.seller_name} · {l.price_currency} {Number(l.price).toLocaleString()}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#2D9E6B", background: "rgba(45,158,107,0.12)", padding: "2px 6px", borderRadius: 4 }}>active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
