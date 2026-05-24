"use client";
import { useState, Suspense } from "react";
function CheckoutContent() {
  const [method, setMethod] = useState('momo');
  const methods = [{id:'momo',label:'🇬🇭 Mobile Money (Ghana)',sub:'MTN, Vodafone, AirtelTigo'},{id:'card',label:'💳 Card payment',sub:'Visa, Mastercard'},{id:'flw',label:'🌍 Flutterwave',sub:'Pan-Africa, 54 countries'}];
  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F0EDE8',fontFamily:'sans-serif',padding:28}}>
      <div style={{maxWidth:560,margin:'0 auto'}}>
        <h1 style={{fontSize:24,fontWeight:900,marginBottom:6}}>Checkout</h1>
        <p style={{color:'rgba(240,237,232,0.5)',marginBottom:24}}>Complete your purchase securely</p>
        <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:13,padding:20,marginBottom:16}}>
          <div style={{fontWeight:800,marginBottom:14}}>Payment method</div>
          {methods.map(m=><div key={m.id} onClick={()=>setMethod(m.id)} style={{padding:'12px 16px',borderRadius:10,border:'1.5px solid '+(method===m.id?'#E8533A':'rgba(255,255,255,0.09)'),marginBottom:10,cursor:'pointer',background:method===m.id?'rgba(232,83,58,0.07)':'transparent'}}><div style={{fontWeight:700}}>{m.label}</div><div style={{fontSize:12,color:'rgba(240,237,232,0.5)',marginTop:3}}>{m.sub}</div></div>)}
        </div>
        <button style={{width:'100%',background:'#E8533A',border:'none',color:'#fff',padding:14,borderRadius:12,fontSize:15,fontWeight:900,cursor:'pointer',fontFamily:'sans-serif'}}>Pay now →</button>
      </div>
    </div>
  );
}
export default function CheckoutPage() {
  return <Suspense fallback={<div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F0EDE8',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>Loading...</div>}><CheckoutContent/></Suspense>;
}