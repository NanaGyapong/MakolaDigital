"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";




export default function MakolaDigital() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [counts, setCounts] = useState({});
  const [trending, setTrending] = useState([]);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  const categories = useMemo(() => [
    { icon: "🚗", label: "Vehicles", count: (counts["Vehicles & Spare Parts"] || 0).toString(), color: "#E8533A", cat: "Vehicles & Spare Parts" },
    { icon: "🏘️", label: "Property", count: (counts["Property & Land"] || 0).toString(), color: "#3B7DD8", cat: "Property & Land" },
    { icon: "📱", label: "Phones & Tablets", count: (counts["Electronics"] || 0).toString(), color: "#8B5CF6", cat: "Electronics" },
    { icon: "💻", label: "Electronics", count: (counts["Tech & Digital"] || 0).toString(), color: "#2D9E6B", cat: "Tech & Digital" },
    { icon: "🏠", label: "Home & Furniture", count: (counts["Home & Garden"] || 0).toString(), color: "#C47F17", cat: "Home & Garden" },
    { icon: "👗", label: "Fashion", count: (counts["Fashion & Clothing"] || 0).toString(), color: "#DB2777", cat: "Fashion & Clothing" },
    { icon: "💄", label: "Beauty & Care", count: (counts["Beauty & Health"] || 0).toString(), color: "#EC4899", cat: "Beauty & Health" },
    { icon: "🔧", label: "Services", count: (categoryCounts["service"] || 0).toString(), color: "#2D9E6B", type: "service" },
    { icon: "🌾", label: "Food & Agriculture", count: ((counts["Agriculture & Farm Produce"] || 0) + (counts["Food & Beverages"] || 0)).toString(), color: "#16A34A", cat: "Agriculture & Farm Produce" },
    { icon: "🐓", label: "Animals & Pets", count: (counts["Farm Animals & Pets"] || 0).toString(), color: "#F59E0B", cat: "Farm Animals & Pets" },
    { icon: "💼", label: "Jobs", count: (categoryCounts["job"] || 0).toString(), color: "#C47F17", type: "job" },
    { icon: "📚", label: "Education", count: (counts["Education & Training"] || 0).toString(), color: "#6366F1", cat: "Education & Training" },
    { icon: "🎨", label: "Arts & Crafts", count: (counts["Arts & Crafts"] || 0).toString(), color: "#F59E0B", cat: "Arts & Crafts" },
    { icon: "🏢", label: "Business Services", count: (counts["Business Services"] || 0).toString(), color: "#3B7DD8", cat: "Business Services" },
    { icon: "🔨", label: "Home Services", count: (counts["Home Services"] || 0).toString(), color: "#8B5CF6", cat: "Home Services" },
  ], [counts, categoryCounts]);
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
    if (typeof window !== 'undefined' && !localStorage.getItem('makola_newsletter_seen')) {
      const t = setTimeout(() => setShowNewsletter(true), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const closeNewsletter = () => {
    setShowNewsletter(false);
    localStorage.setItem('makola_newsletter_seen', '1');
  };

  const submitNewsletter = async () => {
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    try {
      await fetch('https://sparkling-charm-production-cb2c.up.railway.app/api/v1/listings/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
    } catch (e) {}
    setNewsletterSent(true);
    localStorage.setItem('makola_newsletter_seen', '1');
    setTimeout(() => setShowNewsletter(false), 2000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/listings?limit=12")
      .then(r => r.json())
      .then(data => { if (data.listings) setListings(data.listings); })
      .catch(() => {});
    // Track homepage visit
    const visitorId = localStorage.getItem('visitor_id') || Math.random().toString(36).slice(2);
    localStorage.setItem('visitor_id', visitorId);
    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/track-visit", {
      method: "POST",
      headers: { "x-visitor-id": visitorId }
    }).catch(() => {});
    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/listings/trending")
      .then(r => r.json())
      .then(d => setTrending((d.listings || []).slice(0, 6)))
      .catch(() => {});
    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/stats").then(r => r.json()).then(d => { setTotalSellers(d.sellers || 0); setTotalMembers(d.users || 0); }).catch(() => {});

    fetch("https://sparkling-charm-production-cb2c.up.railway.app/api/v1/categories/counts")
      .then(r => r.json())
      .then(data => {
        if (data.counts) {
          setCategoryCounts(data.typeCounts || {});
          setCounts(data.counts || {});
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
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#E8533A", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src="/icon-192.png" style={{ width: 34, height: 34, objectFit: "cover" }} alt="Makola Digital" />
          </div>
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
                <button key={nav} onClick={() => router.push(nav === "Sell" ? "/sell" : nav === "Jobs" ? "/search?type=job" : nav === "Blog" ? "/blog" : "/")} style={{ background: "none", border: "none", color: "rgba(240,237,232,0.6)", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 6 }}>{nav}</button>
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
            <button key={nav} onClick={() => { router.push(nav === "Sell" ? "/sell" : nav === "Jobs" ? "/search?type=job" : nav === "Blog" ? "/blog" : "/"); setMenuOpen(false); }} style={{ background: "none", border: "none", color: "#F0EDE8", fontSize: 15, cursor: "pointer", padding: "10px 0", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{nav}</button>
          ))}
          <button onClick={() => router.push("/auth/register")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>List for free →</button>
        </div>
      )}

      {/* HERO */}
      {isMobile ? (
        <div style={{ padding: "20px 16px 24px", background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(232,83,58,0.2) 0%, transparent 70%)" }}>
          {/* Mobile search bar */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, overflow: "hidden", padding: "4px 4px 4px 14px", gap: 8, marginBottom: 20 }}>
            <span style={{ display: "flex", alignItems: "center", fontSize: 16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && router.push(`/search?q=${search}`)} placeholder="What are you looking for?" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#F0EDE8", fontSize: 14, minWidth: 0 }} />
            <button onClick={() => router.push(`/search?q=${search}`)} style={{ background: "#E8533A", border: "none", borderRadius: 10, color: "#fff", padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Go</button>
          </div>
          {/* Mobile banner */}
          <div style={{ background: "linear-gradient(135deg, #E8533A, #C47F17)", borderRadius: 18, padding: "24px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden", position: "relative" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>Buy. Sell.<br/>Connect.</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 14, lineHeight: 1.5 }}>All in one place 🌍</div>
              <button onClick={() => router.push("/auth/register")} style={{ background: "#fff", border: "none", color: "#E8533A", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Start free →</button>
            </div>
            <div style={{ fontSize: 72, opacity: 0.5, position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)" }}>🛒</div>
          </div>
          {/* Mobile quick tags */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {["Jerseys", "Wardrobe", "Jeans", "Tide", "Vanish", "Detergent", "Duvet"].map(tag => (
              <button key={tag} onClick={() => router.push(`/search?q=${tag}`)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "5px 14px", fontSize: 11, color: "rgba(240,237,232,0.7)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{tag}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: "72px 32px 56px", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,83,58,0.18) 0%, transparent 70%)", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(232,83,58,0.12)", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#E8533A", marginBottom: 16, fontWeight: 500 }}>
            🌍 Africa's Marketplace — Products · Services · Jobs · Rentals
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 14px" }}>
            Buy, Sell & Connect<br />
            <span style={{ background: "linear-gradient(90deg, #E8533A, #C47F17)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Across Africa & Beyond</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(240,237,232,0.6)", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.6 }}>
            The trusted marketplace connecting African businesses with buyers locally, continentally, and in the diaspora.
          </p>
          <div style={{ display: "flex", maxWidth: 560, margin: "0 auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, overflow: "hidden", padding: 6, gap: 6 }}>
            <span style={{ padding: "0 10px", display: "flex", alignItems: "center", fontSize: 16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && router.push(`/search?q=${search}`)} placeholder="Search products, services, jobs..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#F0EDE8", fontSize: 14, minWidth: 0 }} />
            <button onClick={() => router.push(`/search?q=${search}`)} style={{ background: "#E8533A", border: "none", borderRadius: 10, color: "#fff", padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Search</button>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["Jerseys", "Wardrobe", "Jeans", "Tide", "Vanish", "Detergent", "Duvet"].map(tag => (
              <button key={tag} onClick={() => router.push(`/search?q=${tag}`)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "rgba(240,237,232,0.6)", cursor: "pointer" }}>{tag}</button>
            ))}
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/auth/register")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Start selling free →</button>
            <button onClick={() => router.push("/search")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#F0EDE8", padding: "14px 28px", borderRadius: 12, fontSize: 15, cursor: "pointer" }}>Browse listings</button>
          </div>
        </div>
      )}

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
        {/* Trending Section - Coming Soon */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🔥 Trending Now</h2>
            <button onClick={() => router.push("/search")} style={{ background: "none", border: "none", color: "#E8533A", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>See all →</button>
          </div>
{trending.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {trending.map(l => (
                <div key={l.id} onClick={() => router.push("/listing/" + l.id)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                  {l.primary_image
                    ? <img src={l.primary_image} alt={l.title} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                    : <div style={{ height: 120, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{l.type === "product" ? "🛍️" : l.type === "service" ? "🔧" : l.type === "job" ? "💼" : "🏠"}</div>
                  }
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{l.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#E8533A" }}>{l.price_currency} {Number(l.price).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 14, padding: "24px", textAlign: "center", color: "rgba(240,237,232,0.3)", fontSize: 13 }}>
              Trending listings coming soon
            </div>
          )}
        </div>

        {/* Ad Banner Space */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>📢 Sponsored</span>
              <span style={{ fontSize: 9, color: "rgba(240,237,232,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 6px", letterSpacing: "0.08em" }}>AD</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            {[
              { id: "ad1", title: "Gain Flings Laundry Detergent with Oxi Boost - 3 in 1, Original Scent (81 Pacs)", price: "GHS 600", location: "East Legon, Accra", seller: "Dets on Dirt", img: "https://res.cloudinary.com/dnee8imbi/image/upload/v1782491060/makola-digital/e5dbf0apwoposjwfwafn.jpg", link: "/listing/73717fa2-6acd-40b5-9da9-b5fda7bd3281" },
              { id: "ad2", title: "Tide Ultra Concentrated Liquid Laundry Detergent, Original Scent (146 Loads)", price: "GHS 800", location: "East Legon, Accra", seller: "Dets on Dirt", img: "https://res.cloudinary.com/dnee8imbi/image/upload/v1782487240/makola-digital/btlsg8mdz9lefsj0cp01.jpg", link: "/listing/07ea6d6c-b594-4499-a9f1-0800ce7659d6" }
            ].map(ad => (
              <div key={ad.id} onClick={() => router.push(ad.link)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(196,127,23,0.3)", borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative" }}>
                <div style={{ position: "absolute", top: 8, right: 8, background: "#C47F17", borderRadius: 4, fontSize: 9, fontWeight: 700, color: "#0A0A0A", padding: "2px 6px", letterSpacing: "0.06em", zIndex: 1 }}>SPONSORED</div>
                {ad.img ? <img src={ad.img} alt={ad.title} style={{ width: "100%", height: 120, objectFit: "cover" }} /> : <div style={{ height: 120, background: "rgba(196,127,23,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🧺</div>}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{ad.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#C47F17" }}>{ad.price}</div>
                  <div style={{ fontSize: 10, color: "rgba(240,237,232,0.4)", marginTop: 2 }}>📍 {ad.location} · by {ad.seller}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <h2 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>Browse by category</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(auto-fit, minmax(130px, 1fr))", gap: isMobile ? 8 : 10 }}>
          {categories.map(cat => (
            <button key={cat.label} onClick={() => router.push(cat.type ? '/search?type=' + cat.type : cat.cat ? '/search?category=' + encodeURIComponent(cat.cat) : '/search')} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: isMobile ? 10 : 12, padding: isMobile ? "12px 6px" : "16px 12px", cursor: "pointer", textAlign: "center", color: "#F0EDE8" }}>
              <div style={{ fontSize: isMobile ? 22 : 26, marginBottom: 4 }}>{cat.icon}</div>
              <div style={{ fontSize: isMobile ? 10 : 13, fontWeight: 600 }}>{cat.label}</div>
              <div style={{ fontSize: 10, color: cat.color, marginTop: 2 }}>{cat.count && cat.count !== "0" ? cat.count : ""}</div>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {l.location_text || l.city || l.country} · by {l.type === "job" && l.title.includes(" — ") ? l.title.split(" — ").pop() : l.seller_name}</div>
                  {new Date() - new Date(l.created_at) < 7 * 24 * 60 * 60 * 1000 && <span style={{ background: "#E8533A", color: "#fff", fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 10, flexShrink: 0 }}>NEW</span>}
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", padding: "0 16px 32px" }}><button onClick={() => router.push("/search")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#F0EDE8", padding: "12px 32px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>See all listings →</button></div>
      {/* HOW IT WORKS */}
      <div style={{ padding: isMobile ? "32px 16px" : "48px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-block", background: "rgba(232,83,58,0.12)", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#E8533A", marginBottom: 12, fontWeight: 500 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, margin: "0 0 8px" }}>Buy & Sell in 3 Simple Steps</h2>
          <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 14, margin: 0 }}>Join thousands of Ghanaians already buying and selling on Makola Digital</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24, marginBottom: 40 }}>
          
          {/* FOR SELLERS */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E8533A", marginBottom: 20, letterSpacing: "0.05em" }}>🏪 FOR SELLERS</div>
            {[
              { n: "1", title: "Create a free account", body: "Sign up in 30 seconds with your email or phone number. No credit card needed." },
              { n: "2", title: "List your product or service", body: "Upload photos, set your price and publish. Your listing goes live instantly after review." },
              { n: "3", title: "Get messages from buyers", body: "Buyers contact you directly on WhatsApp or via the platform. Close the deal!" },
            ].map(step => (
              <div key={step.n} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E8533A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0, color: "#fff" }}>{step.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)", lineHeight: 1.5 }}>{step.body}</div>
                </div>
              </div>
            ))}
            <button onClick={() => router.push("/auth/register")} style={{ width: "100%", background: "#E8533A", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Start selling free →</button>
          </div>

          {/* FOR BUYERS */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2D9E6B", marginBottom: 20, letterSpacing: "0.05em" }}>🛍️ FOR BUYERS</div>
            {[
              { n: "1", title: "Search for what you need", body: "Browse by category or search for specific products, services, jobs or rentals." },
              { n: "2", title: "Find the perfect listing", body: "View photos, read descriptions, check prices and compare sellers across Ghana & Africa." },
              { n: "3", title: "Contact the seller directly", body: "Message sellers on WhatsApp or through our platform. No middleman, no hidden fees." },
            ].map(step => (
              <div key={step.n} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2D9E6B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0, color: "#fff" }}>{step.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)", lineHeight: 1.5 }}>{step.body}</div>
                </div>
              </div>
            ))}
            <button onClick={() => router.push("/search")} style={{ width: "100%", background: "#2D9E6B", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Browse listings →</button>
          </div>

        </div>
      </div>

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
        <div>© 2026 Makola Digital Technologies Ltd
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
            <a href="https://www.instagram.com/makoladigital" target="_blank" rel="noopener noreferrer" style={{ color: "#E8533A", fontSize: 13, textDecoration: "none" }}>📸 Instagram</a>
            <a href="https://x.com/makoladigitalon" target="_blank" rel="noopener noreferrer" style={{ color: "#F0EDE8", fontSize: 13, textDecoration: "none" }}>🐦 X (Twitter)</a>
            <a href="https://www.facebook.com/MakolaDigital" target="_blank" rel="noopener noreferrer" style={{ color: "#3B7DD8", fontSize: 13, textDecoration: "none" }}>👍 Facebook</a>
            <a href="https://www.linkedin.com/company/makoladigital" target="_blank" rel="noopener noreferrer" style={{ color: "#2D9E6B", fontSize: 13, textDecoration: "none" }}>💼 LinkedIn</a>
          </div></div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <span onClick={() => router.push("/privacy")} style={{ cursor: "pointer", color: "rgba(240,237,232,0.5)", fontSize: 13 }}>Privacy</span>
          <span onClick={() => router.push("/terms")} style={{ cursor: "pointer", color: "rgba(240,237,232,0.5)", fontSize: 13 }}>Terms</span>
          <span onClick={() => router.push("/delete-account")} style={{ cursor: "pointer", color: "rgba(240,237,232,0.5)", fontSize: 13 }}>Delete Account</span>
          <span onClick={() => router.push("/contact")} style={{ color: "rgba(240,237,232,0.5)", fontSize: 13, cursor: "pointer" }}>Contact</span>
        </div>
      </div>
      {showNewsletter && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={closeNewsletter}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0D0D0D", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 20, padding: isMobile ? "28px 22px" : "36px 40px", maxWidth: 420, width: "100%", textAlign: "center", position: "relative" }}>
            <button onClick={closeNewsletter} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "rgba(240,237,232,0.4)", fontSize: 20, cursor: "pointer" }}>×</button>
            {!newsletterSent ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🌍🔥</div>
                <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 8, lineHeight: 1.3 }}>Don't miss the best deals in Ghana!</div>
                <div style={{ fontSize: 14, color: "rgba(240,237,232,0.6)", marginBottom: 20, lineHeight: 1.5 }}>Get fresh listings, hot deals & seller tips straight to your inbox — every week, for free.</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input type="email" placeholder="your@email.com" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 14px", color: "#F0EDE8", fontSize: 14, outline: "none" }} />
                </div>
                <button onClick={submitNewsletter} style={{ width: "100%", background: "#E8533A", border: "none", color: "#fff", padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Sign me up 🎉</button>
                <div style={{ fontSize: 11, color: "rgba(240,237,232,0.35)", marginTop: 12 }}>No spam. Unsubscribe anytime.</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <div style={{ fontWeight: 900, fontSize: 20 }}>You're in! Welcome to Makola Digital 🌍</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
