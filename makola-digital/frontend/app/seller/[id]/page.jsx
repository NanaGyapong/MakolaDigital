"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

export default function SellerProfile() {
  const router = useRouter();
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
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
    fetch(`${API}/sellers/${id}`)
      .then(r => r.json())
      .then(data => {
        setSeller(data.seller);
        setListings(data.listings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
        <div>Loading seller profile...</div>
      </div>
    </div>
  );

  if (!seller) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>😕</div>
        <div>Seller not found</div>
        <button onClick={() => router.push("/")} style={{ marginTop: 16, background: "#E8533A", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 10, cursor: "pointer" }}>Go Home</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#E8533A", cursor: "pointer", fontSize: 20 }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 16 }}>🌍 Makola Digital</div>
      </div>

      {/* Seller Hero */}
      <div style={{ background: "linear-gradient(135deg, rgba(232,83,58,0.15), rgba(196,127,23,0.1))", padding: isMobile ? "32px 20px" : "48px 40px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", fontWeight: 900 }}>
          {(seller.display_name || seller.full_name || "S").charAt(0).toUpperCase()}
        </div>
        <div style={{ fontWeight: 900, fontSize: 24, marginBottom: 4 }}>{seller.display_name || seller.full_name}</div>
        <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)", marginBottom: 12 }}>
          📍 {seller.country || "Ghana"} · Member since {new Date(seller.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ background: "rgba(45,158,107,0.15)", border: "1px solid rgba(45,158,107,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#2D9E6B", fontWeight: 700 }}>
            ✅ Verified Seller
          </div>
          <div style={{ background: "rgba(232,83,58,0.1)", border: "1px solid rgba(232,83,58,0.2)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#E8533A", fontWeight: 700 }}>
            📦 {listings.length} Listing{listings.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding: isMobile ? "24px 16px" : "32px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 20 }}>
          All listings by {seller.display_name || seller.full_name}
        </div>
        {listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(240,237,232,0.4)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>No active listings yet</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {listings.map(l => (
              <div key={l.id} onClick={() => router.push(`/listing/${l.id}`)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                {l.primary_image
                  ? <img src={l.primary_image} alt={l.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                  : <div style={{ height: 160, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                      {l.type === "product" ? "🛍️" : l.type === "service" ? "🔧" : l.type === "job" ? "💼" : "🏠"}
                    </div>
                }
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{l.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#E8533A", marginBottom: 4 }}>
                    {l.price_currency} {Number(l.price).toLocaleString()}
                    {l.is_negotiable && <span style={{ fontSize: 10, color: "#2D9E6B", marginLeft: 6 }}>· Neg.</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(240,237,232,0.45)" }}>📍 {l.city || l.country}</div>
                  {new Date() - new Date(l.created_at) < 7 * 24 * 60 * 60 * 1000 && (
                    <span style={{ background: "#E8533A", color: "#fff", fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 10 }}>NEW</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
