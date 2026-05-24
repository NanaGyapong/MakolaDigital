import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:4000/api/v1" });
"use client";
import { Suspense } from "react";
"use client";
// app/search/page.jsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ── Hooks ──────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useSearch(params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    // Cancel previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== "" && v !== null && v !== undefined))
      );
      const res = await api.get(`/search?${qs}`, { signal: abortRef.current.signal });
      setData(res.data);
      setError(null);
    } catch (err) {
      if (err.name !== "CanceledError") setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ── Components ──────────────────────────────────────────────────
const BADGE_COLORS = {
  "Verified": "#2D9E6B", "Top Rated": "#3B7DD8", "New": "#8B5CF6",
  "Urgent": "#E8533A", "Popular": "#C47F17",
};

function ListingCard({ listing, saved, onSave, onClick }) {
  const priceStr = listing.price
    ? `${listing.priceCurrency === "GHS" ? "GH₵" : listing.priceCurrency} ${listing.price.toLocaleString()}`
    : "Price on request";

  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:15, overflow:"hidden", cursor:"pointer", transition:"all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = ""; }}
    >
      {/* Image */}
      <div style={{ height:110, background:"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:42, position:"relative" }}>
        {listing.primaryImage
          ? <img src={listing.primaryImage} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <span>📦</span>
        }
        {listing.isFeatured && (
          <div style={{ position:"absolute", top:9, left:9, background:"rgba(232,83,58,0.15)", border:"1px solid rgba(232,83,58,0.35)", color:"#E8533A", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:6 }}>Featured</div>
        )}
        <button onClick={e => { e.stopPropagation(); onSave(); }}
          style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.45)", border:"none", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, cursor:"pointer" }}>
          {saved ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding:"12px 14px" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"rgba(240,237,232,0.3)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:3 }}>{listing.type}</div>
        <div style={{ fontSize:13.5, fontWeight:700, color:"#F0EDE8", lineHeight:1.3, marginBottom:6 }}>{listing.title}</div>
        <div style={{ fontSize:16, fontWeight:900, color:"#E8533A", marginBottom:7 }}>{priceStr}{listing.priceLabel && <span style={{ fontSize:11, fontWeight:500, color:"rgba(240,237,232,0.5)" }}> {listing.priceLabel}</span>}</div>
        <div style={{ fontSize:11.5, color:"rgba(240,237,232,0.5)", marginBottom:8 }}>📍 {listing.locationText || listing.city || listing.country}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:8 }}>
          <span style={{ fontSize:10.5, color:"rgba(240,237,232,0.35)" }}>
            {listing.seller.businessName || listing.seller.name}
            {listing.seller.isVerified && <span style={{ marginLeft:5, background:"rgba(45,158,107,0.12)", color:"#2D9E6B", fontSize:9.5, fontWeight:700, padding:"1px 5px", borderRadius:4 }}>✓</span>}
          </span>
          <span style={{ fontSize:11, color:"#C47F17", fontWeight:700 }}>⭐ {listing.avgRating} ({listing.reviewCount})</span>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom:22, borderBottom:"1px solid rgba(255,255,255,0.08)", paddingBottom:22 }}>
      <div onClick={() => setOpen(p => !p)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:open?14:0, cursor:"pointer" }}>
        <span style={{ fontSize:13, fontWeight:800, color:"#F0EDE8" }}>{title}</span>
        <span style={{ fontSize:12, color:"rgba(240,237,232,0.4)", transition:"transform .2s", display:"inline-block", transform:open?"":"rotate(-90deg)" }}>▾</span>
      </div>
      {open && children}
    </div>
  );
}

function CheckItem({ label, count, checked, onChange }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:9, padding:"6px 0", cursor:"pointer" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width:15, height:15, accentColor:"#E8533A", cursor:"pointer" }} />
      <span style={{ fontSize:13, color:"rgba(240,237,232,0.55)", flex:1 }}>{label}</span>
      {count && <span style={{ fontSize:11, color:"rgba(240,237,232,0.28)", fontWeight:600 }}>{count}</span>}
    </label>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // Filters state
  const [q, setQ] = useState(sp.get("q") || "");
  const [type, setType] = useState(sp.get("type") || "all");
  const [sort, setSort] = useState(sp.get("sort") || "relevance");
  const [page, setPage] = useState(parseInt(sp.get("page") || "1"));
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [savedIds, setSavedIds] = useState([]);

  const debouncedQ = useDebounce(q, 500);

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchParams = {
    q: debouncedQ, type: type !== "all" ? type : "", sort, page,
    price_min: priceMin, price_max: priceMax, currency,
    verified_only: verifiedOnly || undefined,
    limit: 20,
  };

  const { data, loading } = useSearch(searchParams);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (q.length < 2) { setSuggestions([]); return; }
    api.get(`/search/suggest?q=${encodeURIComponent(q)}`)
      .then(res => setSuggestions(res.data.suggestions || []))
      .catch(() => setSuggestions([]));
  }, [q]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (type !== "all") params.set("type", type);
    if (sort !== "relevance") params.set("sort", sort);
    if (page > 1) params.set("page", page);
    router.replace(`/search?${params}`, { scroll: false });
  }, [debouncedQ, type, sort, page]);

  const toggleSave = (id) => setSavedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const s = {
    page: { display:"grid", gridTemplateColumns:"272px 1fr", minHeight:"calc(100vh - 56px)" },
    sidebar: { background:"#0D0D0D", borderRight:"1px solid rgba(255,255,255,0.08)", padding:20, position:"sticky", top:56, height:"calc(100vh - 56px)", overflowY:"auto" },
    results: { padding:"20px 24px" },
    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:13 },
    list: { display:"flex", flexDirection:"column", gap:12 },
    btn: (active) => ({
      background: active ? "#E8533A" : "rgba(255,255,255,0.05)",
      border: `1px solid ${active ? "#E8533A" : "rgba(255,255,255,0.08)"}`,
      color: active ? "#fff" : "rgba(240,237,232,0.55)",
      padding:"7px 14px", borderRadius:8, fontSize:12.5, fontWeight:700, cursor:"pointer",
    }),
  };

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        {/* Type */}
        <FilterSection title="Listing type">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
            {[["all","🏪","All"],["product","🛍️","Products"],["service","🔧","Services"],["job","💼","Jobs"],["rental","🏠","Rentals"],["vehicle","🚗","Vehicles"]].map(([t,ic,lb]) => (
              <button key={t} onClick={() => { setType(t); setPage(1); }}
                style={{ background: type===t?"rgba(232,83,58,0.09)":"rgba(255,255,255,0.04)", border:`1.5px solid ${type===t?"#E8533A":"rgba(255,255,255,0.08)"}`, borderRadius:10, padding:"10px 8px", textAlign:"center", cursor:"pointer", fontSize:12, fontWeight:600, color:type===t?"#E8533A":"rgba(240,237,232,0.55)", transition:"all .15s" }}>
                <span style={{ fontSize:20, display:"block", marginBottom:5 }}>{ic}</span>{lb}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price range">
          <div style={{ display:"flex", gap:5, marginBottom:12 }}>
            {[["GHS","GH₵"],["NGN","₦"],["USD","$"],["GBP","£"]].map(([c,sym]) => (
              <button key={c} onClick={() => setCurrency(c)}
                style={{ background:currency===c?"rgba(232,83,58,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${currency===c?"rgba(232,83,58,0.3)":"rgba(255,255,255,0.08)"}`, borderRadius:7, padding:"5px 10px", fontSize:11.5, fontWeight:700, color:currency===c?"#E8533A":"rgba(240,237,232,0.5)", cursor:"pointer" }}>
                {sym}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
            <input placeholder="Min" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)}
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:9, padding:"9px 11px", color:"#F0EDE8", fontSize:13, outline:"none", width:"100%" }} />
            <input placeholder="Max" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)}
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:9, padding:"9px 11px", color:"#F0EDE8", fontSize:13, outline:"none", width:"100%" }} />
          </div>
        </FilterSection>

        {/* Seller */}
        <FilterSection title="Seller">
          <CheckItem label="Verified sellers only" checked={verifiedOnly} onChange={e => { setVerifiedOnly(e.target.checked); setPage(1); }} />
        </FilterSection>

        {/* Clear */}
        <button onClick={() => { setType("all"); setPriceMin(""); setPriceMax(""); setVerifiedOnly(false); setPage(1); }}
          style={{ width:"100%", background:"none", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(240,237,232,0.55)", borderRadius:9, padding:9, fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4 }}>
          Clear all filters
        </button>
      </div>

      {/* Results */}
      <div style={s.results}>
        {/* Topbar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:"#F0EDE8" }}>
              {loading ? "Searching..." : `${(data?.pagination?.total || 0).toLocaleString()} results`}
            </div>
            <div style={{ fontSize:12, color:"rgba(240,237,232,0.5)", marginTop:2 }}>
              {debouncedQ ? `for "${debouncedQ}"` : "All listings"}
              {type !== "all" ? ` · ${type}s` : ""}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12.5, color:"rgba(240,237,232,0.5)", fontWeight:600 }}>Sort:</span>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              style={{ background:"#131315", border:"1px solid rgba(255,255,255,0.08)", color:"#F0EDE8", padding:"8px 12px", borderRadius:9, fontSize:13, outline:"none" }}>
              <option value="relevance">Most relevant</option>
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
              <option value="rating">Highest rated</option>
              <option value="views">Most viewed</option>
            </select>
            <div style={{ display:"flex", gap:4 }}>
              {["grid","list"].map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  style={{ background:viewMode===v?"rgba(232,83,58,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${viewMode===v?"rgba(232,83,58,0.3)":"rgba(255,255,255,0.08)"}`, borderRadius:8, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:"pointer" }}>
                  {v === "grid" ? "⊞" : "☰"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={s.grid}>
            {Array.from({length:8}).map((_,i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:15, height:240 }} />
            ))}
          </div>
        ) : !data?.listings?.length ? (
          <div style={{ textAlign:"center", padding:"64px 20px", color:"rgba(240,237,232,0.5)" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <div style={{ fontSize:17, fontWeight:800, color:"#F0EDE8", marginBottom:8 }}>No results found</div>
            <div style={{ fontSize:13.5, lineHeight:1.65 }}>Try different keywords or remove some filters.</div>
          </div>
        ) : (
          <div style={viewMode === "grid" ? s.grid : s.list}>
            {data.listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                saved={savedIds.includes(listing.id)}
                onSave={() => toggleSave(listing.id)}
                onClick={() => router.push(`/listing/${listing.slug}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:28, paddingBottom:28 }}>
            <button disabled={!data.pagination.hasPrev} onClick={() => setPage(p => p-1)}
              style={{ ...s.btn(false), opacity:data.pagination.hasPrev?1:0.3, padding:"0 14px", height:36 }}>
              ← Prev
            </button>
            {Array.from({length:Math.min(data.pagination.totalPages, 7)}, (_, i) => {
              const p = i + 1;
              return <button key={p} onClick={() => setPage(p)} style={{ ...s.btn(p===page), width:36, height:36 }}>{p}</button>;
            })}
            <button disabled={!data.pagination.hasNext} onClick={() => setPage(p => p+1)}
              style={{ ...s.btn(false), opacity:data.pagination.hasNext?1:0.3, padding:"0 14px", height:36 }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
