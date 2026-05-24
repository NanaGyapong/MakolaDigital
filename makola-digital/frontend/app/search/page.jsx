"use client";
import { useState, Suspense } from "react";
function SearchContent() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const types = ['All','Products','Services','Jobs','Rentals','Vehicles'];
  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F0EDE8',fontFamily:'sans-serif',display:'flex'}}>
      <div style={{width:220,background:'#0D0D0D',borderRight:'1px solid rgba(255,255,255,0.08)',padding:20,flexShrink:0}}>
        <div style={{fontWeight:800,marginBottom:16}}>Listing type</div>
        {types.map(t=><div key={t} onClick={()=>setType(t.toLowerCase())} style={{padding:'10px 14px',borderRadius:10,cursor:'pointer',marginBottom:6,background:type===t.toLowerCase()?'rgba(232,83,58,0.1)':'transparent',color:type===t.toLowerCase()?'#E8533A':'rgba(240,237,232,0.7)',fontWeight:type===t.toLowerCase()?800:400}}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:24}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search products, services, jobs, rentals...' style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:12,padding:'12px 16px',color:'#F0EDE8',fontSize:15,marginBottom:20,fontFamily:'sans-serif',boxSizing:'border-box'}}/>
        <div style={{color:'rgba(240,237,232,0.5)',textAlign:'center',padding:60}}><div style={{fontSize:48,marginBottom:16}}>🔍</div><div>No results found</div></div>
      </div>
    </div>
  );
}
export default function SearchPage() {
  return <Suspense fallback={<div style={{background:'#0A0A0A',minHeight:'100vh',color:'#F0EDE8',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>Loading...</div>}><SearchContent/></Suspense>;
}