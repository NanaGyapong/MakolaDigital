"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

const SAFETY_TIPS = {
  product: "🛡️ Safety tip: Always inspect the product in person before making payment. Meet in a safe public place. Makola Digital is not responsible for transactions made outside the platform.",
  service: "🛡️ Safety tip: Verify the service provider's credentials and reviews before hiring. Request a written agreement for large jobs. Never pay the full amount upfront.",
  job: "🛡️ Safety tip: Research the company before applying. Legitimate employers never ask for payment during hiring. Verify the job offer before sharing personal documents.",
  rental: "🛡️ Safety tip: Always visit the property in person before making any payment. Verify ownership documents. Never transfer money without a signed rental agreement.",
};

export default function ListingPage() {
  const router = useRouter();
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("message");
  const [message, setMessage] = useState("");
  const [offer, setOffer] = useState("");
  const [sent, setSent] = useState(false);

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

  const handleSend = () => {
    const token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }
    setSent(true);
    setMessage("");
    setOffer("");
  };

  if (loading) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8" }}>
      Loading...
    </div>
  );

  if (!listing) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8" }}>
      Listing not found
    </div>
  );

  const safetyTip = SAFETY_TIPS[listing.type] || SAFETY_TIPS.product;

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

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

          {/* LEFT — Images */}
          <div>
            <div style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.04)", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              {images[activeImg]
                ? <img src={images[activeImg].url} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ fontSize: 72 }}>{listing.type === "product" ? "🛍️" : listing.type === "service" ? "🔧" : listing.type === "job" ? "💼" : "🏠"}</div>
              }
            </div>
            {images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: i === activeImg ? "2px solid #E8533A" : "2px solid transparent", opacity: i === activeImg ? 1 : 0.6 }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* SAFETY NOTICE */}
            <div style={{ marginTop: 20, background: "rgba(196,127,23,0.08)", border: "1px solid rgba(196,127,23,0.25)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, color: "rgba(240,237,232,0.7)", lineHeight: 1.6 }}>{safetyTip}</div>
              <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", marginTop: 8 }}>
                📞 Report suspicious listings: <span style={{ color: "#E8533A" }}>hello@makoladigital.online</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Details + Chat */}
          <div>
            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.05em" }}>{listing.type}</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>{listing.title}</h1>

            <div style={{ fontSize: 26, fontWeight: 800, color: "#E8533A", marginBottom: 6 }}>
              {listing.price_currency} {Number(listing.price).toLocaleString()}
              {listing.price_label && <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(240,237,232,0.5)" }}> {listing.price_label}</span>}
            </div>
            {listing.is_negotiable && <div style={{ fontSize: 12, color: "#2D9E6B", marginBottom: 12 }}>✓ Open to offers</div>}

            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.6)", marginBottom: 12 }}>📍 {listing.location_text || listing.city || listing.country}</div>

            <div style={{ fontSize: 14, color: "rgba(240,237,232,0.7)", lineHeight: 1.7, marginBottom: 20, padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
              {listing.description}
            </div>

            {/* Seller info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{listing.seller_name}</div>
                <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>Verified seller · Makola Digital</div>
              </div>
            </div>

            {/* Chat / Offer Box */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["message", "offer"].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "12px", background: tab === t ? "rgba(232,83,58,0.1)" : "none", border: "none", color: tab === t ? "#E8533A" : "rgba(240,237,232,0.5)", fontSize: 13, fontWeight: tab === t ? 700 : 400, cursor: "pointer", textTransform: "capitalize", borderBottom: tab === t ? "2px solid #E8533A" : "2px solid transparent" }}>
                    {t === "message" ? "💬 Send Message" : "💰 Make an Offer"}
                  </button>
                ))}
              </div>

              <div style={{ padding: 16 }}>
                {sent ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      {tab === "message" ? "Message sent!" : "Offer sent!"}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>The seller will respond shortly.</div>
                    <button onClick={() => setSent(false)} style={{ marginTop: 12, background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Send another</button>
                  </div>
                ) : (
                  <>
                    {tab === "message" ? (
                      <>
                        <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 8 }}>Ask about this {listing.type} or arrange to meet</div>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder={`Hi, I'm interested in your ${listing.title}. Is it still available?`}
                          rows={4}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 12px", color: "#F0EDE8", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }}
                        />
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 8 }}>
                          Listed at {listing.price_currency} {Number(listing.price).toLocaleString()} · Enter your offer
                        </div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "rgba(240,237,232,0.6)" }}>{listing.price_currency}</span>
                          <input
                            type="number"
                            value={offer}
                            onChange={e => setOffer(e.target.value)}
                            placeholder="Your offer amount"
                            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "10px 12px", color: "#F0EDE8", fontSize: 13, outline: "none" }}
                          />
                        </div>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder="Add a note with your offer (optional)"
                          rows={2}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 12px", color: "#F0EDE8", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }}
                        />
                      </>
                    )}
                    <button
                      onClick={handleSend}
                      disabled={tab === "message" ? !message.trim() : !offer}
                      style={{ width: "100%", marginTop: 10, background: tab === "message" ? "#E8533A" : "#2D9E6B", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: (tab === "message" ? !message.trim() : !offer) ? 0.5 : 1 }}>
                      {tab === "message" ? "Send Message →" : "Submit Offer →"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.3)", textAlign: "center", lineHeight: 1.6 }}>
              🔒 Your contact details are protected. Messages are sent through Makola Digital's secure platform.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
