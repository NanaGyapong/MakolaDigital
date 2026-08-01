"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

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
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
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

  const handleReport = async () => {
    const token = localStorage.getItem('makola_token');
    if (!token) { router.push('/auth/login'); return; }
    if (!reportReason.trim()) return;
    try {
      await fetch(`${API}/listings/${id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reportReason })
      });
      setReportSent(true);
      setShowReport(false);
      setReportReason("");
    } catch(e) { console.error(e); }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('makola_token');
    if (!token) { router.push('/auth/login'); return; }
    setSaveLoading(true);
    try {
      if (saved) {
        await fetch(`${API}/listings/${id}/save`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        setSaved(false);
      } else {
        await fetch(`${API}/listings/${id}/save`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        setSaved(true);
      }
    } catch(e) { console.error(e); }
    setSaveLoading(false);
  };

  const handleSend = async () => {
    const token = localStorage.getItem('makola_token');
    if (!token) { router.push('/auth/login'); return; }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          listingId: id,
          receiverId: listing.seller_id,
          body: tab === 'offer' ? 'Offer: ' + offer + ' ' + listing.price_currency + (message ? ' - ' + message : '') : message,
          offerAmount: tab === 'offer' ? offer : null,
          type: tab
        })
      });
      setChatMessages(prev => [...prev, { 
        body: tab === 'offer' ? 'Offer: ' + offer + ' ' + listing.price_currency + (message ? ' - ' + message : '') : message,
        type: tab,
        time: new Date(),
        isMe: true
      }]);
      setChatOpen(true);
      setSent(false);
      setMessage('');
      setOffer('');
    } catch (e) { console.error(e); }
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
            {listing.video && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(240,237,232,0.5)", marginBottom: 6 }}>🎥 PRODUCT VIDEO</div>
                <video src={listing.video} controls style={{ width: "100%", borderRadius: 10, maxHeight: 240, background: "#000" }} />
              </div>
            )}
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
              {listing.is_sold_out ? <span style={{ background: 'rgba(232,83,58,0.15)', border: '1px solid rgba(232,83,58,0.4)', color: '#E8533A', padding: '4px 12px', borderRadius: 6, fontSize: 14, fontWeight: 700 }}>SOLD OUT</span> : listing.type === "job" && (!listing.price || Number(listing.price) === 0) ? "Competitive salary" : listing.price_currency + " " + Number(listing.price).toLocaleString()}
              {listing.price_label && <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(240,237,232,0.5)" }}> {listing.price_label}</span>}
            </div>
            {listing.is_negotiable && <div style={{ fontSize: 12, color: "#2D9E6B", marginBottom: 12 }}>✓ Open to offers</div>}

            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.6)", marginBottom: 12 }}>📍 {listing.location_text || listing.city || listing.country}</div>

            <div style={{ fontSize: 14, color: "rgba(240,237,232,0.7)", lineHeight: 1.7, marginBottom: 20, padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
              {listing.description.split('**Apply here:**').map((part, i) => 
    i === 0 ? part : 
    <span key={i}><a href={part.trim()} target='_blank' rel='noopener noreferrer' style={{ display:'inline-block', background:'#E8533A', color:'#fff', padding:'8px 18px', borderRadius:8, textDecoration:'none', fontWeight:700, fontSize:13, marginTop:12 }}>Apply Now →</a></span>
  )}
            </div>

            {/* Seller */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{listing.type === "job" && listing.title.includes(" — ") ? listing.title.split(" — ").pop() : listing.seller_name}</div>
                <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>{listing.type === "job" ? "Hiring company · Makola Digital" : "Verified seller · Makola Digital"}</div>
              <button onClick={() => router.push("/seller/" + listing.seller_id)} style={{ background: "none", border: "none", color: "#E8533A", fontSize: 12, cursor: "pointer", padding: 0, marginTop: 4, textDecoration: "underline" }}>View all listings →</button>
              </div>
            </div>
            {/* WhatsApp Button */}
            {listing.contact_phone && listing.show_whatsapp && <a href={"https://wa.me/" + listing.contact_phone.replace(/[^0-9]/g, "") + "?text=" + encodeURIComponent("Hi, I saw your listing on Makola Digital: " + listing.title)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", color: "#25D366", padding: "12px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 14, marginBottom: 12 }}><span>📱</span> Chat on WhatsApp</a>}
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
                {chatMessages.length > 0 ? (
                  <div>
                    <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {chatMessages.map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: m.isMe ? "flex-end" : "flex-start" }}>
                          <div style={{ maxWidth: "80%", background: m.isMe ? "rgba(232,83,58,0.15)" : "rgba(255,255,255,0.06)", border: "1px solid " + (m.isMe ? "rgba(232,83,58,0.3)" : "rgba(255,255,255,0.09)"), borderRadius: 10, padding: "8px 12px" }}>
                            {m.type === "offer" && <div style={{ fontSize: 10, fontWeight: 700, color: "#2D9E6B", marginBottom: 2 }}>💰 OFFER</div>}
                            <div style={{ fontSize: 13 }}>{m.body}</div>
                            <div style={{ fontSize: 10, color: "rgba(240,237,232,0.4)", marginTop: 4 }}>{m.time.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#2D9E6B", marginBottom: 8 }}>✅ Sent! Continue the conversation:</div>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your next message..." rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 12px", color: "#F0EDE8", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleSend} disabled={!message.trim()} style={{ flex: 1, background: "#E8533A", border: "none", color: "#fff", padding: "10px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: !message.trim() ? 0.5 : 1 }}>Send →</button>
                      <button onClick={() => router.push("/dashboard/inbox")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>📥 Inbox</button>
                    </div>
                  </div>
                ) : ( (
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
                    <button onClick={handleSend} disabled={tab === "message" ? !message.trim() : false} style={{ width: "100%", marginTop: 10, background: tab === "message" ? "#E8533A" : "#2D9E6B", border: "none", color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: (tab === "message" ? !message.trim() : false) ? 0.5 : 1 }}>
                      {tab === "message" ? "Send Message →" : "Submit Offer →"}
                    </button>
                  </>
                ))}
              </div>
            </div>

            
            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.3)", textAlign: "center" }}>
            <div style={{ marginBottom: 16 }}>
              <button onClick={handleSave} disabled={saveLoading} style={{ width: "100%", background: saved ? "rgba(232,83,58,0.12)" : "rgba(255,255,255,0.05)", border: saved ? "1px solid rgba(232,83,58,0.4)" : "1px solid rgba(255,255,255,0.1)", color: saved ? "#E8533A" : "rgba(240,237,232,0.7)", padding: "11px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                {saved ? "📋 Added to Catalogue ✓" : "📋 Add to Catalogue"}
              </button>
            </div>
            <div style={{ marginBottom: 16 }}>
              {reportSent ? (
                <div style={{ background: "rgba(45,158,107,0.1)", border: "1px solid rgba(45,158,107,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#2D9E6B", textAlign: "center" }}>✅ Report submitted — our team will review this listing</div>
              ) : showReport ? (
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#E8533A" }}>🚩 Report this listing</div>
                  <select value={reportReason} onChange={e => setReportReason(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 12px", color: "#F0EDE8", fontSize: 13, marginBottom: 10, outline: "none" }}>
                    <option value="">Select a reason...</option>
                    <option value="Fake or misleading listing">Fake or misleading listing</option>
                    <option value="Scam or fraud">Scam or fraud</option>
                    <option value="Wrong category">Wrong category</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Already sold">Already sold</option>
                    <option value="Spam">Spam</option>
                    <option value="Other">Other</option>
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleReport} disabled={!reportReason} style={{ flex: 1, background: "#E8533A", border: "none", color: "#fff", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: !reportReason ? 0.5 : 1 }}>Submit Report</button>
                    <button onClick={() => setShowReport(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowReport(true)} style={{ width: "100%", background: "none", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,237,232,0.35)", padding: "8px", borderRadius: 10, cursor: "pointer", fontSize: 11 }}>🚩 Report this listing</button>
              )}
            </div>
            <div style={{ marginBottom: 16 }}><div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 8, fontWeight: 600 }}>SHARE THIS LISTING</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => { const url = window.location.href; const text = listing.title + " - " + listing.price_currency + " " + Number(listing.price).toLocaleString() + " | Makola Digital"; window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank"); }} style={{ flex: 1, background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", color: "#25D366", padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>WhatsApp</button><button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#F0EDE8", padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Copy Link</button>
                <button onClick={() => { const url = window.location.href; window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url), "_blank", "width=600,height=400"); }} style={{ flex: 1, background: "rgba(24,119,242,0.12)", border: "1px solid rgba(24,119,242,0.3)", color: "#1877F2", padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Facebook</button>
                <button onClick={() => { const url = window.location.href; const text = listing.title + " - " + listing.price_currency + " " + Number(listing.price).toLocaleString() + " | Makola Digital"; window.open("https://x.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url), "_blank", "width=600,height=400"); }} style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.12)", color: "#F0EDE8", padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>X</button>
              </div></div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>You might also like</h2>
            <button onClick={() => router.push('/search?type=' + listing.type)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.6)', padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>See all →</button>
          </div>
<div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {related.map(l => (
              <div key={l.id} onClick={() => router.push('/listing/' + l.id)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 180 }}>
                {l.primary_image
                  ? <img src={l.primary_image} alt={l.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  : <div style={{ height: 140, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{l.type === 'product' ? '🛍️' : l.type === 'service' ? '🔧' : l.type === 'job' ? '💼' : '🏠'}</div>
                }
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{l.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#E8533A', marginBottom: 3 }}>{l.price_currency} {Number(l.price).toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: 'rgba(240,237,232,0.4)' }}>📍 {l.location_text || l.city || 'Ghana'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
