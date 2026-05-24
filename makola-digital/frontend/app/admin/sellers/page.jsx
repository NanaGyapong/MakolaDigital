"use client";
const SELLERS = [
  { id:1, name:"TechHub GH", email:"tech@hub.com", plan:"pro", listings:34, revenue:"GH₵ 248k", status:"active", verified:true },
  { id:2, name:"Ama Couture", email:"ama@couture.com", plan:"starter", listings:18, revenue:"GH₵ 42k", status:"active", verified:true },
  { id:3, name:"QuickSell GH", email:"quick@sell.com", plan:"free", listings:5, revenue:"GH₵ 8k", status:"suspended", verified:false },
];
export default function AdminSellers() {
  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", fontFamily:"sans-serif", color:"#F0EDE8", padding:28 }}>
      <a href="/admin/dashboard" style={{ color:"#E8533A", fontSize:13, fontWeight:700, textDecoration:"none" }}>← Admin dashboard</a>
      <div style={{ fontSize:22, fontWeight:900, margin:"16px 0 6px" }}>👑 Seller Management</div>
      <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:20 }}>2,840 active sellers</div>
      {SELLERS.map(s => (
        <div key={s.id} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:13, padding:16, marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:800 }}>{s.name} {s.verified ? "✅" : "❌"}</div>
            <div style={{ fontSize:12, color:"rgba(240,237,232,0.5)" }}>{s.email} · {s.plan} · {s.listings} listings · {s.revenue}</div>
          </div>
          <span style={{ background:s.status==="active"?"rgba(45,158,107,0.15)":"rgba(232,83,58,0.15)", color:s.status==="active"?"#2D9E6B":"#E8533A", padding:"3px 10px", borderRadius:6, fontSize:12, fontWeight:700 }}>{s.status}</span>
        </div>
      ))}
    </div>
  );
}
