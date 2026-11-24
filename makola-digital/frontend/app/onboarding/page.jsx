"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

const AVATARS = ["👨🏿‍💼","👩🏿‍💼","👨🏾‍💼","👩🏾‍💼","🧑🏿‍💻","👨🏿‍🔧","👩🏿‍🔧","🧑🏾‍💼","👨🏽‍💼","👩🏽‍💼","🧑🏽‍💻","👨🏿‍🍳","👩🏿‍🍳","🧑🏿‍🌾","👨🏿‍🎨","👩🏿‍🎨"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=welcome, 2=profile, 3=first-listing, 4=kyc-prompt, 5=done
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("👨🏿‍💼");
  const [city, setCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const searchParams = useSearchParams();
  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    if (!token) { router.replace("/auth/login"); return; }
    // Parse user from token
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
      setDisplayName(payload.displayName || payload.full_name || "");
    } catch {}
    // Allow returning from /sell to jump to step 4
    const stepParam = searchParams.get("step");
    if (stepParam === "4") setStep(4);
  }, []);

  const saveProfile = async () => {
    const token = localStorage.getItem("makola_token");
    if (!displayName.trim()) { setProfileError("Please enter a display name"); return; }
    setSavingProfile(true); setProfileError("");
    try {
      // Save display name
      await fetch(`${API}/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: displayName.trim(), city })
      });
      // Save avatar
      await fetch(`${API}/auth/avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl: avatar })
      });
      setStep(3);
    } catch (e) {
      setProfileError("Failed to save. Please try again.");
    } finally { setSavingProfile(false); }
  };

  const completeOnboarding = () => {
    localStorage.setItem("makola_onboarded", "1");
    router.replace("/dashboard/analytics");
  };

  const s = {
    wrap: { minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" },
    card: { width: "100%", maxWidth: 480, background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: "36px 32px" },
    h1: { fontSize: 22, fontWeight: 900, letterSpacing: "-.03em", color: "#F0EDE8", marginBottom: 8 },
    sub: { fontSize: 13.5, color: "rgba(240,237,232,0.55)", lineHeight: 1.6 },
    btn: { width: "100%", background: "#E8533A", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 24 },
    btnOutline: { width: "100%", background: "transparent", color: "rgba(240,237,232,0.5)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "12px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 10 },
    inp: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "12px 14px", color: "#F0EDE8", fontSize: 13.5, outline: "none", boxSizing: "border-box" },
    lbl: { display: "block", fontSize: 11, fontWeight: 700, color: "rgba(240,237,232,0.5)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6, marginTop: 16 },
    progress: { display: "flex", gap: 6, marginBottom: 28 },
    dot: (active, done) => ({ flex: 1, height: 4, borderRadius: 99, background: done ? "#E8533A" : active ? "rgba(232,83,58,0.5)" : "rgba(255,255,255,0.08)", transition: "background .3s" }),
  };

  const steps = [2, 3, 4]; // profile, listing, kyc
  const Progress = () => (
    <div style={s.progress}>
      {steps.map((n, i) => <div key={i} style={s.dot(step === n, step > n)} />)}
    </div>
  );

  // Step 1 — Welcome
  if (step === 1) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🌍</div>
          <h1 style={s.h1}>Welcome to Makola Digital!</h1>
          <p style={{ ...s.sub, marginTop: 8 }}>Let's get your seller account set up in 3 quick steps — takes less than 2 minutes.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "24px 0" }}>
          {[
            { icon: "👤", title: "Complete your profile", desc: "Set your display name, avatar and city" },
            { icon: "📦", title: "Post your first listing", desc: "List something you want to sell or offer" },
            { icon: "✅", title: "Verify your identity", desc: "Get the KYC badge and build buyer trust" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 24, lineHeight: 1 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#F0EDE8" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button style={s.btn} onClick={() => setStep(2)}>Let's go →</button>
        <button style={s.btnOutline} onClick={completeOnboarding}>Skip for now</button>
      </div>
    </div>
  );

  // Step 2 — Profile
  if (step === 2) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <Progress />
        <h1 style={s.h1}>Set up your profile</h1>
        <p style={s.sub}>Buyers are more likely to contact sellers with a complete profile.</p>

        <label style={s.lbl}>Choose your avatar</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6, marginBottom: 4 }}>
          {AVATARS.map(a => (
            <button key={a} type="button" onClick={() => setAvatar(a)}
              style={{ background: avatar === a ? "rgba(232,83,58,0.15)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${avatar === a ? "#E8533A" : "transparent"}`, borderRadius: 10, padding: "6px 0", fontSize: 22, cursor: "pointer" }}>
              {a}
            </button>
          ))}
        </div>

        <label style={s.lbl}>Display name *</label>
        <input style={s.inp} placeholder="e.g. Kwame Tech Store" value={displayName} onChange={e => setDisplayName(e.target.value)} />

        <label style={s.lbl}>Your city</label>
        <input style={s.inp} placeholder="e.g. Accra, Kumasi, Takoradi" value={city} onChange={e => setCity(e.target.value)} />

        {profileError && <div style={{ color: "#E8533A", fontSize: 12, marginTop: 10 }}>⚠️ {profileError}</div>}

        <button style={s.btn} onClick={saveProfile} disabled={savingProfile}>
          {savingProfile ? "Saving…" : "Save & Continue →"}
        </button>
        <button style={s.btnOutline} onClick={() => setStep(3)}>Skip this step</button>
      </div>
    </div>
  );

  // Step 3 — First Listing
  if (step === 3) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <Progress />
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📦</div>
          <h1 style={s.h1}>Post your first listing</h1>
          <p style={s.sub}>Listings are free. Products, services, jobs and rentals all welcome.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "8px 0 4px" }}>
          {[
            { icon: "🛍️", label: "Product", desc: "Physical item for sale", type: "product" },
            { icon: "🔧", label: "Service", desc: "Skill or service you offer", type: "service" },
            { icon: "💼", label: "Job", desc: "Hiring or freelance gig", type: "job" },
            { icon: "🏠", label: "Rental", desc: "Property or item to rent", type: "rental" },
          ].map(item => (
            <button key={item.type} onClick={() => { router.push(`/sell?type=${item.type}&onboarding=1`); }}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left", transition: "border-color .15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(232,83,58,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F0EDE8" }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>{item.desc}</div>
              </div>
              <span style={{ marginLeft: "auto", color: "rgba(240,237,232,0.3)", fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>

        <button style={s.btnOutline} onClick={() => setStep(4)}>I'll list something later</button>
      </div>
    </div>
  );

  // Step 4 — KYC prompt
  if (step === 4) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <Progress />
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
          <h1 style={s.h1}>Verify your identity</h1>
          <p style={s.sub}>Verified sellers get a KYC badge, appear higher in search, and get more buyer trust.</p>
        </div>

        <div style={{ background: "rgba(45,158,107,0.08)", border: "1px solid rgba(45,158,107,0.2)", borderRadius: 14, padding: "16px 18px", margin: "16px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D9E6B", marginBottom: 8 }}>✅ Benefits of KYC verification</div>
          {["KYC verified badge on all your listings", "Higher ranking in search results", "Access to Starter & Pro plan features", "Builds buyer confidence — more enquiries"].map((b, i) => (
            <div key={i} style={{ fontSize: 12.5, color: "rgba(240,237,232,0.7)", marginBottom: 4 }}>• {b}</div>
          ))}
        </div>

        <button style={s.btn} onClick={() => { localStorage.setItem("makola_onboarded", "1"); router.push("/auth/kyc"); }}>
          Verify now — takes 2 min
        </button>
        <button style={s.btnOutline} onClick={completeOnboarding}>I'll do this later</button>
      </div>
    </div>
  );

  return null;
}
