"use client";
const SELLERS = [
  { id:1, name:"TechHub GH", email:"tech@hub.com", plan:"pro", listings:34, revenue:"GH₵ 248k", status:"active", verified:true },
  { id:2, name:"Ama Couture", email:"ama@couture.com", plan:"starter", listings:18, revenue:"GH₵ 42k", status:"active", verified:true },
  { id:3, name:"QuickSell GH", email:"quick@sell.com", plan:"free", listings:5, revenue:"GH₵ 8k", status:"suspended", verified:false },
  { id:4, name:"AutoLink GH", email:"auto@link.com", plan:"pro", listings:22, revenue:"GH₵ 185k", status:"active", verified:true },
];
export default function AdminSellers() {
  const s = { page:{ background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#F0EDE8", padding:28 } };
  return (
    <div style={s.page}>
      <a href="/admin/dashboard" style={{ color:"#E8533A", fontSize:13, fontWeight:700, textDecoration:"none" }}>← Admin dashboard</a>
# Listings moderation page
cat > app/admin/listings/page.jsx << 'EOF'
"use client";
import { useState } from "react";
const FLAGGED = [
  { id:1, title:"Rolex Replica Watch", seller:"QuickSell GH", reason:"Counterfeit goods", reports:4 },
  { id:2, title:"Get rich quick scheme", seller:"EasyMoney GH", reason:"Scam/misleading", reports:11 },
  { id:3, title:"iPhone 15 — 50% off URGENT", seller:"Deals4You", reason:"Suspected fraud", reports:3 },
  { id:4, title:"Unlicensed pharmaceuticals", seller:"HealthShop GH", reason:"Prohibited item", reports:7 },
];
export default function AdminListings() {
  const [items, setItems] = useState(FLAGGED);
  const s = { page:{ background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#F0EDE8", padding:28 }, card:{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:13, padding:18, marginBottom:10, display:"flex", alignItems:"center", gap:14 } };
  return (
    <div style={s.page}>
      <a href="/admin/dashboard" style={{ color:"#E8533A", fontSize:13, fontWeight:700, textDecoration:"none" }}>← Admin dashboard</a>
      <div style={{ fontSize:22, fontWeight:900, margin:"16px 0 6px", letterSpacing:"-0.03em" }}>📦 Flagged Listings</div>
      <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:20 }}>{items.length} listings need review</div>
      {items.map(item => (
        <div key={item.id} style={{ ...s.card, borderLeft:`3px solid #E8533A` }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:14 }}>{item.title}</div>
            <div style={{ fontSize:12, color:"rgba(240,237,232,0.5)", margin:"3px 0" }}>by {item.seller}</div>
            <div style={{ fontSize:12, background:"rgba(232,83,58,0.1)", border:"1px solid rgba(232,83,58,0.25)", color:"#E8533A", display:"inline-block", padding:"2px 8px", borderRadius:5, fontWeight:700 }}>⚠ {item.reason} · {item.reports} reports</div>
          </div>
          <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background:"rgba(45,158,107,0.1)", border:"1px solid rgba(45,158,107,0.3)", color:"#2D9E6B", padding:"8px 14px", borderRadius:9, fontWeight:700, cursor:"pointer", marginRight:8, fontFamily:"inherit" }}>✓ Keep</button>
          <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))} style={{ background:"rgba(232,83,58,0.1)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"8px 14px", borderRadius:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>🗑 Remove</button>
        </div>
      ))}
      {items.length === 0 && <div style={{ textAlign:"center", padding:48, color:"rgba(240,237,232,0.4)" }}>✅ All listings reviewed</div>}
    </div>
  );
}
