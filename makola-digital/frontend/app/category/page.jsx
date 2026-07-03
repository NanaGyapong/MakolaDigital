"use client";
import { useRouter } from "next/navigation";

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

export default function CategoriesPage() {
  const router = useRouter();
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#E8533A", cursor: "pointer", fontSize: 20 }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 16 }}>🌍 Browse Categories</div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>All Categories</h1>
        <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 15, marginBottom: 32 }}>Browse everything available on Makola Digital</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} onClick={() => router.push("/category/" + cat.slug)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 16px", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{cat.name}</div>
              <div style={{ fontSize: 11, color: "#E8533A", fontWeight: 600 }}>Browse →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
