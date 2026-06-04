"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

export default function ListingPage() {
  const router = useRouter();
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/listings/${id}`)
      .then(r => r.json())
      .then(data => {
        setListing(data.listing);
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8" }}>Loading...</div>;
  if (!listing) return <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8" }}>Listing not found</div>;

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 56, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,13,13,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => router.push("/")}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌍</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Makola<span style={{ color: "#E8533A" }}>Digital</span></span>
        </div>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>← Back</button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* Images */}
          <div>
            <div style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.04)", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              {images[activeImg]
                ? <img src={images[activeImg].url} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ fontSize: 64 }}>{listing.type === "product" ? "🛍️" : listing.type === "service" ? "🔧" : listing.type === "job" ? "💼" : "🏠"}</div>
              }
            </div>
            {images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: i === activeImg ? "2px solid #E8533A" : "2px solid transparent" }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", textTransform: "uppercase", marginBottom: 8 }}>{listing.type} · {listing.category_id}</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>{listing.title}</h1>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#E8533A", marginBottom: 8 }}>
              {listing.price_currency} {Number(listing.price).toLocaleString()}
              {listing.price_label && <span style={{ fontSize: 14, fontWeight: 400 }}> {listing.price_label}</span>}
            </div>
            {listing.is_negotiable && <div style={{ fontSize: 13, color: "#2D9E6B", marginBottom: 16 }}>✓ Price negotiable</div>}

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 4 }}>📍 Location</div>
              <div style={{ fontSize: 14 }}>{listing.location_text || listing.city || listing.country}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Description</div>
              <div style={{ fontSize: 14, color: "rgba(240,237,232,0.7)", lineHeight: 1.7 }}>{listing.description}</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Seller</div>
              <div style={{ fontSize: 14, color: "rgba(240,237,232,0.7)" }}>👤 {listing.seller_name}</div>
            </div>

            <button onClick={() => router.push("/auth/register")} style={{ width: "100%", background: "#E8533A", border: "none", color: "#fff", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
              Contact Seller
            </button>
            <button onClick={() => router.push("/auth/register")} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "14px", borderRadius: 12, fontSize: 15, cursor: "pointer" }}>
              Save Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
