"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

export default function SellerDashboard() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveAvatar = async (url) => {
    const token = localStorage.getItem("makola_token");
    setSavingAvatar(true);
    await fetch(`${API}/auth/avatar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ avatarUrl: url })
    });
    setAvatar(url);
    setShowAvatarPicker(false);
    setSavingAvatar(false);
  };
  const toggleSoldOut = async (id, currentState) => {
    const token = localStorage.getItem('makola_token');
    const newState = !currentState;
    await fetch('https://sparkling-charm-production-cb2c.up.railway.app/api/v1/listings/' + id + '/sold-out', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ isSoldOut: newState })
    });
    setListings(prev => prev.map(l => l.id === id ? { ...l, is_sold_out: newState } : l));
  };

  const deleteListing = async (id, title) => {
    const token = localStorage.getItem('makola_token');
    try {
      await fetch('https://sparkling-charm-production-cb2c.up.railway.app/api/v1/listings/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (e) { alert('Failed to delete listing'); }
  };
  const [justListed, setJustListed] = useState(false);
  useEffect(() => { if (window.location.search.includes("listed=true")) setJustListed(true); }, []);
  const [activeTab, setActiveTab] = useState("listings");
  const [avatar, setAvatar] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, views: 0 });

  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }

    // Fetch seller's listings
    fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.user?.avatar_url) setAvatar(data.user.avatar_url); })
      .catch(() => {});
    fetch(`${API}/listings/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const all = data.listings || [];
        setListings(all);
        setStats({
          total: all.length,
          active: all.filter(l => l.status === "active").length,
          pending: all.filter(l => l.status === "pending").length,
          views: all.reduce((sum, l) => sum + (l.views_count || 0), 0),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    if (status === "active") return "#2D9E6B";
    if (status === "pending") return "#C47F17";
    if (status === "rejected") return "#E8533A";
    if (status === "flagged") return "#8B5CF6";
    return "rgba(240,237,232,0.4)";
  };

  const getStatusIcon = (status) => {
    if (status === "active") return "✅";
    if (status === "pending") return "⏳";
    if (status === "rejected") return "❌";
    if (status === "flagged") return "🚩";
    return "•";
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 56, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,13,13,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => router.push("/")}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌍</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Makola<span style={{ color: "#E8533A" }}>Digital</span></span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push("/dashboard/inbox")} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💬 Inbox</button>
          <button onClick={() => router.push("/catalogue")} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>📋 Catalogue</button>
          <button onClick={() => router.push("/sell")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ New Listing</button>
          <button onClick={() => { localStorage.removeItem("makola_token"); localStorage.removeItem("makola_refresh"); router.push("/"); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Log out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>Seller Dashboard</h1>
          <p style={{ fontSize: 14, color: "rgba(240,237,232,0.5)", margin: 0 }}>Manage your listings and track performance</p>
        </div>

        {/* Profile Picture */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ position:"relative", cursor:"pointer" }} onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
            {avatar
              ? <img src={avatar} alt="Profile" style={{ width:56, height:56, borderRadius:"50%", objectFit:"cover", border:"2px solid #E8533A" }} />
              : <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#E8533A,#C47F17)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:900 }}>👤</div>
            }
            <div style={{ position:"absolute", bottom:0, right:0, background:"#E8533A", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✏️</div>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>Your Profile Picture</div>
            <div style={{ fontSize:12, color:"rgba(240,237,232,0.5)", marginTop:2 }}>Click to choose from your listing photos</div>
          </div>
        </div>
        {showAvatarPicker && (
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:16, marginBottom:20 }}>
            <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Choose a photo as your profile picture:</div>
            {listings.filter(l => l.primary_image).length === 0
              ? <div style={{ color:"rgba(240,237,232,0.4)", fontSize:13 }}>No listing photos available. Add photos to your listings first.</div>
              : <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                  {listings.filter(l => l.primary_image).map(l => (
                    <div key={l.id} onClick={() => saveAvatar(l.primary_image)} style={{ position:"relative", aspectRatio:"1", borderRadius:10, overflow:"hidden", cursor:"pointer", border: avatar === l.primary_image ? "2px solid #E8533A" : "1px solid rgba(255,255,255,0.1)" }}>
                      <img src={l.primary_image} alt={l.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      {avatar === l.primary_image && <div style={{ position:"absolute", inset:0, background:"rgba(232,83,58,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>✅</div>}
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Listings", value: stats.total, icon: "📦", color: "#3B7DD8" },
            { label: "Active", value: stats.active, icon: "✅", color: "#2D9E6B" },
            { label: "Pending Review", value: stats.pending, icon: "⏳", color: "#C47F17" },
            { label: "Total Views", value: stats.views, icon: "👁️", color: "#8B5CF6" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(240,237,232,0.5)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 0 }}>
          {["listings", "kyc", "billing"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ background: "none", border: "none", color: activeTab === t ? "#E8533A" : "rgba(240,237,232,0.5)", padding: "10px 16px", fontSize: 14, fontWeight: activeTab === t ? 700 : 400, cursor: "pointer", borderBottom: activeTab === t ? "2px solid #E8533A" : "2px solid transparent", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 48, color: "rgba(240,237,232,0.4)" }}>Loading your listings...</div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No listings yet</div>
                <div style={{ fontSize: 14, color: "rgba(240,237,232,0.5)", marginBottom: 20 }}>Start selling by creating your first listing</div>
                <button onClick={() => router.push("/sell")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Create First Listing →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {listings.map(l => (
                  <div key={l.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    {l.primary_image
                      ? <img src={l.primary_image} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 64, height: 64, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{l.type === "product" ? "🛍️" : l.type === "service" ? "🔧" : l.type === "job" ? "💼" : "🏠"}</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>{l.title}</div>
                      <div style={{ fontSize: 13, color: "#E8533A", fontWeight: 700, marginBottom: 4 }}>{l.price_currency} {Number(l.price).toLocaleString()}{l.is_negotiable ? " · Negotiable" : ""}</div>
                      <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>📍 {l.location_text || l.city} · 👁️ {l.views_count || 0} views · {new Date(l.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: getStatusColor(l.status), background: getStatusColor(l.status) + "22", padding: "4px 10px", borderRadius: 20 }}>
                        {getStatusIcon(l.status)} {l.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(240,237,232,0.4)', marginRight: 8 }}>👁️ {l.views_count || 0} views</span>
                      <button onClick={() => router.push(`/listing/${l.id}`)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>View →</button>
                      <button onClick={() => router.push(`/dashboard/listings/edit/${l.id}`)} style={{ background: "rgba(232,83,58,0.12)", border: "1px solid rgba(232,83,58,0.3)", color: "#E8533A", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>✏️ Edit</button>
                      <button onClick={() => deleteListing(l.id, l.title)} style={{ background: "rgba(232,83,58,0.08)", border: "1px solid rgba(232,83,58,0.2)", color: "#E8533A", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>🗑️ Delete</button>
                      <button onClick={() => toggleSoldOut(l.id, l.is_sold_out)} style={{ background: l.is_sold_out ? 'rgba(45,158,107,0.12)' : 'rgba(196,127,23,0.12)', border: '1px solid rgba(196,127,23,0.3)', color: l.is_sold_out ? '#2D9E6B' : '#C47F17', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>{l.is_sold_out ? '✅ Mark Available' : '🏷️ Mark Sold Out'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === "kyc" && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🪪</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Identity Verification</h2>
            <p style={{ fontSize: 14, color: "rgba(240,237,232,0.6)", marginBottom: 24, lineHeight: 1.6 }}>Complete KYC verification to get a verified badge on your listings and build trust with buyers.</p>
            <button onClick={() => router.push("/auth/kyc")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Complete Verification →</button>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Subscription Plans</h2>
            <p style={{ fontSize: 14, color: "rgba(240,237,232,0.6)", marginBottom: 24 }}>You are currently on the <strong>Free plan</strong>. Upgrade to list more products and reduce commission.</p>
            <button onClick={() => router.push("/pricing")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>View Plans →</button>
          </div>
        )}
      </div>
    </div>
  );
}
