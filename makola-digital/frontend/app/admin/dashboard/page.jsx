"use client";
import { useState, useEffect } from "react";
import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:4000/api/v1" });

export default function AdminDashboard() {
  const stats = [
    { label:"Total users", val:"0", change:"+0 today", color:"#3B7DD8" },
    { label:"Active listings", val:"0", change:"+0 today", color:"#2D9E6B" },
    { label:"Today revenue", val:"GH₵ 0", change:"+0%", color:"#E8533A" },
    { label:"KYC pending", val:"7", change:"Needs review", color:"#C47F17" },
    { label:"Open disputes", val:"3", change:"Urgent", color:"#E8533A" },
    { label:"Flagged listings", val:"12", change:"Review needed", color:"#C47F17" },
  ];

  const pages = [
    { label:"✅ KYC Queue", url:"/admin/kyc", color:"#C47F17" },
    { label:"📦 Listings", url:"/admin/listings", color:"#3B7DD8" },
    { label:"👥 Users", url:"/admin/users", color:"#2D9E6B" },
    { label:"⚖️ Disputes", url:"/admin/disputes", color:"#E8533A" },
    { label:"👑 Sellers", url:"/admin/sellers", color:"#8B5CF6" },
  ];

  const s = {
    page: { background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#F0EDE8", padding:"28px" },
    hdr: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 },
    title: { fontSize:24, fontWeight:900, letterSpacing:"-0.03em" },
    badge: { background:"rgba(232,83,58,0.15)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"4px 12px", borderRadius:8, fontSize:12, fontWeight:700 },
    grid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 },
    card: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:13, padding:18 },
    lbl: { fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.5)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 },
    val: { fontSize:26, fontWeight:900, letterSpacing:"-0.03em", marginBottom:4 },
    chg: { fontSize:12, color:"rgba(240,237,232,0.5)" },
    navGrid: { display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 },
    navBtn: { border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, padding:16, textAlign:"center", cursor:"pointer", textDecoration:"none", display:"block", background:"rgba(255,255,255,0.04)", fontSize:14, fontWeight:700, color:"#F0EDE8" },
  };

  return (
    <div style={s.page}>
      <div style={s.hdr}>
        <div>
          <div style={s.title}>🛡️ Admin Dashboard</div>
          <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginTop:4 }}>Makola Digital · Super Admin</div>
        </div>
        <div style={s.badge}>✅ No alerts</div>
      </div>

      <div style={{ fontSize:13, fontWeight:700, color:"rgba(240,237,232,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Platform overview</div>
      <div style={s.grid}>
        {stats.map(s2 => (
          <div key={s2.label} style={s.card}>
            <div style={s.lbl}>{s2.label}</div>
            <div style={{ ...s.val, color:s2.color }}>{s2.val}</div>
            <div style={s.chg}>{s2.change}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:13, fontWeight:700, color:"rgba(240,237,232,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Admin sections</div>
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
