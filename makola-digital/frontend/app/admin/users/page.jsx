"use client";
const USERS = [
  { id:1, name:"Kofi Mensah", email:"kofi@gmail.com", role:"seller", plan:"pro", status:"active", joined:"Jan 2024" },
  { id:2, name:"Ama Asante", email:"ama@gmail.com", role:"seller", plan:"starter", status:"active", joined:"Mar 2024" },
  { id:3, name:"Kwame Boateng", email:"kwame@outlook.com", role:"buyer", plan:"free", status:"active", joined:"Apr 2024" },
  { id:4, name:"Fatima Dankwa", email:"fatima@yahoo.com", role:"seller", plan:"free", status:"suspended", joined:"May 2024" },
];
export default function AdminUsers() {
  const s = { page:{ background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#F0EDE8", padding:28 } };
  return (
    <div style={s.page}>
      <a href="/admin/dashboard" style={{ color:"#E8533A", fontSize:13, fontWeight:700, textDecoration:"none" }}>← Admin dashboard</a>
      <div style={{ fontSize:22, fontWeight:900, margin:"16px 0 6px", letterSpacing:"-0.03em" }}>👥 User Management</div>
      <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:20 }}>22,140 total users</div>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead><tr>{["Name","Email","Role","Plan","Status","Joined"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:10, fontWeight:700, color:"rgba(240,237,232,0.35)", textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>{h}</th>)}</tr></thead>
        <tbody>{USERS.map(u => (
          <tr key={u.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <td style={{ padding:"12px 14px", fontWeight:700 }}>{u.name}</td>
            <td style={{ padding:"12px 14px", color:"rgba(240,237,232,0.5)" }}>{u.email}</td>
            <td style={{ padding:"12px 14px" }}><span style={{ background:"rgba(59,125,216,0.15)", color:"#3B7DD8", padding:"2px 8px", borderRadius:5, fontSize:11, fontWeight:700 }}>{u.role}</span></td>
            <td style={{ padding:"12px 14px" }}><span style={{ background:"rgba(196,127,23,0.15)", color:"#C47F17", padding:"2px 8px", borderRadius:5, fontSize:11, fontWeight:700 }}>{u.plan}</span></td>
            <td style={{ padding:"12px 14px" }}><span style={{ background:u.status==="active"?"rgba(45,158,107,0.15)":"rgba(232,83,58,0.15)", color:u.status==="active"?"#2D9E6B":"#E8533A", padding:"2px 8px", borderRadius:5, fontSize:11, fontWeight:700 }}>{u.status}</span></td>
            <td style={{ padding:"12px 14px", color:"rgba(240,237,232,0.5)" }}>{u.joined}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
