"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

const TYPES = ["All", "Products", "Services", "Jobs", "Rentals"];
const CATEGORIES = {
  Products: ["Electronics", "Vehicles", "Fashion", "Food & Agriculture", "Home & Garden"],
  Services: ["Web Development", "Design & Creative", "Construction", "Cleaning", "Tutoring"],
  Jobs: ["Tech Jobs", "Sales & Marketing", "Finance", "Healthcare", "Education"],
  Rentals: ["Apartments", "Car Rentals", "Equipment", "Event Spaces"],
};

const SUBCATEGORIES = {
  "Vehicles & Spare Parts": ["Cars", "Motorbikes & Tricycles", "Spare Parts", "Trucks & Machinery"],
  "Property & Land": ["Apartment for Rent", "House for Rent", "Land for Sale", "House for Sale", "Shortlet / Airbnb", "Office & Commercial", "Shop for Rent"],
  "Electronics": ["Smartphones", "Feature Phones", "Tablets", "Accessories"],
  "Tech & Digital": ["TVs & Audio", "Computers & Laptops", "Cameras", "Gaming", "Power & Solar"],
  "Home & Garden": ["Furniture", "Appliances", "Kitchen & Dining", "Decor & Garden", "Tools & DIY", "Towels & Bedding", "Slippers & Footwear", "Cleaning Supplies", "Storage & Organisation"],
  "Fashion & Clothing": ["Men Wear", "Women Wear", "Kids & Babies", "Shoes", "Bags & Accessories", "Fabrics"],
  "Beauty & Health": ["Skincare", "Hair", "Makeup", "Fragrances", "Health Supplements", "Soaps & Body Wash", "Perfumes & Deodorants", "Pomade & Hair Cream", "Lotions & Oils"],
  "Agriculture & Farm Produce": ["Fresh Produce", "Grains & Cereals", "Processed Foods", "Farm Equipment", "Seedlings & Inputs"],
  "Farm Animals & Pets": ["Poultry", "Livestock", "Pets", "Animal Feed"],
  "Jobs & Careers": ["Full-time", "Part-time", "Contract", "Internship", "Remote", "Seeking Work / CV"],
  "Education & Training": ["Tutoring", "Online Courses", "Skills Training"],
  "Arts & Crafts": ["Handmade", "Wood & Carvings", "Paintings", "Cultural Items"],
  "Business Services": ["Accounting & Legal", "Marketing & Branding", "Finance & Insurance"],
  "Home Services": ["Plumbing", "Electrical", "AC & Appliance Repair", "Salon & Barber"],
};

const COUNTRIES = ["All Countries", "Ghana", "Nigeria", "Kenya", "South Africa", "Cameroon", "Ivory Coast", "Senegal", "Tanzania", "Uganda", "Rwanda", "Ethiopia", "Egypt", "Morocco", "United Kingdom", "United States", "Canada"];
const CURRENCIES = ["GHS", "NGN", "USD", "GBP"];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const initType = searchParams.get("type") ? searchParams.get("type").charAt(0).toUpperCase() + searchParams.get("type").slice(1) + "s" : "All";
  const [type, setType] = useState(initType);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [subcategory, setSubcategory] = useState("");
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
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const PER_PAGE = 20;
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
      params.set("limit", "100");
      params.set("status", "active");
      const res = await fetch(`${API}/listings?${params}`);
      const data = await res.json();
      let results = data.listings || [];

      // Client-side filtering
      if (query) results = results.filter(l => l.title?.toLowerCase().includes(query.toLowerCase()) || l.description?.toLowerCase().includes(query.toLowerCase()) || l.location_text?.toLowerCase().includes(query.toLowerCase()));
      if (country !== "All Countries") results = results.filter(l => l.city?.toLowerCase().includes(country.toLowerCase()) || l.country?.toLowerCase().includes(country.toLowerCase().slice(0, 2)));
      if (category) results = results.filter(l => l.category_name?.toLowerCase() === category.toLowerCase());
      if (subcategory) results = results.filter(l => l.title?.toLowerCase().includes(subcategory.toLowerCase()) || l.description?.toLowerCase().includes(subcategory.toLowerCase()));
      if (minPrice) results = results.filter(l => Number(l.price) >= Number(minPrice));
      if (maxPrice) results = results.filter(l => Number(l.price) <= Number(maxPrice));
      if (sortBy === "price_low") results = results.sort((a,b) => Number(a.price||0) - Number(b.price||0));
      if (sortBy === "price_high") results = results.sort((a,b) => Number(b.price||0) - Number(a.price||0));
      if (sortBy === "newest") results = results.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      if (sortBy === "popular") results = results.sort((a,b) => (b.views_count||0) - (a.views_count||0));

      setTotalCount(results.length);
      setTotal(results.length);
      const start = (page - 1) * PER_PAGE;
      setListings(results.slice(start, start + PER_PAGE));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { search(); }, [type, country, page, category, subcategory]);
  useEffect(() => { search(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    search();
  };

  const typeMap = { "All": null, "Products": "product", "Services": "service", "Jobs": "job", "Rentals": "rental" };

  const FilterPanel = () => (
    <div style={{ width: isMobile ? "100%" : 220, background: "#0D0D0D", borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.08)", padding: 20, flexShrink: 0 }}>

      <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>Browse category</div>
      <div onClick={() => { setCategory(""); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: !category ? "rgba(232,83,58,0.08)" : "transparent", color: !category ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: !category ? 700 : 400 }}>All categories</div>
      <div onClick={() => { setCategory("Vehicles & Spare Parts"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Vehicles & Spare Parts" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Vehicles & Spare Parts" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Vehicles & Spare Parts" ? 700 : 400 }}>Vehicles & Spare Parts</div>
      <div onClick={() => { setCategory("Property & Land"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Property & Land" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Property & Land" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Property & Land" ? 700 : 400 }}>Property & Land</div>
      <div onClick={() => { setCategory("Electronics"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Electronics" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Electronics" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Electronics" ? 700 : 400 }}>Electronics</div>
      <div onClick={() => { setCategory("Tech & Digital"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Tech & Digital" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Tech & Digital" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Tech & Digital" ? 700 : 400 }}>Tech & Digital</div>
      <div onClick={() => { setCategory("Home & Garden"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Home & Garden" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Home & Garden" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Home & Garden" ? 700 : 400 }}>Home & Garden</div>
      <div onClick={() => { setCategory("Fashion & Clothing"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Fashion & Clothing" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Fashion & Clothing" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Fashion & Clothing" ? 700 : 400 }}>Fashion & Clothing</div>
      <div onClick={() => { setCategory("Beauty & Health"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Beauty & Health" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Beauty & Health" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Beauty & Health" ? 700 : 400 }}>Beauty & Health</div>
      <div onClick={() => { setCategory("Agriculture & Farm Produce"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Agriculture & Farm Produce" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Agriculture & Farm Produce" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Agriculture & Farm Produce" ? 700 : 400 }}>Agriculture & Farm Produce</div>
      <div onClick={() => { setCategory("Farm Animals & Pets"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Farm Animals & Pets" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Farm Animals & Pets" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Farm Animals & Pets" ? 700 : 400 }}>Farm Animals & Pets</div>
      <div onClick={() => { setCategory("Jobs & Careers"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Jobs & Careers" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Jobs & Careers" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Jobs & Careers" ? 700 : 400 }}>Jobs & Careers</div>
      <div onClick={() => { setCategory("Education & Training"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Education & Training" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Education & Training" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Education & Training" ? 700 : 400 }}>Education & Training</div>
      <div onClick={() => { setCategory("Arts & Crafts"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Arts & Crafts" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Arts & Crafts" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Arts & Crafts" ? 700 : 400 }}>Arts & Crafts</div>
      <div onClick={() => { setCategory("Business Services"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Business Services" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Business Services" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Business Services" ? 700 : 400 }}>Business Services</div>
      <div onClick={() => { setCategory("Home Services"); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: category === "Home Services" ? "rgba(232,83,58,0.08)" : "transparent", color: category === "Home Services" ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13, fontWeight: category === "Home Services" ? 700 : 400 }}>Home Services</div>

      {category && SUBCATEGORIES[category] && (
        <div style={{ marginTop: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 13, color: "rgba(240,237,232,0.7)" }}>Subcategory</div>
          <select value={subcategory} onChange={e => setSubcategory(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 12px", color: "#F0EDE8", fontSize: 13, outline: "none" }}>
            <option value="">All {category}</option>
            {SUBCATEGORIES[category].map(sc => <option key={sc} value={sc}>{sc}</option>)}
          </select>
        </div>
      )}
      <div style={{ fontWeight: 800, marginBottom: 16, marginTop: 20, fontSize: 14 }}>Listing type</div>
      {TYPES.map(t => (
        <div key={t} onClick={() => setType(t)} style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: type === t ? "rgba(232,83,58,0.1)" : "transparent", color: type === t ? "#E8533A" : "rgba(240,237,232,0.7)", fontWeight: type === t ? 700 : 400, fontSize: 14 }}>{t}</div>
      ))}

      {CATEGORIES[type] && (
        <>
          <div style={{ fontWeight: 800, marginBottom: 12, marginTop: 20, fontSize: 14 }}>Category</div>
          <div onClick={() => { setCategory(""); setSubcategory(""); setPage(1); }} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: !category ? "rgba(232,83,58,0.08)" : "transparent", color: !category ? "#E8533A" : "rgba(240,237,232,0.6)", fontSize: 13 }}>All categories</div>
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
          {isMobile && <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? "rgba(232,83,58,0.15)" : "rgba(255,255,255,0.06)", border: showFilters ? "1px solid rgba(232,83,58,0.4)" : "none", color: showFilters ? "#E8533A" : "#F0EDE8", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: showFilters ? 700 : 400 }}>⚙️ Filters {(type !== "All" || category || country !== "All Countries" || minPrice || maxPrice) ? <span style={{ background: "#E8533A", color: "#fff", borderRadius: "50%", padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{[type !== "All", category, country !== "All Countries", minPrice, maxPrice].filter(Boolean).length}</span> : ""}</button>}
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

          {/* Quick filter chips */}
          {isMobile && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16, scrollbarWidth: "none" }}>
              {["All", "Products", "Services", "Jobs", "Rentals"].map(t => (
                <button key={t} onClick={() => { setType(t); setPage(1); }} style={{ background: type === t ? "#E8533A" : "rgba(255,255,255,0.06)", border: type === t ? "none" : "1px solid rgba(255,255,255,0.1)", color: type === t ? "#fff" : "rgba(240,237,232,0.7)", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: type === t ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t}</button>
              ))}
              <button onClick={() => setCountry("Ghana")} style={{ background: country === "Ghana" ? "#E8533A" : "rgba(255,255,255,0.06)", border: country === "Ghana" ? "none" : "1px solid rgba(255,255,255,0.1)", color: country === "Ghana" ? "#fff" : "rgba(240,237,232,0.7)", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: country === "Ghana" ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>🇬🇭 Ghana</button>
              <button onClick={() => setCountry("Nigeria")} style={{ background: country === "Nigeria" ? "#E8533A" : "rgba(255,255,255,0.06)", border: country === "Nigeria" ? "none" : "1px solid rgba(255,255,255,0.1)", color: country === "Nigeria" ? "#fff" : "rgba(240,237,232,0.7)", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: country === "Nigeria" ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>🇳🇬 Nigeria</button>
              <button onClick={() => setCountry("United Kingdom")} style={{ background: country === "United Kingdom" ? "#E8533A" : "rgba(255,255,255,0.06)", border: country === "United Kingdom" ? "none" : "1px solid rgba(255,255,255,0.1)", color: country === "United Kingdom" ? "#fff" : "rgba(240,237,232,0.7)", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: country === "United Kingdom" ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>🇬🇧 UK</button>
            </div>
          )}
          {/* Results header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "rgba(240,237,232,0.6)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
              <span>{loading ? "Searching..." : `${total} listing${total !== 1 ? "s" : ""} found${query ? ` for "${query}"` : ""}`}</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, padding:"6px 12px", color:"#F0EDE8", fontSize:13, cursor:"pointer", outline:"none" }}>
                <option value="newest">Newest first</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most popular</option>
              </select>
            </div>
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: "rgba(240,237,232,0.45)" }}>📍 {l.location_text || l.city || l.country}</div>
                      {new Date() - new Date(l.created_at) < 7 * 24 * 60 * 60 * 1000 && <span style={{ background: "linear-gradient(135deg,#E8533A,#C47F17)", color: "#fff", fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 20 }}>NEW</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(240,237,232,0.35)", marginTop: 2 }}>by {l.seller_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalCount > PER_PAGE && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 28, paddingBottom: 20 }}>
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }} disabled={page === 1} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
              <span style={{ color: "rgba(240,237,232,0.5)", fontSize: 13 }}>Page {page} of {Math.ceil(totalCount / PER_PAGE)}</span>
              <button onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }} disabled={page >= Math.ceil(totalCount / PER_PAGE)} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: page >= Math.ceil(totalCount / PER_PAGE) ? 0.4 : 1 }}>Next →</button>
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
