"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

const TYPES = ["All", "Products", "Services", "Jobs", "Rentals"];
const CATEGORIES = {
  Products: ["Electronics", "Vehicles", "Fashion", "Food & Agriculture", "Home & Garden"],
  Services: ["Web Development", "Design & Creative", "Construction", "Cleaning", "Tutoring"],
  Jobs: ["Tech Jobs", "Sales & Marketing", "Finance", "Healthcare", "Education"],
  Rentals: ["Apartments", "Car Rentals", "Equipment", "Event Spaces"],
};
const COUNTRIES = ["All Countries", "Ghana", "Nigeria", "Kenya", "South Africa", "United Kingdom", "United States"];
const CURRENCIES = ["GHS", "NGN", "USD", "GBP"];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const initType = searchParams.get("type") ? searchParams.get("type").charAt(0).toUpperCase() + searchParams.get("type").slice(1) + "s" : "All";
  const [type, setType] = useState(initType);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [nearMe, setNearMe] = useState(false);
  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setNearMe(true);
        setCountry("Ghana");
      }, () => alert("Location access denied"));
    }
  };
  const [country, setCountry] = useState("All Countries");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const search = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== "All") params.set("type", type.toLowerCase().replace("s", "").replace("product", "product").replace("service", "service").replace("job", "job").replace("rental", "rental"));
      params.set("limit", "24");
      params.set("status", "active");
      const res = await fetch(`${API}/listings?${params}`);
      const data = await res.json();
      let results = data.listings || [];

      // Client-side filtering
      if (query) results = results.filter(l => l.title?.toLowerCase().includes(query.toLowerCase()) || l.description?.toLowerCase().includes(query.toLowerCase()) || l.location_text?.toLowerCase().includes(query.toLowerCase()));
      if (country !== "All Countries") results = results.filter(l => l.city?.toLowerCase().includes(country.toLowerCase()) || l.country?.toLowerCase().includes(country.toLowerCase().slice(0, 2)));
      if (minPrice) results = results.filter(l => Number(l.price) >= Number(minPrice));
      if (maxPrice) results = results.filter(l => Number(l.price) <= Number(maxPrice));

      setListings(results);
      setTotal(results.length);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { search(); }, [type, country]);

  const handleSearch = (e) => {
    e.preventDefault();
    search();
  };

  const typeMap = { "All": null, "Products": "product", "Services": "service", "Jobs": "job", "Rentals": "rental" };

  const FilterPanel = () => (
    <div style={{ width: isMobile ? "100%" : 220, background: "#0D0D0D", borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)", padding: 20, flexShrink: 0 }}>

      <div style={{ fontWeight: 800, marginBottom: 16, fontSize: 14 }}>Listing type</div>
      {TYPES.map(t => (
        <div key={t} onClick={() => setType(t)} style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: type === t ? "rgba(232,83,58,0.1)" : "transparent", color: type === t ? "#E8533A" : "rgba(240,237,232,0.7)", fontWeight: type === t ? 700 : 400, fontSize: 14 }}>{t}</div>
      ))}

      {CATEGORIES[type] && (
        <>
          <div style={{ fontWeight: 800, marginBottom: 12, marginTop: 20, fontSize: 14 }}>Category</div>
          <div onClick={() => setCategory("")} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: !category ? "rgba(232,83,58,0.08)" : "transparent", color: !category ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13 }}>All categories</div>
          {CATEGORIES[type].map(c => (
            <div key={c} onClick={() => setCategory(c)} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === c ? "rgba(232,83,58,0.08)" : "transparent", color: category === c ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13 }}>{c}</div>
          ))}
        </>
      )}

      <div style={{ fontWeight: 800, marginBottom: 12, marginTop: 20, fontSize: 14 }}>Location</div>
      <select value={country} onChange={e => setCountry(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "9px 12px", color: "#F0EDE8", fontSize: 13, outline: "none", marginBottom: 16 }}>
        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>Price range</div>
      <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 12px", color: "#F0EDE8", fontSize: 13, outline: "none", marginBottom: 8 }}>
        {CURRENCIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 10px", color: "#F0EDE8", fontSize: 13, outline: "none" }} />
        <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 10px", color: "#F0EDE8", fontSize: 13, outline: "none" }} />
      </div>

      <button onClick={search} style={{ width: "100%", background: "#E8533A", border: "none", color: "#fff", padding: "10px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Apply Filters</button>

      <button onClick={handleNearMe} style={{ width: "100%", background: nearMe ? "rgba(45,158,107,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid " + (nearMe ? "rgba(45,158,107,0.4)" : "rgba(255,255,255,0.1)"), color: nearMe ? "#2D9E6B" : "#F0EDE8", padding: "8px", borderRadius: 10, fontSize: 13, cursor: "pointer", marginBottom: 8, fontWeight: nearMe ? 700 : 400 }}>📍 Near Me</button>
      {(query || type !== "All" || category || country !== "All Countries" || minPrice || maxPrice) && (
        <button onClick={() => { setQuery(""); setType("All"); setCategory(""); setCountry("All Countries"); setMinPrice(""); setMaxPrice(""); setNearMe(false); }} style={{ width: "100%", background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,232,0.5)", padding: "8px", borderRadius: 10, fontSize: 13, cursor: "pointer", marginTop: 8 }}>Clear all filters</button>
      )}
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 56, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,13,13,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => router.push("/")}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌍</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Makola<span style={{ color: "#E8533A" }}>Digital</span></span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isMobile && <button onClick={() => setShowFilters(!showFilters)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>⚙️ Filters</button>}
          <button onClick={() => router.push("/auth/login")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "#F0EDE8", padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Log in</button>
        </div>
      </nav>

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>

        {/* Sidebar */}
        {(!isMobile || showFilters) && (
          <div style={{ overflowY: "auto" }}>
            <FilterPanel />
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, padding: isMobile ? "16px" : "24px", overflowY: "auto" }}>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, services, jobs, rentals..."
              style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "12px 16px", color: "#F0EDE8", fontSize: 14, outline: "none", fontFamily: "sans-serif" }}
            />
            <button type="submit" style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 20px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Search</button>
          </form>

          {/* Results header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "rgba(240,237,232,0.6)" }}>
              {loading ? "Searching..." : `${total} listing${total !== 1 ? "s" : ""} found${query ? ` for "${query}"` : ""}`}
            </div>
          </div>

          {/* Results grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "rgba(240,237,232,0.4)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div>Searching...</div>
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "rgba(240,237,232,0.4)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No listings found</div>
              <div style={{ fontSize: 14 }}>Try different keywords or filters</div>
              <button onClick={() => router.push("/sell")} style={{ marginTop: 20, background: "#E8533A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Be the first to list! →</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {listings.map(l => (
                <div key={l.id} onClick={() => router.push(`/listing/${l.id}`)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}>
                  {l.primary_image
                    ? <img src={l.primary_image} alt={l.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                    : <div style={{ height: 140, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                        {l.type === "product" ? "🛍️" : l.type === "service" ? "🔧" : l.type === "job" ? "💼" : "🏠"}
                      </div>
                  }
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "rgba(240,237,232,0.4)", textTransform: "uppercase", marginBottom: 4, letterSpacing: "0.05em" }}>{l.type}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{l.title}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#E8533A", marginBottom: 4 }}>
                      {l.price_currency} {Number(l.price).toLocaleString()}
                      {l.is_negotiable && <span style={{ fontSize: 10, color: "#2D9E6B", fontWeight: 400, marginLeft: 6 }}>· Neg.</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(240,237,232,0.45)" }}>📍 {l.location_text || l.city || l.country}</div>
                    <div style={{ fontSize: 11, color: "rgba(240,237,232,0.35)", marginTop: 2 }}>by {l.seller_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
