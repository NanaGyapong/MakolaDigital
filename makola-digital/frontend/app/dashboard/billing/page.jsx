"use client";
import { Suspense } from "react";
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:4000/api/v1" });
export default function BillingPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [sub, setSub] = useState(null);
  const [plan, setPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/subscriptions/current"),
      api.get("/subscriptions/invoices"),
    ]).then(([subRes, invRes]) => {
      setSub(subRes.data.subscription);
      setPlan(subRes.data.plan);
      setUsage(subRes.data.usage);
      setInvoices(invRes.data.invoices);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!confirm("Cancel subscription? You'll keep access until the end of your billing period.")) return;
    await api.post("/subscriptions/cancel");
    setSub(s => ({ ...s, cancel_at_period_end: true }));
  };

  const planColor = { free:"#8B5CF6", starter:"#E8533A", pro:"#E8533A", enterprise:"#8B5CF6" };

  if (loading) return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"rgba(240,237,232,0.4)" }}>
      Loading billing...
    </div>
  );

  const s = {
    page: { background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"28px 24px", maxWidth:900, margin:"0 auto" },
    card: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:20, marginBottom:16 },
    title: { fontSize:14, fontWeight:800, color:"#F0EDE8", marginBottom:14, letterSpacing:"-.01em" },
    lbl: { fontSize:10, fontWeight:700, color:"rgba(240,237,232,0.35)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:4 },
    val: { fontSize:18, fontWeight:900, letterSpacing:"-.02em" },
    btnRed: { background:"#E8533A", border:"none", color:"#fff", padding:"9px 18px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
    btnGhost: { background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(240,237,232,0.55)", padding:"8px 16px", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  };

  return (
    <div style={s.page}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em" }}>Billing & Subscription</div>
        <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginTop:4 }}>Manage your Makola Digital plan and invoices</div>
      </div>

      {sp.get("trial") === "started" && (
        <div style={{ background:"rgba(45,158,107,0.08)", border:"1px solid rgba(45,158,107,0.25)", borderRadius:12, padding:"14px 18px", marginBottom:18, fontSize:13.5, color:"#2D9E6B", fontWeight:700 }}>
          🎉 14-day free trial started! Explore all Pro features.
        </div>
      )}

      {/* Current plan */}
      <div style={{ ...s.card, background:"linear-gradient(135deg,rgba(232,83,58,.08),rgba(196,127,23,.06))", border:"1px solid rgba(232,83,58,.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#E8533A,#C47F17)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
            {plan?.id === "pro" ? "🚀" : plan?.id === "starter" ? "⚡" : plan?.id === "enterprise" ? "🏢" : "🆓"}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.4)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:3 }}>Current plan</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.02em", marginBottom:3 }}>
              {plan?.name || "Free"}
              {sub?.is_trial && <span style={{ marginLeft:10, background:"rgba(196,127,23,.15)", color:"#C47F17", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:6 }}>Trial</span>}
              {sub?.cancel_at_period_end && <span style={{ marginLeft:10, background:"rgba(232,83,58,.15)", color:"#E8533A", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:6 }}>Cancelling</span>}
            </div>
            <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)" }}>
              {sub?.is_trial
                ? `Free trial — ends ${new Date(sub.trial_ends_at).toLocaleDateString()}`
                : sub?.current_period_end
                ? `Renews ${new Date(sub.current_period_end).toLocaleDateString()} · Auto-renew on`
                : "No active subscription"}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {plan?.id !== "enterprise" && (
              <button style={s.btnRed} onClick={() => router.push("/pricing")}>
                Upgrade plan
              </button>
            )}
            {sub && plan?.id !== "free" && !sub.cancel_at_period_end && (
              <button style={s.btnGhost} onClick={handleCancel}>Cancel</button>
            )}
          </div>
        </div>
      </div>

      {/* Usage meters */}
      {usage && plan && (
        <div style={s.card}>
          <div style={s.title}>Usage this period</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { label:"Active listings", used:usage.listings, max:plan.limits?.listings },
              { label:"Boosts active",   used:usage.boosts,   max:plan.limits?.boosts },
              { label:"API calls (mo)",  used:usage.apiCalls, max:plan.limits?.apiCalls },
            ].map(u => {
              const unlimited = u.max === -1;
              const pct = unlimited ? 0 : u.max === 0 ? 100 : Math.min(100, Math.round(u.used/u.max*100));
              const color = pct > 85 ? "#E8533A" : pct > 60 ? "#C47F17" : "#2D9E6B";
              return (
                <div key={u.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:11, padding:14 }}>
                  <div style={s.lbl}>{u.label}</div>
                  <div style={{ ...s.val, color, fontSize:20 }}>{u.used.toLocaleString()}</div>
                  <div style={{ fontSize:12, color:"rgba(240,237,232,0.4)", margin:"3px 0 8px" }}>
                    of {unlimited ? "Unlimited" : u.max === 0 ? "0 (upgrade)" : u.max.toLocaleString()}
                  </div>
                  {!unlimited && u.max > 0 && (
                    <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:color, borderRadius:3, width:`${pct}%`, transition:"width .6s" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice history */}
      <div style={{ ...s.card, padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={s.title}>Invoice history</div>
          <button style={s.btnGhost}>Export all</button>
        </div>
        {invoices.length === 0 ? (
          <div style={{ padding:32, textAlign:"center", color:"rgba(240,237,232,0.35)", fontSize:13 }}>No invoices yet</div>
        ) : invoices.map((inv, i) => (
          <div key={inv.id} style={{ display:"flex", alignItems:"center", padding:"13px 18px", borderBottom:i<invoices.length-1?"1px solid rgba(255,255,255,0.04)":"none", fontSize:13 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700 }}>{inv.plan_id.charAt(0).toUpperCase()+inv.plan_id.slice(1)} Plan</div>
              <div style={{ fontSize:11.5, color:"rgba(240,237,232,0.4)", marginTop:2 }}>{new Date(inv.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ fontWeight:800, color:"#E8533A", marginRight:16 }}>{inv.currency} {parseFloat(inv.amount).toLocaleString()}</div>
            <span style={{ background:"rgba(45,158,107,.12)", color:"#2D9E6B", fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:5, marginRight:12 }}>{inv.status}</span>
            <button style={{ ...s.btnGhost, padding:"4px 10px", fontSize:11 }}>PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}
