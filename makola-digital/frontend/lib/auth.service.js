// lib/auth.service.js
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const s = { get: (k) => typeof window!=="undefined"?localStorage.getItem(k):null, set: (k,v)=>typeof window!=="undefined"&&localStorage.setItem(k,v), del: (k)=>typeof window!=="undefined"&&localStorage.removeItem(k) };
async function api(path, opts={}) {
  const res = await fetch(`${API}${path}`, { headers:{"Content-Type":"application/json",...opts.headers}, ...opts });
  const d = await res.json();
  if(!res.ok) {
    const err = new Error(d.message||"Request failed");
    err.status = res.status;
    throw err;
  }
  return d;
}
export const authService = {
  async register(payload) { return api("/auth/register",{method:"POST",body:JSON.stringify(payload)}); },
  async login(email,password,remember=true) {
    const d = await api("/auth/login",{method:"POST",body:JSON.stringify({email,password,remember})});
    if (d.requiresOtp) return d;
    s.set("makola_token",d.accessToken); s.set("makola_refresh",d.refreshToken);
    return d.user;
  },
  loginWithGoogle() { window.location.href=`${API}/auth/google`; },
  async logout() {
    const t=s.get("makola_token");
    if(t) await api("/auth/logout",{method:"POST",headers:{Authorization:`Bearer ${t}`}}).catch(()=>{});
    s.del("makola_token"); s.del("makola_refresh"); window.location.href="/";
  },
  async verifyEmail(email,otp) {
    const d = await api("/auth/verify-email",{method:"POST",body:JSON.stringify({email,otp})});
    s.set("makola_token",d.accessToken); s.set("makola_refresh",d.refreshToken);
    return d.user;
  },
  async resendOtp(email) { return api("/auth/resend-otp",{method:"POST",body:JSON.stringify({email})}); },
  async forgotPassword(email) { return api("/auth/forgot-password",{method:"POST",body:JSON.stringify({email})}); },
  async resetPassword(token,newPassword) { return api("/auth/reset-password",{method:"POST",body:JSON.stringify({token,newPassword})}); },
  async refreshToken() {
    const r=s.get("makola_refresh"); if(!r) throw new Error("No refresh token");
    const d=await api("/auth/refresh",{method:"POST",body:JSON.stringify({refreshToken:r})});
    s.set("makola_token",d.accessToken); if(d.refreshToken) s.set("makola_refresh",d.refreshToken);
    return d.accessToken;
  },
  async getMe() {
    const t=s.get("makola_token"); if(!t) return null;
    try { const d=await api("/users/me",{headers:{Authorization:`Bearer ${t}`}}); return d.user; }
    catch (err) {
      if (err.status === 401) { s.del("makola_token"); s.del("makola_refresh"); }
      return null;
    }
  },
  async submitKyc(formData) {
    const t=s.get("makola_token");
    const res=await fetch(`${API}/users/kyc`,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:formData});
    const d=await res.json(); if(!res.ok) throw new Error(d.message||"KYC failed");
    return d;
  },
  getToken:()=>s.get("makola_token"),
  isLoggedIn:()=>!!s.get("makola_token"),
};
