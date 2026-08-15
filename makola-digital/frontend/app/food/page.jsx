"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const API = process.env.NEXT_PUBLIC_API_URL;

const FOOD_CATS = [
  { label: "All", emoji: "🍛", value: "" },
  { label: "Cooked Food", emoji: "🍚", value: "Cooked Food" },
  { label: "Drinks", emoji: "🥤", value: "Food & Beverages" },
  { label: "Snacks", emoji: "🥗", value: "Snacks" },
  { label: "Pastries", emoji: "🍰", value: "Pastries" },
  { label: "Groceries", emoji: "🫙", value: "Groceries" },
  { label: "Alcohol", emoji: "🍺", value: "Alcoholic Drinks" },
];

export default function FoodPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activecat, setActivecat] = useState("");
  const [search, setSearch] = useState("");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/listings?category=Food%20%26%20Beverages&limit=50`)
      .then(r => r.json())
      .then(data => { setListings(data.listings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => {
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activecat || l.category_name?.includes(activecat) || l.title?.toLowerCase().includes(activecat.toLowerCase());
    return matchSearch && matchCat;
  });

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", paddingBottom: 80 }}>
      {/* Nav */}
      <nav style={{ background: "#0D0D0D", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => router.push("/")}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌍</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Makola<span style={{ color: "#E8533A" }}>Digital</span> <span style={{ fontSize: 10, background: "rgba(196,127,23,0.2)", color: "#C47F17", padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>FOOD</span></span>
        </div>
        <button onClick={() => router.push("/sell")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ List Food</button>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #E8533A, #C47F17)", padding: "20px 16px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -10, top: -10, fontSize: 100, opacity: 0.15 }}>🍛</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>🍛 Makola Food</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 14 }}>Order from food vendors — pickup & WhatsApp orders</p>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food, drinks, vendors..." style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, flex: 1 }} />
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: "14px 16px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(240,237,232,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Browse by type</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {FOOD_CATS.map(cat => (
            <button key={cat.label} onClick={() => setActivecat(cat.value)} style={{ background: activecat === cat.value ? "#E8533A" : "rgba(255,255,255,0.06)", border: activecat === cat.value ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: activecat === cat.value ? "#fff" : "rgba(240,237,232,0.7)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: activecat === cat.value ? 700 : 400, flexShrink: 0 }}>{cat.emoji} {cat.label}</button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding: "10px 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
          {loading ? "Loading..." : `${filtered.length} food listing${filtered.length !== 1 ? "s" : ""} found`}
        </div>

        {filtered.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍛</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No food listings yet</div>
            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)", marginBottom: 20 }}>Be the first food vendor on Makola Digital!</div>
            <button onClick={() => router.push("/sell")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>List Your Food →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {filtered.map(l => (
              <div key={l.id} onClick={() => router.push(`/listing/${l.id}`)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative" }}>
                {l.primary_image
                  ? <img src={l.primary_image} alt={l.title} style={{ width: "100%", height: 130, objectFit: "cover" }} />
                  : <div style={{ height: 130, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🍛</div>
                }
                <div style={{ position: "absolute", top: 8, left: 8, background: "#E8533A", borderRadius: 6, fontSize: 9, fontWeight: 800, color: "#fff", padding: "3px 7px" }}>FOOD</div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{l.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#E8533A", marginBottom: 4 }}>{l.price_currency} {Number(l.price).toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "rgba(240,237,232,0.4)", marginBottom: 8 }}>📍 {l.location_text || l.city || "Ghana"}</div>
                  {l.contact_phone && l.show_whatsapp && (
                    <a href={`https://wa.me/${l.contact_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I saw your food listing on Makola Digital: " + l.title)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", color: "#25D366", padding: "7px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 11 }}>📱 Order on WhatsApp</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <div style={{ margin: "16px", background: "rgba(232,83,58,0.08)", border: "1px solid rgba(232,83,58,0.2)", borderRadius: 14, padding: "16px", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Are you a food vendor? 🍛</div>
        <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 12 }}>List your food, drinks or snacks for free and reach buyers near you!</div>
        <button onClick={() => router.push("/sell")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Start Selling Food Free →</button>
      </div>
    </div>
  );
}
