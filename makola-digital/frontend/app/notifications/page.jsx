"use client";
import { useState } from "react";
export default function NotificationsPage() {
  const [notifs] = useState([
    { id:1, icon:"📦", title:"New order received", msg:"Kofi Mensah purchased iPhone 15 Pro", time:"2 min ago", unread:true },
    { id:2, icon:"⭐", title:"New review", msg:"Ama Asante left a 5★ review", time:"1 hr ago", unread:true },
    { id:3, icon:"💰", title:"Payment received", msg:"GH₵ 8,755 deposited", time:"3 hrs ago", unread:false },
  ]);
  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F0EDE8',fontFamily:'sans-serif',padding:28}}>
      <h1 style={{fontSize:22,fontWeight:900,marginBottom:24}}>Notifications</h1>
      {notifs.map(n => (
        <div key={n.id} style={{display:'flex',gap:14,padding:'14px 16px',borderRadius:12,marginBottom:8,background:n.unread?'rgba(232,83,58,0.06)':'rgba(255,255,255,0.03)',border:'1px solid '+(n.unread?'rgba(232,83,58,0.2)':'rgba(255,255,255,0.07)')}}>
          <div style={{fontSize:24}}>{n.icon}</div>
          <div>
            <div style={{fontWeight:700}}>{n.title}</div>
            <div style={{fontSize:13,color:'rgba(240,237,232,0.5)',marginTop:3}}>{n.msg}</div>
            <div style={{fontSize:11,color:'rgba(240,237,232,0.3)',marginTop:4}}>{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}