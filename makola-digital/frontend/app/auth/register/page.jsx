"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/auth.service";

const COUNTRIES = ["🇬🇭 Ghana","🇳🇬 Nigeria","🇰🇪 Kenya","🇿🇦 South Africa","🇬🇧 United Kingdom","🇺🇸 United States","🇨🇦 Canada","🇸🇳 Senegal"];
const DIALCODES = [{ flag:"🇬🇭", code:"+233" },{ flag:"🇳🇬", code:"+234" },{ flag:"🇰🇪", code:"+254" },{ flag:"🇿🇦", code:"+27" },{ flag:"🇬🇧", code:"+44" },{ flag:"🇺🇸", code:"+1" }];

function pwStrength(v) {
  if (!v) return { score: 0, label: "", color: "" };
  let s = 0;
  if (v.length >= 8) s++; if (/[A-Z]/.test(v)) s++; if (/[0-9]/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
  return [
    { score:0, label:"", color:"" },
    { score:1, label:"Weak", color:"#E8533A" },
    { score:2, label:"Fair", color:"#C47F17" },
    { score:3, label:"Good", color:"#3B7DD8" },
    { score:4, label:"Strong 💪", color:"#2D9E6B" },
  ][s];
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", dialCode:"+233", phone:"", password:"", country:"", accountType:"buyer", terms:false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type==="checkbox"?e.target.checked:e.target.value }));
  const pw = pwStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.terms) { setError("Please accept the terms of service"); return; }
    setError(""); setLoading(true);
    try {
      await authService.register({ fullName:`${form.firstName} ${form.lastName}`, email:form.email, phone:`${form.dialCode}${form.phone}`, password:form.password, country:form.country, accountType:form.accountType });
      sessionStorage.setItem("verify_email", form.email);
      router.push("/auth/verify-email");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inp = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"12px 14px", color:"#F0EDE8", fontSize:13.5, outline:"none" };
  const lbl = { display:"block", fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.5)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 };

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 16px" }}>
      <div style={{ width:"100%", maxWidth:480, background:"#0F0F0F", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"40px 36px" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🌍</div>
          <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-.03em", color:"#F0EDE8" }}>Create your account</h1>
          <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginTop:6 }}>Already have one? <Link href="/auth/login" style={{ color:"#E8533A", fontWeight:700 }}>Sign in</Link></p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Account type */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
            {[
              { t:"buyer", icon:"🛍️", name:"Buy / Browse", desc:"Shop products & services" },
              { t:"individual_seller", icon:"👤", name:"Individual Seller", desc:"Sell personal items" },
              { t:"seller", icon:"🏪", name:"Business / Company", desc:"Registered business" }
            ].map(({ t, icon, name, desc }) => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, accountType: t }))}
                style={{ background: form.accountType===t ? "rgba(232,83,58,0.08)" : "rgba(255,255,255,0.04)", border:`1.5px solid ${form.accountType===t?"#E8533A":"rgba(255,255,255,0.09)"}`, borderRadius:12, padding:"12px 8px", cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:11, fontWeight:800, color: form.accountType===t?"#E8533A":"#F0EDE8" }}>{name}</div>
                <div style={{ fontSize:10, color:"rgba(240,237,232,0.45)", marginTop:2 }}>{desc}</div>
              </button>
            ))}
          </div>

          {error && <div style={{ background:"rgba(232,83,58,0.12)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div><label style={lbl}>First name</label><input style={inp} required placeholder="Kofi" value={form.firstName} onChange={set("firstName")} /></div>
            <div><label style={lbl}>Last name</label><input style={inp} required placeholder="Mensah" value={form.lastName} onChange={set("lastName")} /></div>
          </div>

          <div style={{ marginBottom:14 }}><label style={lbl}>Email</label><input style={inp} type="email" required placeholder="kofi@example.com" value={form.email} onChange={set("email")} /></div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Phone number</label>
            <div style={{ display:"flex", gap:8 }}>
              <select value={form.dialCode} onChange={set("dialCode")} style={{ ...inp, width:110, paddingRight:8 }}>
                {DIALCODES.map(d => <option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
              </select>
              <input style={{ ...inp, flex:1 }} type="tel" placeholder="024 000 0000" value={form.phone} onChange={set("phone")} />
            </div>
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Password</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...inp, paddingRight:44 }} type={showPw?"text":"password"} required minLength={8} placeholder="Min. 8 characters" value={form.password} onChange={set("password")} />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:17, color:"rgba(240,237,232,0.35)" }}>{showPw?"🙈":"👁"}</button>
            </div>
            {form.password && (
              <>
                <div style={{ display:"flex", gap:4, marginTop:8 }}>
                  {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= pw.score ? pw.color : "rgba(255,255,255,0.1)", transition:"background .3s" }} />)}
                </div>
                <div style={{ fontSize:10.5, marginTop:5, fontWeight:600, color:pw.color }}>{pw.label}</div>
              </>
            )}
          </div>

          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Country</label>
            <select style={{ ...inp, cursor:"pointer" }} required value={form.country} onChange={set("country")}>
              <option value="">Select your country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
            <input type="checkbox" id="terms" required checked={form.terms} onChange={set("terms")} style={{ marginTop:3, accentColor:"#E8533A" }} />
            <label htmlFor="terms" style={{ fontSize:12.5, color:"rgba(240,237,232,0.55)", lineHeight:1.55 }}>I agree to the <Link href="/terms" style={{ color:"#E8533A", fontWeight:700 }}>Terms of Service</Link> and <Link href="/privacy" style={{ color:"#E8533A", fontWeight:700 }}>Privacy Policy</Link></label>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
          <input type='checkbox' required style={{ marginTop: 3, accentColor: '#E8533A', width: 16, height: 16 }} />
          <span style={{ fontSize: 13, color: 'rgba(240,237,232,0.6)' }}>I agree to the <a href='/terms' target='_blank' style={{ color: '#E8533A', textDecoration: 'none', fontWeight: 700 }}>Terms & Conditions</a> and <a href='/terms' target='_blank' style={{ color: '#E8533A', textDecoration: 'none', fontWeight: 700 }}>Privacy Policy</a> of Makola Digital</span>
        </label>
        <button type='submit' disabled={loading}
            style={{ width:"100%", background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:13, borderRadius:11, fontSize:14.5, fontWeight:900, cursor:loading?"not-allowed":"pointer", marginTop:16, opacity:loading?0.6:1 }}>
            {loading ? "Creating account..." : "Create free account →"}
          </button>
        </form>
      </div>
    </div>
  );
}
