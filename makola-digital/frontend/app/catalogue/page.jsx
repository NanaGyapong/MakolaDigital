"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = `${process.env.NEXT_PUBLIC_API_URL}";

export default function CataloguePage() {
  const router = useRouter();
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
    const token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }
    fetch(`${API}/listings/saved/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setListings(data.listings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const removeSaved = async (id) => {
    const token = localStorage.getItem("makola_token");
    await fetch(`${API}/listings/${id}/save`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setListings(prev => prev.filter(l => l.id !== id));
  };

  if (loading) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
        <div>Loading your catalogue...</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#E8533A", cursor: "pointer", fontSize: 20 }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 16 }}>📋 My Catalogue</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(240,237,232,0.4)" }}>{listings.length} saved listing{listings.length !== 1 ? "s" : ""}</div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "24px 16px" : "32px 24px" }}>
        {listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Your catalogue is empty</div>
            <div style={{ fontSize: 14, color: "rgba(240,237,232,0.5)", marginBottom: 28, lineHeight: 1.6 }}>Browse listings and click "Add to Catalogue"<br/>to save items you're interested in</div>
            <button onClick={() => router.push("/search")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Browse Listings →</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>My Catalogue</h1>
              <p style={{ fontSize: 14, color: "rgba(240,237,232,0.5)", margin: 0 }}>Listings you've saved for later</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {listings.map(l => (
                <div key={l.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", position: "relative" }}>
                  {/* Remove button */}
                  <button onClick={() => removeSaved(l.id)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 12, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  {/* Image */}
                  <div onClick={() => router.push("/listing/" + l.id)} style={{ cursor: "pointer" }}>
                    {l.primary_image
                      ? <img src={l.primary_image} alt={l.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: 140, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🛍️</div>
                    }
                  </div>
                  <div style={{ padding: "12px" }}>
                    <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l.category_name || l.type}</div>
                    <div onClick={() => router.push("/listing/" + l.id)} style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, cursor: "pointer", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{l.title}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#E8533A", marginBottom: 4 }}>{l.price ? l.price_currency + " " + Number(l.price).toLocaleString() : "Contact for price"}</div>
                    <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>📍 {l.city || l.country || "Ghana"} · by {l.seller_name}</div>
                    <button onClick={() => router.push("/listing/" + l.id)} style={{ width: "100%", marginTop: 10, background: "#E8533A", border: "none", color: "#fff", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View Listing →</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
