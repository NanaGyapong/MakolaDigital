// components/Recommendations.jsx
// Reusable component for showing ML recommendations anywhere
// Used on: home feed, listing detail page, search results

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/auth.service";

// ── API hooks ─────────────────────────────────────────────────
function useRecommendations(endpoint, params = {}) {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ ...params, page: reset ? 1 : page, limit: 20 });
      const { data: res } = await api.get(`${endpoint}?${qs}`);
      const recs = res.recommendations || [];
      setData(p => reset ? recs : [...p, ...recs]);
      setHasMore(recs.length === 20);
      if (!reset) setPage(p => p + 1);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, JSON.stringify(params)]);

  useEffect(() => { load(true); }, [endpoint]);

  return { data, loading, hasMore, loadMore: () => load(false), reload: () => load(true) };
}

// ── Track recommendation events ───────────────────────────────
async function trackRecEvent(listingId, eventType, { position, source, experimentId } = {}) {
  await api.post("/recommendations/event", {
    listingId, eventType, position, source, experimentId,
  }).catch(() => {});
}

// ── Listing card for recs ─────────────────────────────────────
function RecCard({ listing, index, source, experimentVariant, onSave, saved }) {
  const currSymbols = { GHS:"GH₵", NGN:"₦", KES:"KSh", USD:"$", GBP:"£" };
  const sym = currSymbols[listing.price_currency] || listing.price_currency;

  const handleClick = () => {
    trackRecEvent(listing.id, "click", { position: index, source, experimentId: "rec_strategy_v1" });
    window.location.href = `/listing/${listing.slug}`;
  };

  const handleSave = (e) => {
    e.stopPropagation();
    trackRecEvent(listing.id, saved ? "unsave" : "save", { position: index, source });
    onSave(listing.id);
  };

  const REASON_COLORS = {
    collaborative: "#3B7DD8",
    content:       "#8B5CF6",
    trending:      "#E8533A",
    contextual:    "#C47F17",
    hybrid:        "#2D9E6B",
  };

  return (
    <div onClick={handleClick}
      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.transform=""; }}
    >
      {/* Image */}
      <div style={{ height:110, background:"rgba(255,255,255,0.04)", position:"relative", overflow:"hidden" }}>
        {listing.image
          ? <img src={listing.image} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:42 }}>📦</div>
        }
        {listing.reason && (
          <div style={{ position:"absolute", bottom:7, left:7, background:REASON_COLORS[listing.reason]+"22", border:`1px solid ${REASON_COLORS[listing.reason]}44`, color:REASON_COLORS[listing.reason], fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:5, backdropFilter:"blur(4px)" }}>
            {listing.reasonText}
          </div>
        )}
        <button onClick={handleSave}
          style={{ position:"absolute", top:7, right:7, background:"rgba(0,0,0,0.45)", border:"none", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, cursor:"pointer" }}>
          {saved ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding:"11px 13px" }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:"rgba(240,237,232,0.3)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:3 }}>{listing.type}</div>
        <div style={{ fontSize:13, fontWeight:700, color:"#F0EDE8", lineHeight:1.3, marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{listing.title}</div>
        <div style={{ fontSize:15, fontWeight:900, color:"#E8533A", marginBottom:6 }}>
          {listing.price ? `${sym} ${parseFloat(listing.price).toLocaleString()}` : "Contact for price"}
        </div>
        <div style={{ fontSize:11, color:"rgba(240,237,232,0.45)" }}>📍 {listing.location_text || listing.country}</div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize:10.5, color:"rgba(240,237,232,0.35)" }}>
            {listing.seller_username}{listing.is_verified && " ✓"}
          </span>
          <span style={{ fontSize:11, color:"#C47F17", fontWeight:700 }}>
            ⭐ {parseFloat(listing.avg_rating || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Section header with reason label ─────────────────────────
function RecSectionHeader({ title, subtitle, strategy }) {
  const icons = { collaborative:"👥", content:"🔍", trending:"🔥", contextual:"⏰", hybrid:"🤖" };
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
      <div>
        <div style={{ fontSize:16, fontWeight:800, color:"#F0EDE8", letterSpacing:"-.02em", display:"flex", alignItems:"center", gap:8 }}>
          {icons[strategy] || "✨"} {title}
          <span style={{ background:"rgba(139,92,246,.12)", border:"1px solid rgba(139,92,246,.25)", color:"#8B5CF6", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5 }}>AI</span>
        </div>
        {subtitle && <div style={{ fontSize:12, color:"rgba(240,237,232,0.5)", marginTop:3 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ── PERSONALIZED FEED ─────────────────────────────────────────
export function PersonalizedFeed({ country }) {
  const { data: recs, loading, hasMore, loadMore } = useRecommendations("/recommendations", { country });
  const [savedIds, setSavedIds] = useState([]);
  const observerRef = useRef(null);
  const bottomRef = useRef(null);

  // Infinite scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) loadMore();
    }, { threshold: 0.1 });
    if (bottomRef.current) observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadMore]);

  const toggleSave = useCallback((id) => {
    setSavedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }, []);

  if (loading && !recs.length) return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
      {Array.from({length:8}).map((_,i) => (
        <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, height:220, animation:"pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );

  return (
    <div>
      {recs.length > 0 && <RecSectionHeader title="Recommended for you" subtitle="Personalised based on your activity" strategy="hybrid" />}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
        {recs.map((rec, i) => (
          <RecCard key={rec.id} listing={rec} index={i} source="home_feed" saved={savedIds.includes(rec.id)} onSave={toggleSave} />
        ))}
      </div>
      <div ref={bottomRef} style={{ height:20 }} />
      {loading && <div style={{ textAlign:"center", padding:20, color:"rgba(240,237,232,0.4)", fontSize:13 }}>Loading more...</div>}
    </div>
  );
}

// ── SIMILAR LISTINGS (for listing detail) ─────────────────────
export function SimilarListings({ listingId }) {
  const { data: recs, loading } = useRecommendations(`/recommendations/similar/${listingId}`);
  const [savedIds, setSavedIds] = useState([]);

  if (loading) return null;
  if (!recs.length) return null;

  return (
    <div style={{ marginTop:32 }}>
      <RecSectionHeader title="Similar listings" subtitle="You might also like" strategy="content" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
        {recs.slice(0,8).map((rec, i) => (
          <RecCard key={rec.id} listing={rec} index={i} source="similar" saved={savedIds.includes(rec.id)} onSave={id => setSavedIds(p => p.includes(id)?p.filter(x=>x!==id):[...p,id])} />
        ))}
      </div>
    </div>
  );
}

// ── TRENDING SECTION ──────────────────────────────────────────
export function TrendingSection({ country, type, title }) {
  const { data: recs, loading } = useRecommendations("/recommendations/trending", { country, type });
  const [savedIds, setSavedIds] = useState([]);

  if (loading || !recs.length) return null;

  return (
    <div style={{ marginBottom:32 }}>
      <RecSectionHeader title={title || "Trending now"} subtitle={country ? `Hot in ${country}` : "Most popular this week"} strategy="trending" />
      <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8 }}>
        {recs.slice(0,10).map((rec, i) => (
          <div key={rec.id} style={{ minWidth:200, flexShrink:0 }}>
            <RecCard listing={rec} index={i} source="trending" saved={savedIds.includes(rec.id)} onSave={id => setSavedIds(p => p.includes(id)?p.filter(x=>x!==id):[...p,id])} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PersonalizedFeed;
