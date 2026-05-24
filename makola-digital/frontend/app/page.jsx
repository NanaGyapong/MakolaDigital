"use client";
import { useState } from "react";

const categories = [
  { icon: "🛍️", label: "Products", count: "12.4k", color: "#E8533A" },
  { icon: "🔧", label: "Services", count: "8.1k", color: "#2D9E6B" },
  { icon: "💼", label: "Jobs", count: "3.7k", color: "#C47F17" },
  { icon: "🏠", label: "Rentals", count: "2.2k", color: "#3B7DD8" },
  { icon: "🚗", label: "Vehicles", count: "5.9k", color: "#8B5CF6" },
  { icon: "📱", label: "Electronics", count: "9.3k", color: "#E8533A" },
  { icon: "👗", label: "Fashion", count: "6.6k", color: "#DB2777" },
  { icon: "🌿", label: "Food & Agric", count: "4.1k", color: "#2D9E6B" },
];

const featuredListings = [
  {
    id: 1, type: "product", badge: "Verified",
    title: "iPhone 15 Pro Max 256GB",
    price: "GH₵ 8,500", location: "Accra, Ghana",
    seller: "TechHub GH", rating: 4.8, reviews: 142,
    tag: "Electronics", img: "📱",
  },
  {
    id: 2, type: "service", badge: "Top Rated",
    title: "Professional Web & App Development",
    price: "From GH₵ 2,000", location: "Remote / Worldwide",
    seller: "CodeAfrica Studio", rating: 4.9, reviews: 87,
    tag: "Services", img: "💻",
  },
  {
    id: 3, type: "rental", badge: "New",
    title: "2BR Furnished Apartment — East Legon",
    price: "GH₵ 4,500 / mo", location: "East Legon, Accra",
    seller: "PrimeSpace GH", rating: 4.7, reviews: 33,
    tag: "Rentals", img: "🏠",
  },
  {
    id: 4, type: "job", badge: "Urgent",
    title: "Senior Data Scientist (Remote)",
    price: "$3,500–$5,000 / mo", location: "Remote — Africa",
    seller: "Fintech Lagos Ltd", rating: 4.6, reviews: 21,
    tag: "Jobs", img: "📊",
  },
  {
    id: 5, type: "product", badge: "Verified",
    title: "Toyota RAV4 2020 — Full Option",
    price: "GH₵ 185,000", location: "Kumasi, Ghana",
    seller: "AutoLink GH", rating: 4.5, reviews: 58,
    tag: "Vehicles", img: "🚗",
  },
  {
    id: 6, type: "service", badge: "Popular",
    title: "African Print Tailoring & Fashion Design",
    price: "From GH₵ 350", location: "Labone, Accra",
    seller: "Ama Couture", rating: 5.0, reviews: 204,
    tag: "Fashion", img: "👗",
  },
];

const stats = [
  { value: "180k+", label: "Active listings" },
  { value: "54", label: "African countries" },
  { value: "22k+", label: "Verified sellers" },
  { value: "1.2M+", label: "Community members" },
];

const badgeColor = {
  "Verified": "#2D9E6B", "Top Rated": "#3B7DD8",
  "New": "#8B5CF6", "Urgent": "#E8533A", "Popular": "#C47F17",
};

export default function MakolaDigital() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [savedIds, setSavedIds] = useState([]);
  const tabs = ["All", "Products", "Services", "Jobs", "Rentals"];

  const filtered = featuredListings.filter(l =>
    (activeTab === "All" || l.tag === activeTab) &&
    (search === "" || l.title.toLowerCase().includes(search.toLowerCase()) ||
     l.location.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSave = (id) =>
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#0D0D0D", minHeight: "100vh", color: "#F0EDE8",
    }}>
      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 60,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(13,13,13,0.95)", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #E8533A, #C47F17)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🌍</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
            Makola<span style={{ color: "#E8533A" }}>Digital</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Explore", "Sell", "Jobs", "Blog"].map(nav => (
            <button key={nav} style={{
              background: "none", border: "none", color: "rgba(240,237,232,0.6)",
              fontSize: 14, cursor: "pointer", padding: "6px 12px",
              borderRadius: 6, transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#F0EDE8"}
              onMouseLeave={e => e.target.style.color = "rgba(240,237,232,0.6)"}
            >{nav}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            color: "#F0EDE8", padding: "7px 16px", borderRadius: 8,
            fontSize: 13, cursor: "pointer",
          }}>Log in</button>
          <button style={{
            background: "#E8533A", border: "none",
            color: "#fff", padding: "7px 16px", borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>List for free</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        padding: "72px 32px 56px",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,83,58,0.18) 0%, transparent 70%)",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block", background: "rgba(232,83,58,0.12)",
          border: "1px solid rgba(232,83,58,0.3)", borderRadius: 20,
          padding: "4px 14px", fontSize: 12, color: "#E8533A",
          marginBottom: 20, fontWeight: 500,
        }}>
          🌍 Africa's Marketplace — Products · Services · Jobs · Rentals
        </div>
        <h1 style={{
          fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 800,
          letterSpacing: "-0.03em", lineHeight: 1.1,
          margin: "0 0 16px",
        }}>
          Buy, Sell & Connect<br />
          <span style={{
            background: "linear-gradient(90deg, #E8533A, #C47F17)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Across Africa & Beyond</span>
        </h1>
        <p style={{
          fontSize: 17, color: "rgba(240,237,232,0.6)", marginBottom: 36,
          maxWidth: 480, margin: "0 auto 36px",
        }}>
          The trusted marketplace connecting African businesses with buyers locally, continentally, and in the diaspora.
        </p>

        {/* SEARCH BAR */}
        <div style={{
          display: "flex", maxWidth: 580, margin: "0 auto",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14, overflow: "hidden", padding: 6, gap: 6,
        }}>
          <span style={{ padding: "0 12px", display: "flex", alignItems: "center", fontSize: 18 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, services, jobs, rentals..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#F0EDE8", fontSize: 15,
            }}
          />
          <button style={{
            background: "#E8533A", border: "none", borderRadius: 10,
            color: "#fff", padding: "10px 22px", fontSize: 14,
            fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}>Search</button>
        </div>

        {/* QUICK TAGS */}
        <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["iPhone", "Apartments Accra", "Remote Jobs", "Web Design", "Toyota"].map(tag => (
            <button key={tag} onClick={() => setSearch(tag)} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20, padding: "4px 12px", fontSize: 12,
              color: "rgba(240,237,232,0.6)", cursor: "pointer",
            }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 0,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: "20px 40px", textAlign: "center",
            borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#E8533A" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: "40px 32px 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, letterSpacing: "-0.02em" }}>
          Browse by category
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          {categories.map(cat => (
            <button key={cat.label} onClick={() => setActiveTab(cat.label === "Products" || cat.label === "Services" || cat.label === "Jobs" || cat.label === "Rentals" ? cat.label : "All")} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "16px 12px", cursor: "pointer",
              textAlign: "center", transition: "all 0.2s", color: "#F0EDE8",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = cat.color + "55"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>{cat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{cat.label}</div>
              <div style={{ fontSize: 11, color: cat.color, marginTop: 3 }}>{cat.count} listings</div>
            </button>
          ))}
        </div>
      </div>

      {/* LISTINGS */}
      <div style={{ padding: "8px 32px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Featured listings</h2>
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: activeTab === tab ? "#E8533A" : "rgba(255,255,255,0.05)",
                border: activeTab === tab ? "none" : "1px solid rgba(255,255,255,0.08)",
                color: activeTab === tab ? "#fff" : "rgba(240,237,232,0.6)",
                borderRadius: 8, padding: "6px 14px", fontSize: 13,
                cursor: "pointer", fontWeight: activeTab === tab ? 600 : 400,
              }}>{tab}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(240,237,232,0.4)", padding: "48px 0" }}>
            No listings found for "{search}"
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map(l => (
              <div key={l.id} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, overflow: "hidden", transition: "all 0.2s", cursor: "pointer",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                {/* Card image area */}
                <div style={{
                  height: 120, background: "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 48, position: "relative",
                }}>
                  {l.img}
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: badgeColor[l.badge] + "22",
                    border: `1px solid ${badgeColor[l.badge]}55`,
                    color: badgeColor[l.badge],
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                  }}>{l.badge}</div>
                  <button onClick={(e) => { e.stopPropagation(); toggleSave(l.id); }} style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.4)", border: "none",
                    borderRadius: 8, width: 30, height: 30, cursor: "pointer",
                    fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {savedIds.includes(l.id) ? "❤️" : "🤍"}
                  </button>
                </div>

                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", marginBottom: 4 }}>{l.tag}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{l.title}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#E8533A", marginBottom: 8 }}>{l.price}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>📍 {l.location}</div>
                    <div style={{ fontSize: 12, color: "#C47F17" }}>⭐ {l.rating} ({l.reviews})</div>
                  </div>
                  <div style={{
                    marginTop: 12, paddingTop: 12,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>by {l.seller}</div>
                    <button style={{
                      background: "rgba(232,83,58,0.12)", border: "1px solid rgba(232,83,58,0.3)",
                      color: "#E8533A", borderRadius: 8, padding: "5px 12px",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>View →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA BANNER */}
      <div style={{
        margin: "0 32px 48px",
        background: "linear-gradient(135deg, rgba(232,83,58,0.15), rgba(196,127,23,0.15))",
        border: "1px solid rgba(232,83,58,0.2)",
        borderRadius: 20, padding: "40px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 20,
      }}>
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Are you a business owner?
          </h3>
          <p style={{ fontSize: 14, color: "rgba(240,237,232,0.6)", margin: 0 }}>
            List your products, services, or jobs — reach millions across Africa & the diaspora.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            background: "none", border: "1px solid rgba(255,255,255,0.2)",
            color: "#F0EDE8", padding: "12px 24px", borderRadius: 10,
            fontSize: 14, cursor: "pointer",
          }}>Learn more</button>
          <button style={{
            background: "#E8533A", border: "none",
            color: "#fff", padding: "12px 24px", borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>Start selling free →</button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "24px 32px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        color: "rgba(240,237,232,0.35)", fontSize: 12,
      }}>
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
