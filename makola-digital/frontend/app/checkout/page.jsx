"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:4000/api/v1" });

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(false); }, []);

  if (loading) return <div style={{background:"#0A0A0A",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#F0EDE8",fontFamily:"sans-serif"}}>Loading order...</div>;

  return (
    <div style={{background:"#0A0A0A",minHeight:"100vh",color:"#F0EDE8",fontFamily:"sans-serif",padding:28}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <h1 style={{fontSize:24,fontWeight:900,marginBottom:8}}>Checkout</h1>
        <p style={{color:"rgba(240,237,232,0.5)"}}>Complete your purchase securely</p>
        <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:13,padding:24,marginTop:24}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>Payment method</div>
          {["🇬🇭 Mobile Money (Ghana)","💳 Card payment","🌍 Flutterwave (Africa)"].map(m => (
            <div key={m} style={{padding:"12px 16px",borderRadius:9,border:"1px solid rgba(255,255,255,0.09)",marginBottom:10,cursor:"pointer"}}>{m}</div>
          ))}
          <button style={{width:"100%",background:"#E8533A",border:"none",color:"#fff",padding:14,borderRadius:12,fontSize:15,fontWeight:900,cursor:"pointer",marginTop:8,fontFamily:"sans-serif"}}>Pay now →</button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div style={{background:"#0A0A0A",minHeight:"100vh",color:"#F0EDE8",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>Loading...</div>}><CheckoutContent /></Suspense>;
}