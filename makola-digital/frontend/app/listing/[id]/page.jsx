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

function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ fontSize: readonly ? 14 : 24, cursor: readonly ? "default" : "pointer", color: star <= (hover || value) ? "#C47F17" : "rgba(255,255,255,0.2)", transition: "color 0.1s" }}
        >★</span>
      ))}
    </div>
  );
}

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
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [related, setRelated] = useState([]);
  const [reviewError, setReviewError] = useState("");

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

    fetch(`${API}/listings/${id}/related`).then(r=>r.json()).then(data=>setRelated(data.listings||[])).catch(()=>{});
    fetch(`${API}/reviews/listing/${id}`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.average || 0);
        setTotalReviews(data.total || 0);
      })
      .catch(() => {});
  }, [id]);

  const handleSend = () => {
    const token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }
    setSent(true);
    setMessage("");
    setOffer("");
  };

  const handleReviewSubmit = async () => {
    const token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }
    if (!reviewRating) { setReviewError("Please select a rating"); return; }
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const res = await fetch(`${API}/reviews/listing/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, title: reviewTitle, body: reviewBody })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess(true);
        setShowReviewForm(false);
        // Refresh reviews
        fetch(`${API}/reviews/listing/${id}`)
          .then(r => r.json())
          .then(data => { setReviews(data.reviews || []); setAvgRating(data.average || 0); setTotalReviews(data.total || 0); });
      } else {
        setReviewError(data.message);
      }
    } catch (e) { setReviewError("Failed to submit review"); }
    setReviewSubmitting(false);
  };

  if (loading) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div><div>Loading...</div></div>
    </div>
  );

  if (!listing) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8", fontFamily: "sans-serif" }}>
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

          {/* LEFT — Images + Safety */}
          <div>
            <div style={{ borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.04)", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              {images[activeImg]
                ? <img src={images[activeImg].url} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ fontSize: 72 }}>{listing.type === "product" ? "🛍️" : listing.type === "service" ? "🔧" : listing.type === "job" ? "💼" : "🏠"}</div>
              }
            </div>
            {images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: i === activeImg ? "2px solid #E8533A" : "2px solid transparent", opacity: i === activeImg ? 1 : 0.6 }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Safety Notice */}
            <div style={{ background: "rgba(196,127,23,0.08)", border: "1px solid rgba(196,127,23,0.25)", borderRadius: 12, padding: 16 }}>
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

            {/* Rating summary */}
            {totalReviews > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <StarRating value={Math.round(avgRating)} readonly />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#C47F17" }}>{avgRating}</span>
                <span style={{ fontSize: 13, color: "rgba(240,237,232,0.5)" }}>({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
              </div>
            )}

            <div style={{ fontSize: 26, fontWeight: 800, color: "#E8533A", marginBottom: 6 }}>
              {listing.price_currency} {Number(listing.price).toLocaleString()}
              {listing.price_label && <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(240,237,232,0.5)" }}> {listing.price_label}</span>}
            </div>
            {listing.is_negotiable && <div style={{ fontSize: 12, color: "#2D9E6B", marginBottom: 12 }}>✓ Open to offers</div>}

            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.6)", marginBottom: 12 }}>📍 {listing.location_text || listing.city || listing.country}</div>

            <div style={{ fontSize: 14, color: "rgba(240,237,232,0.7)", lineHeight: 1.7, marginBottom: 20, padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
              {listing.description}
            </div>

            {/* Seller */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{listing.seller_name}</div>
                <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>Verified seller · Makola Digital</div>
              </div>
            </div>

            {/* Chat / Offer Box */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
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
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{tab === "message" ? "Message sent!" : "Offer sent!"}</div>
                    <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>The seller will respond shortly.</div>
                    <button onClick={() => setSent(false)} style={{ marginTop: 12, background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Send another</button>
                  </div>
                ) : (
                  <>
                    {tab === "message" ? (
                      <>
                        <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 8 }}>Ask about this {listing.type} or arrange to meet</div>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={`Hi, I'm interested in your ${listing.title}. Is it still available?`} rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 12px", color: "#F0EDE8", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }} />
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 8 }}>Listed at {listing.price_currency} {Number(listing.price).toLocaleString()} · Enter your offer</div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <span style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "rgba(240,237,232,0.6)" }}>{listing.price_currency}</span>
                          <input type="number" value={offer} onChange={e => setOffer(e.target.value)} placeholder="Your offer amount" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "10px 12px", color: "#F0EDE8", fontSize: 13, outline: "none" }} />
                        </div>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Add a note (optional)" rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 12px", color: "#F0EDE8", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }} />
                      </>
                    )}
                    <button onClick={handleSend} disabled={tab === "message" ? !message.trim() : !offer} style={{ width: "100%", marginTop: 10, background: tab === "message" ? "#E8533A" : "#2D9E6B", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: (tab === "message" ? !message.trim() : !offer) ? 0.5 : 1 }}>
                      {tab === "message" ? "Send Message →" : "Submit Offer →"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.3)", textAlign: "center" }}>
              🔒 Messages are sent through Makola Digital's secure platform.
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div style={{ marginTop: 40, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>Reviews & Ratings</h2>
              {totalReviews > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "#C47F17" }}>{avgRating}</span>
                  <div>
                    <StarRating value={Math.round(avgRating)} readonly />
                    <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginTop: 2 }}>{totalReviews} review{totalReviews !== 1 ? "s" : ""}</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "rgba(240,237,232,0.5)" }}>No reviews yet — be the first!</div>
              )}
            </div>
            {!showReviewForm && !reviewSuccess && (
              <button onClick={() => { const token = localStorage.getItem("makola_token"); if (!token) { router.push("/auth/login"); return; } setShowReviewForm(true); }} style={{ background: "rgba(196,127,23,0.12)", border: "1px solid rgba(196,127,23,0.3)", color: "#C47F17", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                ★ Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Review</h3>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 8 }}>Rating *</div>
                <StarRating value={reviewRating} onChange={setReviewRating} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 6 }}>Title (optional)</div>
                <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="Summarize your experience" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 12px", color: "#F0EDE8", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 6 }}>Review (optional)</div>
                <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)} placeholder="Share your experience with this listing..." rows={4} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 12px", color: "#F0EDE8", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" }} />
              </div>

              {reviewError && <div style={{ color: "#E8533A", fontSize: 13, marginBottom: 12 }}>⚠️ {reviewError}</div>}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleReviewSubmit} disabled={reviewSubmitting} style={{ flex: 2, background: "#C47F17", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: reviewSubmitting ? 0.6 : 1 }}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review ★"}
                </button>
                <button onClick={() => setShowReviewForm(false)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "12px", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {reviewSuccess && (
            <div style={{ background: "rgba(45,158,107,0.1)", border: "1px solid rgba(45,158,107,0.3)", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
              <div style={{ fontWeight: 700, color: "#2D9E6B" }}>Review submitted! Thank you.</div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.reviewer_name}</div>
                        <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                    </div>
                    <StarRating value={r.rating} readonly />
                  </div>
                  {r.title && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{r.title}</div>}
                  {r.body && <div style={{ fontSize: 14, color: "rgba(240,237,232,0.7)", lineHeight: 1.6 }}>{r.body}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(240,237,232,0.3)" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⭐</div>
              <div>No reviews yet. Be the first to review!</div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>You might also like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {related.map(l => (
              <div key={l.id} onClick={() => router.push('/listing/' + l.id)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}>
                {l.primary_image
                  ? <img src={l.primary_image} alt={l.title} style={{ width: '100%', height: 130, objectFit: 'cover' }} />
                  : <div style={{ height: 130, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{l.type === 'product' ? '🛍️' : l.type === 'service' ? '🔧' : l.type === 'job' ? '💼' : '🏠'}</div>
                }
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{l.title}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#E8533A' }}>{l.price_currency} {Number(l.price).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,237,232,0.45)', marginTop: 3 }}>📍 {l.location_text || l.city} · by {l.seller_name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
