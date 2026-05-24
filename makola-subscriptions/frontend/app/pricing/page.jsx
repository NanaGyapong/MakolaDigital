// app/pricing/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/auth.service";

const PLANS = [
  {
    id:"free", name:"Free", icon:"🆓", tagline:"Get started at no cost.",
    monthly:0, annual:0,
    commission:"5%", color:"#8B5CF6",
    cta:"Start free", ctaVariant:"outline",
    features:["10 active listings","5% commission","MoMo & card payments","Basic analytics","1 photo per listing"],
    missing:["Boosted listings","Verified badge","Priority support","Advanced analytics"],
  },
  {
    id:"starter", name:"Starter", icon:"⚡", tagline:"For growing sellers ready to scale.",
    monthly:150, annual:1440,
    commission:"4%", color:"#E8533A",
    cta:"Start 14-day trial", ctaVariant:"outline-red",
    features:["30 active listings","4% commission (save 1%)","All payment methods","Standard analytics","8 photos per listing","2 boosted listings/month","KYC verified badge"],
    missing:["Priority support","Advanced analytics + export","Pro badge","API access"],
  },
  {
    id:"pro", name:"Pro", icon:"🚀", tagline:"Maximum visibility across Africa.",
    monthly:300, annual:2880,
    commission:"3%", color:"#E8533A",
    popular:true,
    cta:"Start 14-day trial", ctaVariant:"red",
    features:["Unlimited active listings","3% commission (save 2%)","All payments + escrow","Advanced analytics + export","8 photos per listing","5 boosted listings/month","Pro + KYC badge","Priority support (24h SLA)","API access (10k/month)","3 team members"],
  },
  {
    id:"enterprise", name:"Enterprise", icon:"🏢", tagline:"Custom solution for large sellers.",
    monthly:null, annual:null,
    commission:"2%", color:"#8B5CF6",
    cta:"Contact sales", ctaVariant:"purple",
    features:["Unlimited everything","2% commission (save 3%)","Custom payment integration","Custom analytics + data API","Unlimited photos + video","Unlimited boosts","Dedicated account manager","24/7 priority support","Full API + webhooks","Unlimited team members"],
  },
];

function PlanCard({ plan, annual, currentPlan, onSelect }) {
  const price = annual
    ? (plan.monthly ? Math.round(plan.annual / 12) : null)
    : plan.monthly;

  const annualSaving = plan.monthly && plan.annual
    ? (plan.monthly * 12) - plan.annual
    : 0;

  const isCurrent = currentPlan === plan.id;

  const s = {
    card: {
      background: plan.popular ? "rgba(232,83,58,0.04)" : "rgba(255,255,255,0.04)",
      border: `1.5px solid ${plan.popular ? "#E8533A" : plan.id === "enterprise" ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 18, padding: 24, position: "relative", cursor: "pointer",
      transition: "all .2s", fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    cta: {
      width: "100%", padding: "12px", borderRadius: 11, fontSize: 14, fontWeight: 800,
      cursor: "pointer", fontFamily: "inherit", transition: "opacity .15s",
      ...(plan.ctaVariant === "red" ? { background:"#E8533A", border:"none", color:"#fff", boxShadow:"0 3px 16px rgba(232,83,58,.35)" } :
          plan.ctaVariant === "purple" ? { background:"rgba(139,92,246,.15)", border:"1px solid rgba(139,92,246,.4)", color:"#8B5CF6" } :
          plan.ctaVariant === "outline-red" ? { background:"rgba(232,83,58,.1)", border:"1px solid rgba(232,83,58,.3)", color:"#E8533A" } :
          { background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.14)", color:"#F0EDE8" }),
    },
  };

  return (
    <div style={s.card}>
      {plan.popular && (
        <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:"#E8533A", color:"#fff", fontSize:10, fontWeight:800, padding:"4px 14px", borderRadius:"0 0 10px 10px", whiteSpace:"nowrap", letterSpacing:".06em" }}>
          ⭐ MOST POPULAR
        </div>
      )}

      <div style={{ fontSize:32, marginBottom:12 }}>{plan.icon}</div>
      <div style={{ fontSize:17, fontWeight:900, color:plan.color, marginBottom:4 }}>{plan.name}</div>
      <div style={{ fontSize:12, color:"rgba(240,237,232,0.55)", marginBottom:18, lineHeight:1.5 }}>{plan.tagline}</div>

      <div style={{ marginBottom:20 }}>
        {price === null ? (
          <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-.03em" }}>Custom</div>
        ) : price === 0 ? (
          <div style={{ fontSize:36, fontWeight:900, letterSpacing:"-.04em", color:"#F0EDE8" }}>Free</div>
        ) : (
          <>
            <div>
              <span style={{ fontSize:14, color:"rgba(240,237,232,0.5)", verticalAlign:"super" }}>GH₵ </span>
              <span style={{ fontSize:36, fontWeight:900, letterSpacing:"-.04em", color:plan.color }}>{price.toLocaleString()}</span>
            </div>
            <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginTop:3 }}>per month{annual ? " (billed annually)" : ""}</div>
            {annual && annualSaving > 0 && (
              <div style={{ fontSize:12, color:"#2D9E6B", marginTop:3, fontWeight:600 }}>Save GH₵ {annualSaving.toLocaleString()}/year</div>
            )}
          </>
        )}
      </div>

      <button style={{ ...s.cta, marginBottom:20, opacity: isCurrent ? 0.5 : 1 }}
        disabled={isCurrent} onClick={() => onSelect(plan)}>
        {isCurrent ? "Current plan" : plan.cta}
      </button>

      <div style={{ height:1, background:"rgba(255,255,255,0.07)", margin:"0 0 16px" }} />

      {plan.features?.map(f => (
        <div key={f} style={{ display:"flex", gap:9, marginBottom:9, fontSize:13 }}>
          <span style={{ color:"#2D9E6B", flexShrink:0 }}>✓</span>
          <span style={{ color:"rgba(240,237,232,0.6)", dangerouslySetInnerHTML:undefined }}>{f}</span>
        </div>
      ))}
      {plan.missing?.map(f => (
        <div key={f} style={{ display:"flex", gap:9, marginBottom:9, fontSize:13 }}>
          <span style={{ color:"rgba(255,255,255,0.15)", flexShrink:0 }}>✗</span>
          <span style={{ color:"rgba(240,237,232,0.25)" }}>{f}</span>
        </div>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/subscriptions/current")
      .then(r => setCurrentPlan(r.data.subscription?.plan_id || "free"))
      .catch(() => {});
  }, []);

  const handleSelect = async (plan) => {
    if (plan.id === "enterprise") {
      alert("Enterprise sales will contact you within 24 hours.");
      return;
    }
    if (plan.id === "free" || plan.id === currentPlan) return;

    setLoading(true);
    try {
      const { data } = await api.post("/subscriptions/subscribe", {
        planId: plan.id,
        billing: annual ? "annual" : "monthly",
        startTrial: true,
      });

      if (data.requiresPayment && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        // Trial started
        router.push("/dashboard/billing?trial=started");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif" },
    hero: { textAlign:"center", padding:"52px 28px 44px", background:"radial-gradient(ellipse 70% 50% at 50% -5%,rgba(232,83,58,.14) 0%,transparent 68%)" },
    toggle: { display:"flex", alignItems:"center", gap:12, justifyContent:"center", marginBottom:36 },
    grid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, maxWidth:1100, margin:"0 auto", padding:"0 28px 48px" },
    switchWrap: { width:52, height:28, borderRadius:14, background:"#E8533A", position:"relative", cursor:"pointer" },
    dot: (on) => ({ position:"absolute", top:4, left:on?28:4, width:20, height:20, borderRadius:10, background:"#fff", transition:"left .2s" }),
  };

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(232,83,58,.1)", border:"1px solid rgba(232,83,58,.25)", borderRadius:20, padding:"5px 13px", fontSize:12, color:"#E8533A", fontWeight:700, marginBottom:18 }}>
          💰 Simple, transparent pricing
        </div>
        <h1 style={{ fontSize:48, fontWeight:900, letterSpacing:"-.035em", lineHeight:1.1, marginBottom:14 }}>
          Grow your business<br />
          <span style={{ background:"linear-gradient(90deg,#E8533A,#C47F17)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>across all of Africa</span>
        </h1>
        <p style={{ fontSize:15, color:"rgba(240,237,232,0.55)", marginBottom:32, maxWidth:480, margin:"0 auto 32px", lineHeight:1.65 }}>
          Start free. Upgrade when ready. No contracts, cancel anytime.
        </p>

        <div style={s.toggle}>
          <span style={{ fontSize:14, fontWeight:600, color:annual?"rgba(240,237,232,0.5)":"#F0EDE8" }}>Monthly</span>
          <div style={s.switchWrap} onClick={() => setAnnual(a => !a)}>
            <div style={s.dot(annual)} />
          </div>
          <span style={{ fontSize:14, fontWeight:600, color:annual?"#F0EDE8":"rgba(240,237,232,0.5)" }}>Annual</span>
          <span style={{ background:"rgba(45,158,107,.15)", border:"1px solid rgba(45,158,107,.3)", color:"#2D9E6B", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>Save 20%</span>
        </div>
      </div>

      <div style={s.grid}>
        {PLANS.map(plan => (
          <PlanCard key={plan.id} plan={plan} annual={annual} currentPlan={currentPlan} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
