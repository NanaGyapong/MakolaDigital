"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

const CURRENCIES = ["GHS", "NGN", "USD", "GBP", "EUR"];
const COUNTRIES = ["Ghana", "Nigeria", "Kenya", "South Africa", "United Kingdom", "United States"];

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [video, setVideo] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const fileRef = useRef();
  const videoRef = useRef();

  const [form, setForm] = useState({
    title: "", description: "", price: "", currency: "GHS",
    priceLabel: "", isNegotiable: false, country: "Ghana",
    city: "", locationText: "", isRemote: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }

    fetch(`${API}/listings/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.listing) {
          const l = data.listing;
          setForm({
            title: l.title || "",
            description: l.description || "",
            price: l.price || "",
            currency: l.price_currency || "GHS",
            priceLabel: l.price_label || "",
            isNegotiable: l.is_negotiable || false,
            country: l.country === "GH" ? "Ghana" : l.country || "Ghana",
            city: l.city || "",
            locationText: l.location_text || "",
            isRemote: l.is_remote || false,
          });
        }
        if (data.images) setImages(data.images.map(i => i.url));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (files) => {
    setUploading(true);
    const token = localStorage.getItem("makola_token");
    for (const file of files) {
      const fd = new FormData();
      fd.append("image", file);
      try {
        const res = await fetch(`${API}/upload/image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        const data = await res.json();
        if (data.url) setImages(prev => [...prev, data.url]);
      } catch (e) { console.error(e); }
    }
    setUploading(false);
  };

  const handleVideoUpload = async (file) => {
    if (file.size > 20 * 1024 * 1024) { alert("Video must be under 20MB"); return; }
    setVideoUploading(true);
    const token = localStorage.getItem("makola_token");
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch(`${API}/upload/video`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.url) setVideo(data.url);
    } catch (e) { console.error(e); }
    setVideoUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("makola_token");
    try {
      const res = await fetch(`${API}/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, images, video }),
      });
      const data = await res.json();
      if (res.ok) setSuccess(true);
      else setError(data.message || "Failed to save");
    } catch (e) { setError("Network error"); }
    setSaving(false);
  };

  const inp = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "12px 16px", color: "#F0EDE8", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "rgba(240,237,232,0.5)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" };

  if (loading) return <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8", fontFamily: "sans-serif" }}>Loading...</div>;

  if (success) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Listing updated!</h2>
        <p style={{ color: "rgba(240,237,232,0.6)", marginBottom: 24 }}>Your changes have been saved successfully.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => router.push(`/listing/${id}`)} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>View Listing</button>
          <button onClick={() => router.push("/dashboard/analytics")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "12px 24px", borderRadius: 10, cursor: "pointer" }}>Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: 28, maxWidth: 700, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => router.push("/dashboard/analytics")} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14 }}>← Back</button>
        <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>✏️ Edit Listing</h1>
      </div>

      {error && <div style={{ background: "rgba(232,83,58,0.1)", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 10, padding: 14, color: "#E8533A", fontSize: 14, marginBottom: 20 }}>⚠️ {error}</div>}

      {/* Details */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>📝 Listing Details</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Title *</label>
          <input value={form.title} onChange={e => set("title", e.target.value)} style={inp} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Description *</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} style={{ ...inp, resize: "vertical" }} />
        </div>
      </div>

      {/* Pricing */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>💰 Pricing</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Currency</label>
            <select value={form.currency} onChange={e => set("currency", e.target.value)} style={inp}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Price</label>
            <input type="number" value={form.price} onChange={e => set("price", e.target.value)} style={inp} />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={form.isNegotiable} onChange={e => set("isNegotiable", e.target.checked)} style={{ width: 18, height: 18, accentColor: "#E8533A" }} />
          <span style={{ fontSize: 14, color: "rgba(240,237,232,0.7)" }}>Price is negotiable</span>
        </label>
      </div>

      {/* Location */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>📍 Location</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Country</label>
            <select value={form.country} onChange={e => set("country", e.target.value)} style={inp}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>City</label>
            <input value={form.city} onChange={e => set("city", e.target.value)} style={inp} />
          </div>
        </div>
        <div>
          <label style={lbl}>Location details</label>
          <input value={form.locationText} onChange={e => set("locationText", e.target.value)} placeholder="e.g. East Legon, Accra" style={inp} />
        </div>
      </div>

      {/* Photos */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>📸 Photos</h3>
        <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: "24px", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
          <div style={{ fontSize: 13 }}>{uploading ? "Uploading..." : "Click to add more photos"}</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleImageUpload(Array.from(e.target.files))} />
        {images.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {images.map((url, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: i === 0 ? "2px solid #E8533A" : "1px solid rgba(255,255,255,0.1)" }}>
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 12 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>🎥 Product Video (optional, max 10 seconds)</h3>
        <div onClick={() => videoRef.current?.click()} style={{ border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: "24px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.02)" }}>
          {videoUploading ? <div>Uploading video...</div> : video ? <div style={{ color: "#2D9E6B", fontWeight: 700 }}>✅ Video uploaded! Click to replace.</div> : <div><div style={{ fontSize: 28, marginBottom: 6 }}>🎥</div><div style={{ fontSize: 13 }}>Click to upload product video</div><div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", marginTop: 4 }}>MP4, MOV · Max 20MB · 10 seconds</div></div>}
        </div>
        <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handleVideoUpload(e.target.files[0])} />
        {video && <video src={video} controls style={{ width: "100%", borderRadius: 10, marginTop: 12 }} />}
      </div>

      <button onClick={handleSave} disabled={saving} style={{ width: "100%", background: saving ? "rgba(232,83,58,0.5)" : "linear-gradient(135deg,#E8533A,#C47F17)", border: "none", color: "#fff", padding: 15, borderRadius: 13, fontSize: 15, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer" }}>
        {saving ? "Saving..." : "💾 Save Changes"}
      </button>
    </div>
  );
}
