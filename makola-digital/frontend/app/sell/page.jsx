"use client";
import { useState } from "react";
const STEPS = ['Type','Details','Pricing','Photos','Location','Extras','Review'];
const TYPES = [{icon:'🛍️',label:'Product',val:'product',desc:'Physical or digital goods'},{icon:'🔧',label:'Service',val:'service',desc:'Skills & trades'},{icon:'💼',label:'Job',val:'job',desc:'Full-time, part-time'},{icon:'🏠',label:'Rental',val:'rental',desc:'Property & vehicles'}];
export default function SellPage() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState('product');
  const [title, setTitle] = useState('');
  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F0EDE8',fontFamily:'sans-serif',padding:28,maxWidth:700,margin:'0 auto'}}>
      <div style={{fontSize:12,fontWeight:700,color:'rgba(240,237,232,0.4)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:12}}>STEP {step+1} OF {STEPS.length} — {STEPS[step].toUpperCase()}</div>
      <div style={{display:'flex',gap:6,marginBottom:28}}>{STEPS.map((s,i)=><div key={s} style={{flex:1,height:4,borderRadius:2,background:i<=step?'#E8533A':'rgba(255,255,255,0.1)'}}/>)}</div>
      {step===0&&<><h2 style={{fontSize:22,fontWeight:900,marginBottom:20}}>What are you listing?</h2><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>{TYPES.map(t=><div key={t.val} onClick={()=>setType(t.val)} style={{background:'rgba(255,255,255,0.04)',border:'2px solid '+(type===t.val?'#E8533A':'rgba(255,255,255,0.09)'),borderRadius:14,padding:20,cursor:'pointer',textAlign:'center'}}><div style={{fontSize:32,marginBottom:8}}>{t.icon}</div><div style={{fontWeight:800}}>{t.label}</div><div style={{fontSize:12,color:'rgba(240,237,232,0.5)',marginTop:4}}>{t.desc}</div></div>)}</div></>}
      {step===1&&<><h2 style={{fontSize:22,fontWeight:900,marginBottom:20}}>Listing details</h2><input value={title} onChange={e=>setTitle(e.target.value)} placeholder='Listing title' style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:12,padding:13,color:'#F0EDE8',fontSize:14,fontFamily:'sans-serif',boxSizing:'border-box',marginBottom:14}}/><textarea placeholder='Description' rows={5} style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:12,padding:13,color:'#F0EDE8',fontSize:14,fontFamily:'sans-serif',boxSizing:'border-box',resize:'vertical'}}/></>}
      {step>1&&<div style={{textAlign:'center',padding:48,color:'rgba(240,237,232,0.4)'}}>Step {step+1}: {STEPS[step]}</div>}
      <button onClick={()=>step<STEPS.length-1&&setStep(s=>s+1)} style={{width:'100%',background:'linear-gradient(135deg,#E8533A,#C47F17)',border:'none',color:'#fff',padding:15,borderRadius:13,fontSize:15,fontWeight:900,cursor:'pointer',fontFamily:'sans-serif',marginTop:20}}>Continue →</button>
    </div>
  );
}