"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

const CATEGORIES = [
  {
    "id": 1,
    "name": "Fashion & Clothing",
    "slug": "fashion",
    "emoji": "👗",
    "description": "Buy and sell fashion, clothing, shoes and accessories in Ghana and Africa."
  },
  {
    "id": 2,
    "name": "Electronics",
    "slug": "electronics",
    "emoji": "💻",
    "description": "Buy and sell laptops, TVs, audio equipment and electronics in Ghana."
  },
  {
    "id": 3,
    "name": "Home & Garden",
    "slug": "home-garden",
    "emoji": "🏠",
    "description": "Buy and sell furniture, appliances and home essentials in Ghana."
  },
  {
    "id": 4,
    "name": "Beauty & Health",
    "slug": "beauty-health",
    "emoji": "💄",
    "description": "Buy and sell beauty products, skincare and health items in Ghana."
  },
  {
    "id": 5,
    "name": "Food & Beverages",
    "slug": "food-beverages",
    "emoji": "🍎",
    "description": "Buy and sell food, drinks and agricultural produce in Ghana."
  },
  {
    "id": 6,
    "name": "Agriculture & Farm Produce",
    "slug": "agriculture",
    "emoji": "🌾",
    "description": "Buy and sell farm produce, seeds and agricultural equipment in Ghana."
  },
  {
    "id": 7,
    "name": "Farm Animals & Pets",
    "slug": "animals-pets",
    "emoji": "🐓",
    "description": "Buy and sell farm animals, pets and livestock in Ghana."
  },
  {
    "id": 8,
    "name": "Arts & Crafts",
    "slug": "arts-crafts",
    "emoji": "🎨",
    "description": "Buy and sell handmade crafts, art and creative works in Ghana."
  },
  {
    "id": 9,
    "name": "Vehicles & Spare Parts",
    "slug": "vehicles",
    "emoji": "🚗",
    "description": "Buy and sell cars, motorbikes and spare parts in Ghana."
  },
  {
    "id": 10,
    "name": "Property & Land",
    "slug": "property",
    "emoji": "🏘️",
    "description": "Buy, sell and rent property, land and apartments in Ghana."
  },
  {
    "id": 11,
    "name": "Business Services",
    "slug": "business-services",
    "emoji": "🏢",
    "description": "Find business services, consultants and professionals in Ghana."
  },
  {
    "id": 12,
    "name": "Tech & Digital",
    "slug": "tech-digital",
    "emoji": "💻",
    "description": "Find web developers, designers and digital services in Ghana."
  },
  {
    "id": 13,
    "name": "Jobs & Careers",
    "slug": "jobs",
    "emoji": "💼",
    "description": "Find jobs, internships and career opportunities in Ghana."
  },
  {
    "id": 14,
    "name": "Education & Training",
    "slug": "education",
    "emoji": "📚",
    "description": "Find tutors, courses and educational services in Ghana."
  },
  {
    "id": 15,
    "name": "Home Services",
    "slug": "home-services",
    "emoji": "🔧",
    "description": "Find plumbers, electricians and home service providers in Ghana."
  }
];

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = useParams();
  const cat = CATEGORIES.find(c => c.slug === slug);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!cat) return;
    fetch(`${API}/listings?category=${encodeURIComponent(cat.name)}`)
      .then(r => r.json())
      .then(data => { setListings(data.listings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (!cat) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Category not found</div>
        <button onClick={() => router.push("/category")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 10, cursor: "pointer" }}>Browse Categories</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/category")} style={{ background: "none", border: "none", color: "#E8533A", cursor: "pointer", fontSize: 20 }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 16 }}>🌍 Makola Digital</div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, rgba(232,83,58,0.12), rgba(196,127,23,0.08))", padding: isMobile ? "32px 20px" : "48px 40px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{cat.emoji}</div>
        <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: "0 0 8px" }}>{cat.name}</h1>
        <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 14, margin: "0 0 20px" }}>{cat.description}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/search?category=" + encodeURIComponent(cat.name))} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Search in {cat.name} →</button>
          <button onClick={() => router.push("/sell")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#F0EDE8", padding: "10px 24px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>Sell in this category</button>
        </div>
      </div>

      {/* Listings */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 16px" : "32px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{loading ? "Loading..." : `${listings.length} listing${listings.length !== 1 ? "s" : ""} in ${cat.name}`}</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(240,237,232,0.4)" }}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{cat.emoji}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No listings yet in {cat.name}</div>
            <div style={{ fontSize: 14, color: "rgba(240,237,232,0.5)", marginBottom: 24 }}>Be the first to list something in this category!</div>
            <button onClick={() => router.push("/sell")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>List for Free →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {listings.map(l => (
              <div key={l.id} onClick={() => router.push("/listing/" + l.id)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                {l.primary_image
                  ? <img src={l.primary_image} alt={l.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                  : <div style={{ height: 160, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{cat.emoji}</div>
                }
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{l.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#E8533A", marginBottom: 3 }}>{l.price ? l.price_currency + " " + Number(l.price).toLocaleString() : "Contact for price"}</div>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>📍 {l.city || l.country || "Ghana"} · by {l.seller_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
