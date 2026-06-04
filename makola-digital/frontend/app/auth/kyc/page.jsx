"use client";
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth.service";

const ID_TYPES = [{ id:"national_id", label:"National ID", icon:"🪪" },{ id:"passport", label:"Passport", icon:"🛂" },{ id:"drivers_license", label:"Driver's License", icon:"🚗" }];
const BIZ_TYPES = ["Sole proprietor / Individual","Registered company (Ltd / LLC)","Partnership","NGO / Non-profit"];
const CATEGORIES = ["Electronics & Gadgets","Fashion & Clothing","Food & Agriculture","Web & Tech Services","Real Estate & Rentals","Vehicles","Health & Beauty","Other"];

export default function KycPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [idType, setIdType] = useState("national_id");
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [idNumber, setIdNumber] = useState("");
  const [biz, setBiz] = useState({ name:"", type:"", category:"", address:"", description:"", regNo:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("idType", idType);
      fd.append("idNumber", idNumber);
      if (frontFile) fd.append("idFront", frontFile);
      if (backFile) fd.append("idBack", backFile);
      Object.entries(biz).forEach(([k,v]) => fd.append(k, v));
      const token = localStorage.getItem("makola_token");
      const res = await fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/kyc/submit", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep(3);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inp = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"12px 14px", color:"#F0EDE8", fontSize:13.5, outline:"none", marginBottom:14 };
  const lbl = { display:"block", fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.5)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 };

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 16px" }}>
      <div style={{ width:"100%", maxWidth:500, background:"#0F0F0F", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"40px 36px" }}>

        {/* Step Indicator */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
          {["Account","Email","Identity","Business"].map((s, i) => (
            <>
              <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, background: i < step+1 ? "#2D9E6B" : i === step ? "#E8533A" : "transparent", border: `1.5px solid ${i < step ? "#2D9E6B" : i === step ? "#E8533A" : "rgba(255,255,255,0.15)"}`, color: i <= step ? "#fff" : "rgba(240,237,232,0.4)" }}>
                  {i < step ? "✓" : i+1}
                </div>
                <span style={{ fontSize:11.5, fontWeight:600, color: i === step ? "#F0EDE8" : "rgba(240,237,232,0.4)" }}>{s}</span>
              </div>
              {i < 3 && <div style={{ flex:1, height:1.5, background: i < step ? "#2D9E6B" : "rgba(255,255,255,0.09)" }} />}
            </>
          ))}
        </div>

        {step === 1 && (
          <>
            <h2 style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:6 }}>Identity verification</h2>
            <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:24 }}>Step 3 of 4 — Choose your ID type</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:18 }}>
              {ID_TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => setIdType(t.id)}
                  style={{ background: idType===t.id ? "rgba(232,83,58,0.08)" : "rgba(255,255,255,0.04)", border:`1.5px solid ${idType===t.id?"#E8533A":"rgba(255,255,255,0.09)"}`, borderRadius:10, padding:"12px 8px", cursor:"pointer", textAlign:"center", color: idType===t.id?"#E8533A":"#F0EDE8" }}>
                  <div style={{ fontSize:22, marginBottom:5 }}>{t.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700 }}>{t.label}</div>
                </button>
              ))}
            </div>
            <div><label style={lbl}>ID Number</label><input style={inp} placeholder="Enter ID number" value={idNumber} onChange={e => setIdNumber(e.target.value)} /></div>
            <div>
              <label style={lbl}>Front of ID</label>
              <div onClick={() => document.getElementById("front-inp").click()}
                style={{ background:"rgba(255,255,255,0.03)", border:`2px dashed ${frontFile?"#2D9E6B":"rgba(255,255,255,0.12)"}`, borderRadius:13, padding:24, textAlign:"center", cursor:"pointer", marginBottom:14 }}>
                {frontFile ? <><div style={{ fontSize:28, marginBottom:6 }}>📄</div><div style={{ fontSize:13, fontWeight:700, color:"#2D9E6B" }}>{frontFile.name}</div></> : <><div style={{ fontSize:28, marginBottom:6 }}>📄</div><div style={{ fontSize:13, fontWeight:700 }}>Upload front of ID</div><div style={{ fontSize:11.5, color:"rgba(240,237,232,0.45)", marginTop:4 }}>JPG, PNG or PDF · Max 5MB</div></>}
              </div>
              <input id="front-inp" type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFrontFile(e.target.files[0])} />
            </div>
            <div>
              <label style={lbl}>Back of ID</label>
              <div onClick={() => document.getElementById("back-inp").click()}
                style={{ background:"rgba(255,255,255,0.03)", border:`2px dashed ${backFile?"#2D9E6B":"rgba(255,255,255,0.12)"}`, borderRadius:13, padding:24, textAlign:"center", cursor:"pointer", marginBottom:20 }}>
                {backFile ? <><div style={{ fontSize:28, marginBottom:6 }}>📋</div><div style={{ fontSize:13, fontWeight:700, color:"#2D9E6B" }}>{backFile.name}</div></> : <><div style={{ fontSize:28, marginBottom:6 }}>📋</div><div style={{ fontSize:13, fontWeight:700 }}>Upload back of ID</div><div style={{ fontSize:11.5, color:"rgba(240,237,232,0.45)", marginTop:4 }}>JPG, PNG or PDF · Max 5MB</div></>}
              </div>
              <input id="back-inp" type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={e => setBackFile(e.target.files[0])} />
            </div>
            <button onClick={() => setStep(2)} style={{ width:"100%", background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:13, borderRadius:11, fontSize:14.5, fontWeight:900, cursor:"pointer" }}>Continue to Business Info →</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:6 }}>Business information</h2>
            <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:24 }}>Step 4 of 4 — Almost done!</p>
            {error && <div style={{ background:"rgba(232,83,58,0.12)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}
            <div><label style={lbl}>Business / Trading Name</label><input style={inp} placeholder="e.g. TechHub GH" value={biz.name} onChange={e => setBiz(b=>({...b,name:e.target.value}))} /></div>
            <div><label style={lbl}>Business Type</label><select style={{ ...inp, cursor:"pointer" }} value={biz.type} onChange={e => setBiz(b=>({...b,type:e.target.value}))}><option value="">Select type</option>{BIZ_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Primary Category</label><select style={{ ...inp, cursor:"pointer" }} value={biz.category} onChange={e => setBiz(b=>({...b,category:e.target.value}))}><option value="">What do you sell?</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={lbl}>Business Address</label><input style={inp} placeholder="Street, City, Country" value={biz.address} onChange={e => setBiz(b=>({...b,address:e.target.value}))} /></div>
            <div><label style={lbl}>Description</label><textarea style={{ ...inp, minHeight:80, resize:"vertical" }} placeholder="Describe what you sell in 2-3 sentences..." value={biz.description} onChange={e => setBiz(b=>({...b,description:e.target.value}))} /></div>
            <div style={{ display:"flex", gap:12, marginTop:4 }}>
              <button type="button" onClick={() => setStep(1)} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", color:"#F0EDE8", padding:13, borderRadius:11, fontSize:14, fontWeight:700, cursor:"pointer" }}>← Back</button>
              <button type="button" onClick={handleSubmit} disabled={loading} style={{ flex:2, background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:13, borderRadius:11, fontSize:14.5, fontWeight:900, cursor:"pointer", opacity:loading?0.6:1 }}>{loading?"Submitting...":"Submit for verification →"}</button>
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:56, marginBottom:18 }}>🎉</div>
            <h2 style={{ fontSize:24, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:10 }}>Application submitted!</h2>
            <p style={{ fontSize:13.5, color:"rgba(240,237,232,0.55)", lineHeight:1.65, marginBottom:24 }}>Your KYC is under review. You'll hear from us within 24 hours. You can start listing while we process your verification.</p>
            <div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(45,158,107,0.08)", border:"1px solid rgba(45,158,107,0.25)", borderRadius:12, padding:"14px 16px", marginBottom:24, textAlign:"left" }}>
              <span style={{ fontSize:24 }}>⏳</span>
              <div><div style={{ fontSize:13, fontWeight:700, color:"#2D9E6B" }}>Verification pending</div><div style={{ fontSize:11.5, color:"rgba(240,237,232,0.5)", marginTop:2 }}>Usually completed within 24 hours</div></div>
            </div>
            <button onClick={() => router.push("/dashboard")} style={{ width:"100%", background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:13, borderRadius:11, fontSize:14.5, fontWeight:900, cursor:"pointer" }}>Go to my dashboard →</button>
          </div>
        )}
      </div>
    </div>
  );
}
