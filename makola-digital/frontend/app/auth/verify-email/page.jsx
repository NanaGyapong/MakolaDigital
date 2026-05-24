"use client";
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth.service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["","","","","",""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const refs = Array.from({ length: 6 }, () => useRef(null));

  useEffect(() => {
    const e = sessionStorage.getItem("verify_email");
    if (!e) { router.push("/auth/register"); return; }
    setEmail(e);
  }, []);

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) refs[i+1].current?.focus();
  };
  const handleKeyDown = (i, e) => { if (e.key==="Backspace" && !otp[i] && i>0) refs[i-1].current?.focus(); };
  const handlePaste = (e) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6).split("");
    if (digits.length === 6) { setOtp(digits); refs[5].current?.focus(); e.preventDefault(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the full 6-digit code"); return; }
    setError(""); setLoading(true);
    try {
      await authService.verifyEmail(email, code);
      sessionStorage.removeItem("verify_email");
      router.push("/auth/kyc");
    } catch (err) { setError(err.message || "Invalid or expired code"); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await authService.resendOtp(email);
      setCountdown(60);
      const iv = setInterval(() => setCountdown(c => { if(c<=1){clearInterval(iv);return 0;} return c-1; }), 1000);
    } catch (err) { setError(err.message); }
  };

  const inp = { width:52, height:56, textAlign:"center", fontSize:22, fontWeight:900, background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.09)", borderRadius:11, color:"#F0EDE8", outline:"none" };

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:400, background:"#0F0F0F", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"40px 32px", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
        <h1 style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:8 }}>Check your inbox</h1>
        <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:6 }}>We sent a 6-digit code to</p>
        <p style={{ fontSize:14, fontWeight:700, color:"#F0EDE8", marginBottom:28 }}>{email}</p>

        {error && <div style={{ background:"rgba(232,83,58,0.12)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:24 }} onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input key={i} ref={refs[i]} style={{ ...inp, borderColor: d ? "rgba(232,83,58,0.5)" : "rgba(255,255,255,0.09)" }}
                maxLength={1} value={d} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} />
            ))}
          </div>
          <button type="submit" disabled={loading || otp.join("").length < 6}
            style={{ width:"100%", background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:13, borderRadius:11, fontSize:14.5, fontWeight:900, cursor:"pointer", opacity: (loading || otp.join("").length < 6) ? 0.5 : 1, marginBottom:16 }}>
            {loading ? "Verifying..." : "Verify email →"}
          </button>
        </form>

        <p style={{ fontSize:12.5, color:"rgba(240,237,232,0.45)" }}>
          Didn't receive it?{" "}
          <span onClick={handleResend} style={{ color: countdown > 0 ? "rgba(240,237,232,0.3)" : "#E8533A", fontWeight:700, cursor: countdown > 0 ? "default" : "pointer" }}>
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
          </span>
        </p>
      </div>
    </div>
  );
}
