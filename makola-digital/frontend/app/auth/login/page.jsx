"use client";
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value ?? e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const result = await authService.login(form.email, form.password, form.remember);
      if (result && result.requiresOtp) {
        setOtpEmail(result.email);
        setOtpRequired(true);
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setOtpLoading(true); setError('');
    try {
      const API = `${process.env.NEXT_PUBLIC_API_URL}';
      const res = await fetch(API + '/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('makola_token', data.accessToken);
        localStorage.setItem('makola_refresh', data.refreshToken);
        router.push('/dashboard');
      } else { setError(data.message); }
    } catch(e) { setError('Verification failed'); }
    setOtpLoading(false);
  };

  if (otpRequired) return (
    <div style={{ minHeight:'100vh', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 16px' }}>
      <div style={{ width:'100%', maxWidth:420, background:'#0F0F0F', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'40px 36px', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔐</div>
        <h1 style={{ fontSize:22, fontWeight:900, color:'#F0EDE8', marginBottom:8 }}>Check your email</h1>
        <p style={{ fontSize:13, color:'rgba(240,237,232,0.5)', marginBottom:24 }}>We sent a 6-digit code to <strong style={{ color:'#E8533A' }}>{otpEmail}</strong></p>
        {error && <div style={{ background:'rgba(232,83,58,0.12)', border:'1px solid rgba(232,83,58,0.3)', color:'#E8533A', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}
        <input value={otp} onChange={e => setOtp(e.target.value)} placeholder='Enter 6-digit code' maxLength={6} style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, padding:'14px', color:'#F0EDE8', fontSize:24, outline:'none', textAlign:'center', letterSpacing:'8px', marginBottom:16, boxSizing:'border-box' }} />
        <button onClick={verifyOtp} disabled={otpLoading || otp.length !== 6} style={{ width:'100%', background:'linear-gradient(135deg,#E8533A,#C47F17)', border:'none', color:'#fff', padding:13, borderRadius:11, fontSize:14.5, fontWeight:900, cursor:'pointer', opacity: otp.length !== 6 ? 0.5 : 1 }}>{otpLoading ? 'Verifying...' : 'Verify Code →'}</button>
        <button onClick={() => { setOtpRequired(false); setOtp(''); setError(''); }} style={{ marginTop:12, background:'none', border:'none', color:'rgba(240,237,232,0.5)', fontSize:13, cursor:'pointer' }}>← Back to login</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:"flex", alignItems:"center", justifyContent:"center", background:"#0A0A0A" }}>
      <div style={{ width:"100%", maxWidth:420, padding:"40px 32px", background:"#0F0F0F", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🌍</div>
          <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:"-.03em", color:"#F0EDE8" }}>Welcome back</h1>
          <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginTop:6 }}>
            No account? <Link href="/auth/register" style={{ color:"#E8533A", fontWeight:700 }}>Create one free</Link>
          </p>
        </div>

        <button onClick={() => alert("Google login coming soon!")} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"#F0EDE8", padding:12, borderRadius:11, fontSize:13.5, fontWeight:700, cursor:"pointer", marginBottom:20 }}>
          🇬 Continue with Google
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.09)" }} />
          <span style={{ fontSize:11.5, color:"rgba(240,237,232,0.3)", fontWeight:600 }}></span>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.09)" }} />
        </div>

        {error && <div style={{ background:"rgba(232,83,58,0.12)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.5)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Email</label>
            <input type="email" required placeholder="you@example.com" value={form.email} onChange={set("email")}
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"12px 14px", color:"#F0EDE8", fontSize:13.5, outline:"none" }} />
          </div>
          <div style={{ marginBottom:8 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.5)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPw?"text":"password"} required placeholder="Your password" value={form.password} onChange={set("password")}
                style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"12px 44px 12px 14px", color:"#F0EDE8", fontSize:13.5, outline:"none" }} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:17, color:"rgba(240,237,232,0.35)" }}>
                {showPw?"🙈":"👁"}
              </button>
            </div>
          </div>
          <Link href="/auth/forgot-password" style={{ display:"block", textAlign:"right", fontSize:12, color:"#E8533A", fontWeight:700, textDecoration:"none", marginBottom:16 }}>Forgot password?</Link>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:20 }}>
            <input type="checkbox" id="rem" checked={form.remember} onChange={(e) => setForm(f => ({ ...f, remember: e.target.checked }))} style={{ accentColor:"#E8533A" }} />
            <label htmlFor="rem" style={{ fontSize:12.5, color:"rgba(240,237,232,0.55)" }}>Keep me signed in for 30 days</label>
          </div>
          <button type="submit" disabled={loading}
            style={{ width:"100%", background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:13, borderRadius:11, fontSize:14.5, fontWeight:900, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1 }}>
            {loading ? "Signing in..." : "Sign in to Makola →"}
          </button>
        </form>
      </div>
    </div>
  );
}
