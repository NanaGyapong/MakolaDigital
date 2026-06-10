"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { icon: "🛍️", label: "Products", count: "0", color: "#E8533A" },
  { icon: "🔧", label: "Services", count: "0", color: "#2D9E6B" },
  { icon: "💼", label: "Jobs", count: "0", color: "#C47F17" },
  { icon: "🏘️", label: "Rentals", count: "0", color: "#3B7DD8" },
  { icon: "🚗", label: "Vehicles & Spare Parts", count: "0", color: "#8B5CF6" },
  { icon: "📱", label: "Electronics", count: "0", color: "#E8533A" },
  { icon: "👗", label: "Fashion & Clothing", count: "0", color: "#DB2777" },
  { icon: "🌾", label: "Agriculture & Farm Produce", count: "0", color: "#2D9E6B" },
  { icon: "💄", label: "Beauty & Health", count: "0", color: "#EC4899" },
  { icon: "🎨", label: "Arts & Crafts", count: "0", color: "#F59E0B" },
];



export default function MakolaDigital() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalListings, setTotalListings] = useState(0);
  const [totalSellers, setTotalSellers] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const stats = [
    { value: totalListings.toString(), label: "Listings" },
    { value: "54", label: "Countries" },
    { value: totalSellers > 0 ? totalSellers.toString() : "...", label: "Sellers" },
    { value: totalMembers > 0 ? totalMembers.toString() : "...", label: "Members" },
  ];
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/listings?limit=6")
      .then(r => r.json())
      .then(data => { if (data.listings) setListings(data.listings); })
      .catch(() => {});
    // Track homepage visit
    const visitorId = localStorage.getItem('visitor_id') || Math.random().toString(36).slice(2);
    localStorage.setItem('visitor_id', visitorId);
    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/track-visit", {
      method: "GET",
      headers: { "x-visitor-id": visitorId }
    }).catch(() => {});
    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/stats").then(r => r.json()).then(d => { setTotalSellers(d.sellers || 0); setTotalMembers(d.users || 0); }).catch(() => {});

    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/categories/counts")
      .then(r => r.json())
      .then(data => {
        if (data.counts) {
          setCategoryCounts(data.typeCounts || {});
          setTotalListings(data.total || 0);
          
        }
      })
      .catch(e => console.error("stats error:", e));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const px = isMobile ? "16px" : "32px";

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0D0D0D", minHeight: "100vh", color: "#F0EDE8" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${px}`, height: 56, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,13,13,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => router.push("/")}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🌍</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>Makola<span style={{ color: "#E8533A" }}>Digital</span></span>
        </div>
        {isMobile ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => router.push("/auth/login")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#F0EDE8", padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Log in</button>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#F0EDE8", fontSize: 22, cursor: "pointer", padding: "4px" }}>☰</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              {["Explore", "Sell", "Jobs", "Blog"].map(nav => (
                <button key={nav} onClick={() => router.push(nav === "Sell" ? "/sell" : nav === "Jobs" ? "/search" : "/")} style={{ background: "none", border: "none", color: "rgba(240,237,232,0.6)", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 6 }}>{nav}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => router.push("/auth/login")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#F0EDE8", padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Log in</button>
              <button onClick={() => router.push("/auth/register")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>List for free</button>
            </div>
          </>
        )}
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && isMobile && (
        <div style={{ background: "#111", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {["Explore", "Sell", "Jobs", "Blog"].map(nav => (
            <button key={nav} onClick={() => { router.push(nav === "Sell" ? "/sell" : nav === "Jobs" ? "/search" : "/"); setMenuOpen(false); }} style={{ background: "none", border: "none", color: "#F0EDE8", fontSize: 15, cursor: "pointer", padding: "10px 0", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{nav}</button>
          ))}
          <button onClick={() => router.push("/auth/register")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>List for free →</button>
        </div>
      )}

      {/* HERO */}
      <div style={{ padding: isMobile ? "48px 16px 40px" : "72px 32px 56px", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,83,58,0.18) 0%, transparent 70%)", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(232,83,58,0.12)", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#E8533A", marginBottom: 16, fontWeight: 500 }}>
          🌍 Africa's Marketplace — Products · Services · Jobs · Rentals
        </div>
        <h1 style={{ fontSize: isMobile ? "32px" : "clamp(36px, 5vw, 62px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 14px" }}>
          Buy, Sell & Connect<br />
          <span style={{ background: "linear-gradient(90deg, #E8533A, #C47F17)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Across Africa & Beyond</span>
        </h1>
        <p style={{ fontSize: isMobile ? 15 : 17, color: "rgba(240,237,232,0.6)", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.6 }}>
          The trusted marketplace connecting African businesses with buyers locally, continentally, and in the diaspora.
        </p>
        <div style={{ display: "flex", maxWidth: 560, margin: "0 auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, overflow: "hidden", padding: 6, gap: 6 }}>
          <span style={{ padding: "0 10px", display: "flex", alignItems: "center", fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && router.push(`/search?q=${search}`)} placeholder="Search products, services, jobs..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#F0EDE8", fontSize: 14, minWidth: 0 }} />
          <button onClick={() => router.push(`/search?q=${search}`)} style={{ background: "#E8533A", border: "none", borderRadius: 10, color: "#fff", padding: isMobile ? "10px 14px" : "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Search</button>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["iPhone", "Accra Apartments", "Remote Jobs", "Web Design", "Toyota"].map(tag => (
            <button key={tag} onClick={() => router.push(`/search?q=${tag}`)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "rgba(240,237,232,0.6)", cursor: "pointer" }}>{tag}</button>
          ))}
        </div>
        <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/auth/register")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Start selling free →</button>
          <button onClick={() => router.push("/search")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#F0EDE8", padding: "14px 28px", borderRadius: 12, fontSize: 15, cursor: "pointer" }}>Browse listings</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        {[{v:totalListings.toString(),l:"Listings"},{v:"54",l:"Countries"},{v:totalSellers.toString(),l:"Sellers"},{v:totalMembers.toString(),l:"Members"}].map((s, i) => (
          <div key={i} style={{ padding: isMobile ? "16px 8px" : "20px 40px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#E8533A" }}>{s.v}</div>
            <div style={{ fontSize: isMobile ? 10 : 12, color: "rgba(240,237,232,0.5)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: isMobile ? "28px 16px 20px" : "40px 32px 24px" }}>
        <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>Browse by category</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(auto-fit, minmax(130px, 1fr))", gap: isMobile ? 8 : 10 }}>
          {categories.map(cat => (
            <button key={cat.label} onClick={() => router.push(cat.label === 'Products' ? '/search?type=product' : cat.label === 'Services' ? '/search?type=service' : cat.label === 'Jobs' ? '/search?type=job' : cat.label === 'Rentals' ? '/search?type=rental' : cat.label === 'Vehicles' ? '/search?type=product&category=Vehicles' : cat.label === 'Electronics' ? '/search?type=product&category=Electronics' : cat.label === 'Fashion' ? '/search?type=product&category=Fashion' : '/search?type=product&category=' + cat.label)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: isMobile ? 10 : 12, padding: isMobile ? "12px 6px" : "16px 12px", cursor: "pointer", textAlign: "center", color: "#F0EDE8" }}>
              <div style={{ fontSize: isMobile ? 22 : 26, marginBottom: 4 }}>{cat.icon}</div>
              <div style={{ fontSize: isMobile ? 10 : 13, fontWeight: 600 }}>{cat.label}</div>
              <div style={{ fontSize: 10, color: cat.color, marginTop: 2 }}>{cat.label === "Products" ? (categoryCounts["product"] || 0) : cat.label === "Services" ? (categoryCounts["service"] || 0) : cat.label === "Jobs" ? (categoryCounts["job"] || 0) : cat.label === "Rentals" ? (categoryCounts["rental"] || 0) : ""}</div>
            </button>
          ))}
        </div>
      </div>

      {/* REAL LISTINGS */}
      {listings.length > 0 && (
        <div style={{ padding: isMobile ? "8px 16px 32px" : "8px 32px 40px" }}>
          <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>Latest listings</h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {listings.map(l => (
              <div key={l.id} onClick={() => router.push(`/listing/${l.id}`)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
                {l.primary_image
                  ? <img src={l.primary_image} alt={l.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                  : <div style={{ height: 140, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                      {l.type === "product" ? "🛍️" : l.type === "service" ? "🔧" : l.type === "job" ? "💼" : "🏠"}
                    </div>
                }
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", marginBottom: 4, textTransform: "uppercase" }}>{l.type}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{l.title}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#E8533A", marginBottom: 6 }}>
                    {l.type === "job" && (!l.price || Number(l.price) === 0) ? "Competitive" : l.price_currency + " " + Number(l.price).toLocaleString() + (l.is_negotiable ? " · Negotiable" : "")}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.5)" }}>📍 {l.location_text || l.city || l.country} · by {l.type === "job" && l.title.includes(" — ") ? l.title.split(" — ").pop() : l.seller_name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA BANNER */}
      <div style={{ margin: isMobile ? "0 16px 40px" : "0 32px 48px", background: "linear-gradient(135deg, rgba(232,83,58,0.15), rgba(196,127,23,0.15))", border: "1px solid rgba(232,83,58,0.2)", borderRadius: 20, padding: isMobile ? "28px 20px" : "40px 48px", textAlign: isMobile ? "center" : "left" }}>
        <h3 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Are you a business owner?</h3>
        <p style={{ fontSize: 14, color: "rgba(240,237,232,0.6)", margin: "0 0 20px", lineHeight: 1.6 }}>List your products, services, or jobs — reach millions across Africa & the diaspora.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: isMobile ? "center" : "flex-start", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/pricing")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#F0EDE8", padding: "12px 24px", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>Learn more</button>
          <button onClick={() => router.push("/auth/register")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Start selling free →</button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: isMobile ? "20px 16px" : "24px 32px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: 12, color: "rgba(240,237,232,0.35)", fontSize: 12, textAlign: isMobile ? "center" : "left" }}>
        <div>🌍 MakolaDigital — Africa's Marketplace © 2025</div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Help", "Contact"].map(f => (
            <span key={f} style={{ cursor: "pointer" }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
