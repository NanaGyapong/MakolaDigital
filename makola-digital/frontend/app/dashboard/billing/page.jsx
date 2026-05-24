"use client";
import { useState, Suspense } from "react";
function BillingContent() {
  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F0EDE8',fontFamily:'sans-serif',padding:28}}>
      <h1 style={{fontSize:22,fontWeight:900,marginBottom:6}}>Billing & Subscription</h1>
      <p style={{color:'rgba(240,237,232,0.5)',marginBottom:24}}>Manage your Makola Digital plan and invoices</p>
      <div style={{background:'rgba(232,83,58,0.07)',border:'1px solid rgba(232,83,58,0.2)',borderRadius:14,padding:18,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div><div style={{fontSize:11,fontWeight:700,color:'rgba(240,237,232,0.5)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>Current plan</div><div style={{fontSize:22,fontWeight:900}}>Free</div><div style={{fontSize:13,color:'rgba(240,237,232,0.5)',marginTop:4}}>No active subscription</div></div>
        <button style={{background:'#E8533A',border:'none',color:'#fff',padding:'10px 20px',borderRadius:10,fontWeight:800,cursor:'pointer',fontFamily:'sans-serif'}}>Upgrade plan</button>
      </div>
      <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:13,padding:18}}>
        <div style={{fontWeight:800,marginBottom:16}}>Invoice history</div>
        <div style={{textAlign:'center',padding:32,color:'rgba(240,237,232,0.4)'}}>No invoices yet</div>
      </div>
    </div>
  );
}
export default function BillingPage() {
  return <Suspense fallback={<div>Loading...</div>}><BillingContent/></Suspense>;
}