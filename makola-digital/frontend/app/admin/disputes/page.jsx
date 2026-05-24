"use client";
import { useState } from "react";
const DISPUTES = [
  { id:1, ref:"MKL-948271", buyer:"Kofi Mensah", seller:"TechHub GH", item:"iPhone 15 Pro Max", amount:"GH₵ 8,755", reason:"Item not as described", opened:"2 hrs ago", priority:"high" },
  { id:2, ref:"MKL-948103", buyer:"Fatima Dankwa", seller:"CodeAfrica", item:"Web Dev Service", amount:"GH₵ 2,000", reason:"Work delivered 3 weeks late", opened:"1 day ago", priority:"medium" },
  { id:3, ref:"MKL-947022", buyer:"Ama Asante", seller:"PrimeSpace GH", item:"Apartment Deposit", amount:"GH₵ 4,500", reason:"Apartment not available", opened:"3 days ago", priority:"high" },
];
export default function AdminDisputes() {
  const [disputes, setDisputes] = useState(DISPUTES);
  const s = { page:{ background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#F0EDE8", padding:28 } };
  return (
    <div style={s.page}>
      <a href="/admin/dashboard" style={{ color:"#E8533A", fontSize:13, fontWeight:700, textDecoration:"none" }}>← Admin dashboard</a>
      <div style={{ fontSize:22, fontWeight:900, margin:"16px 0 6px", letterSpacing:"-0.03em" }}>⚖️ Disputes</div>
      <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:20 }}>{disputes.length} open disputes</div>
      {disputes.map(d => (
        <div key={d.id} style={{ background:"rgba(255,255,255,0.05)", border:`1px solid rgba(255,255,255,0.09)`, borderLeft:`3px solid ${d.priority==="high"?"#E8533A":"#C47F17"}`, borderRadius:13, padding:18, marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontFamily:"monospace", color:"#3B7DD8", fontSize:13, fontWeight:800 }}>{d.ref}</span>
            <span style={{ fontSize:11, color:"rgba(240,237,232,0.4)" }}>{d.opened}</span>
          </div>
          <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>{d.item} · {d.amount}</div>
          <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:12 }}>{d.buyer} vs {d.seller} · "{d.reason}"</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setDisputes(p => p.filter(x => x.id !== d.id))} style={{ background:"rgba(45,158,107,0.1)", border:"1px solid rgba(45,158,107,0.3)", color:"#2D9E6B", padding:"8px 14px", borderRadius:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Refund buyer</button>
            <button onClick={() => setDisputes(p => p.filter(x => x.id !== d.id))} style={{ background:"rgba(59,125,216,0.1)", border:"1px solid rgba(59,125,216,0.3)", color:"#3B7DD8", padding:"8px 14px", borderRadius:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Release to seller</button>
            <button style={{ background:"rgba(232,83,58,0.1)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"8px 14px", borderRadius:9, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Escalate</button>
          </div>
        </div>
      ))}
    </div>
  );
}
