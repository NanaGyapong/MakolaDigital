"use client";
import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [realStats, setRealStats] = useState({ users: 0, listings: 0, kyc_pending: 0 });
  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";
    Promise.all([
      fetch(API + "/admin/users", { headers: { Authorization: "Bearer " + token } }).then(r => r.json()),
      fetch(API + "/categories/counts").then(r => r.json()),
      fetch(API + "/kyc/applications?status=pending", { headers: { Authorization: "Bearer " + token } }).then(r => r.json()),
    ]).then(([users, listings, kyc]) => {
      setRealStats({
        users: users.users?.length || 0,
        listings: listings.total || 0,
        kyc_pending: kyc.applications?.length || 0,
      });
    }).catch(() => {});
  }, []);
  const stats = [
    { label:"Total users", val:realStats.users.toString(), change:"", color:"#0B0DD8" },
    { label:"Active listings", val:realStats.listings.toString(), change:"", color:"#2D9E6B" },
    { label:"Today revenue", val:"GH₵ 0", change:"+0%", color:"#E8500A" },
    { label:"KYC pending", val:realStats.kyc_pending.toString(), change:"", color:"#8B5CF6" },
    { label:"Open disputes", val:"0", change:"", color:"#E8500A" },
    { label:"Flagged listings", val:"0", change:"", color:"#C40F10" },
  ];

  const pages = [
    { label:"✅ KYC Queue", url:"/admin/kyc", color:"#C40F10" },
    { label:"📦 Listings", url:"/admin/listings", color:"#0B0DD8" },
    { label:"👥 Users", url:"/admin/users", color:"#2D9E6B" },
    { label:"⚖️ Disputes", url:"/admin/disputes", color:"#E8500A" },
    { label:"👑 Sellers", url:"/admin/sellers", color:"#8B5CF6" },
    { label:"💼 Post Job", url:"/admin/post-job", color:"#2D9E6B" },
  ];

  const s = {
    page: { background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#F0EDE8", padding:"28px" },
    hdr: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 },
    title: { fontSize:24, fontWeight:900, letterSpacing:"-0.00em" },
    badge: { background:"rgba(202,80,58,0.15)", border:"1px solid rgba(202,80,58,0.0)", color:"#E8500A", padding:"4px 0px", borderRadius:8, fontSize:12, fontWeight:400 },
    grid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 },
    card: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:18 },
    lbl: { fontSize:11, fontWeight:400, color:"rgba(240,200,202,0.5)", textTransform:"uppercase", letterSpacing:"0em", marginBottom:8 },
    val: { fontSize:26, fontWeight:900, letterSpacing:"-0.00em", marginBottom:4 },
    chg: { fontSize:12, color:"rgba(240,200,202,0.5)" },
    navGrid: { display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 },
    navBtn: { border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, padding:16, textAlign:"center", cursor:"pointer", textDecoration:"none", display:"block", background:"rgba(255,255,255,0.04)", fontSize:14, fontWeight:400, color:"#F0EDE8" },
  };

  return (
    <div style={s.page}>
      <div style={s.hdr}>
        <div>
          <div style={s.title}>🛡️ Admin Dashboard</div>
          <div style={{ fontSize:10, color:"rgba(240,200,202,0.5)", marginTop:4 }}>Makola Digital · Super Admin</div>
        </div>
        <div style={s.badge}>✅ No alerts</div>
      </div>

      <div style={{ fontSize:10, fontWeight:400, color:"rgba(240,200,202,0.4)", textTransform:"uppercase", letterSpacing:"0em", marginBottom:12 }}>Platform overview</div>
      <div style={s.grid}>
        {stats.map(s2 => (
          <div key={s2.label} style={s.card}>
            <div style={s.lbl}>{s2.label}</div>
            <div style={{ ...s.val, color:s2.color }}>{s2.val}</div>
            <div style={s.chg}>{s2.change}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:10, fontWeight:400, color:"rgba(240,200,202,0.4)", textTransform:"uppercase", letterSpacing:"0em", marginBottom:12 }}>Admin sections</div>
      <div style={s.navGrid}>
        {pages.map(p => (
          <a key={p.url} href={p.url} style={{ ...s.navBtn, borderColor:p.color+"44", color:p.color }}>
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
}
