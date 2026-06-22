"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";
const STEPS = ["What & Details", "Photos & Pricing", "Location & Review"];
const TYPES = [
  { icon: "🛍️", label: "Product", val: "product", desc: "Physical or digital goods" },
  { icon: "🔧", label: "Service", val: "service", desc: "Skills & professional services" },
  { icon: "💼", label: "Job", val: "job", desc: "Full-time, part-time, contract" },
  { icon: "🏠", label: "Rental", val: "rental", desc: "Property & vehicle rentals" },
];
const CATEGORIES = {
  product: [
    'Vehicles > Cars', 'Vehicles > Motorbikes & Tricycles', 'Vehicles > Spare Parts', 'Vehicles > Trucks & Machinery',
    'Phones & Tablets > Smartphones', 'Phones & Tablets > Feature Phones', 'Phones & Tablets > Tablets', 'Phones & Tablets > Accessories',
    'Electronics > TVs & Audio', 'Electronics > Computers & Laptops', 'Electronics > Cameras', 'Electronics > Gaming', 'Electronics > Power & Solar',
    'Home & Furniture > Furniture', 'Home & Furniture > Appliances', 'Home & Furniture > Kitchen & Dining', 'Home & Furniture > Decor & Garden', 'Home & Furniture > Tools & DIY',
    'Home & Furniture > Towels & Bedding', 'Home & Furniture > Slippers & Footwear', 'Home & Furniture > Cleaning Supplies', 'Home & Furniture > Storage & Organisation',
    'Fashion > Men Wear', 'Fashion > Women Wear', 'Fashion > Kids & Babies', 'Fashion > Shoes', 'Fashion > Bags & Accessories', 'Fashion > Fabrics',
    'Beauty & Care > Skincare', 'Beauty & Care > Hair', 'Beauty & Care > Makeup', 'Beauty & Care > Fragrances', 'Beauty & Care > Health Supplements',
    'Beauty & Care > Soaps & Body Wash', 'Beauty & Care > Perfumes & Deodorants', 'Beauty & Care > Pomade & Hair Cream', 'Beauty & Care > Lotions & Oils',
    'Food & Agriculture > Fresh Produce', 'Food & Agriculture > Grains & Cereals', 'Food & Agriculture > Processed Foods', 'Food & Agriculture > Farm Equipment', 'Food & Agriculture > Seedlings & Inputs',
    'Animals & Pets > Poultry', 'Animals & Pets > Livestock', 'Animals & Pets > Pets', 'Animals & Pets > Animal Feed',
    'Arts & Crafts > Handmade', 'Arts & Crafts > Wood & Carvings', 'Arts & Crafts > Paintings', 'Arts & Crafts > Cultural Items',
  ],
  service: [
    'Services > Repair & Construction', 'Services > Cleaning', 'Services > Events & Catering', 'Services > Transport & Logistics',
    'Business Services > Accounting & Legal', 'Business Services > Marketing & Branding', 'Business Services > Finance & Insurance',
    'Tech & Digital > Web & App Development', 'Tech & Digital > Graphics & Design', 'Tech & Digital > IT Support',
    'Education & Training > Tutoring', 'Education & Training > Online Courses', 'Education & Training > Skills Training',
    'Home Services > Plumbing', 'Home Services > Electrical', 'Home Services > AC & Appliance Repair', 'Home Services > Salon & Barber',
  ],
  job: [
    'Jobs > Full-time', 'Jobs > Part-time', 'Jobs > Contract', 'Jobs > Internship', 'Jobs > Remote', 'Jobs > Seeking Work / CV',
  ],
  rental: [
    'Property > Apartment for Rent', 'Property > House for Rent', 'Property > Land for Sale', 'Property > House for Sale',
    'Property > Shortlet / Airbnb', 'Property > Office & Commercial', 'Property > Shop for Rent',
  ],
};
const GHANA_REGIONS = ["Greater Accra","Ashanti","Western","Central","Eastern","Northern","Upper East","Upper West","Volta","Brong-Ahafo","Oti","Bono East","Ahafo","Savannah","North East","Western North"];

const CURRENCIES = ["GHS", "NGN", "USD", "GBP", "EUR"];
const COUNTRIES = ["Ghana", "Nigeria", "Kenya", "South Africa", "United Kingdom", "United States"];

const inp = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "13px 16px", color: "#F0EDE8", fontSize: 14, fontFamily: "sans-serif", boxSizing: "border-box", outline: "none" };
const lbl = { fontSize: 12, fontWeight: 600, color: "rgba(240,237,232,0.5)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" };

export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Auto-fill from previous listing
  useEffect(() => {
    const token = localStorage.getItem('makola_token');
    if (!token) return;
    fetch('https://sparkling-charm-production-cb2c.up.railway.app/api/v1/listings/my', {
      headers: { Authorization: 'Bearer ' + token }
    })
    .then(r => r.json())
    .then(data => {
      if (data.listings && data.listings.length > 0) {
        const last = data.listings[0];
        setForm(prev => ({
          ...prev,
          country: last.country || prev.country,
          city: last.city || prev.city,
          locationText: last.location_text || prev.locationText,
          currency: last.price_currency || prev.currency,
          dialCode: last.contact_phone ? last.contact_phone.slice(0, 4) : prev.dialCode,
          phone: last.contact_phone ? last.contact_phone.slice(4) : prev.phone,
          showWhatsapp: last.show_whatsapp || prev.showWhatsapp,
          region: last.region || prev.region,
        }));
      }
    })
    .catch(() => {});
  }, []);
  const [tcAccepted, setTcAccepted] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [video, setVideo] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const videoRef = useRef();
  const fileRef = useRef();

  const [form, setForm] = useState({
    type: "product", category: "", title: "", description: "",
    price: "", currency: "GHS", priceLabel: "", isNegotiable: false,
    country: "Ghana", city: "", region: "", locationText: "", isRemote: false, phone: "", whatsapp: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (files) => {
    if (images.length + files.length > 10) { alert("Maximum 10 photos allowed"); return; }
    setUploading(true);
    let token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }
    // Upload all files in parallel
    const uploads = Array.from(files).map(async (file) => {
      if (file.size > 10 * 1024 * 1024) { alert(file.name + " is too large. Max 10MB per image."); return null; }
      const fd = new FormData();
      fd.append("image", file);
      try {
        const res = await fetch(API + "/upload/image", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd });
        const data = await res.json();
        return data.url || null;
      } catch (e) { return null; }
    });
    const urls = await Promise.all(uploads);
    const valid = urls.filter(Boolean);
    setImages(prev => [...prev, ...valid]);
    setUploading(false);
  };

  const handleVideoUpload = async (file) => {
    if (file.size > 50 * 1024 * 1024) { alert("Video must be under 50MB"); return; }
    setVideoUploading(true);
    const token = localStorage.getItem("makola_token");
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch(API + "/upload/video", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd });
      const data = await res.json();
      if (data.url) setVideo(data.url);
      else alert("Video upload failed");
    } catch (e) { alert("Video upload failed"); }
    setVideoUploading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const { authService } = await import("@/lib/auth.service");
    let token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }
    if (!token) { router.push("/auth/login"); return; }
    try {
      const res = await fetch(`${API}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, images, video }),
      });
      const data = await res.json();
      if (res.ok) { router.push("/dashboard/analytics?listed=true"); }
      else setError(data.message || "Failed to create listing");
    } catch (e) { setError("Network error. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: 28, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push("/")} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(240,237,232,0.4)", textTransform: "uppercase", letterSpacing: "0.07em" }}>STEP {step + 1} OF {STEPS.length} — {STEPS[step].toUpperCase()}</div>
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {STEPS.map((s, i) => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "#E8533A" : "rgba(255,255,255,0.1)" }} />)}
          </div>
        </div>
      </div>

      {step === 0 && <>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>What are you listing?</h2>
        <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 14, marginBottom: 24 }}>Choose the type and describe your listing.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {TYPES.map(t => (
            <div key={t.val} onClick={() => set("type", t.val)} style={{ background: "rgba(255,255,255,0.04)", border: `2px solid ${form.type === t.val ? "#E8533A" : "rgba(255,255,255,0.09)"}`, borderRadius: 14, padding: 20, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <label style={lbl}>Category</label>
        <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inp, marginBottom: 16 }}>
          <option value="">Select category</option>
          {(CATEGORIES[form.type] || []).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={lbl}>Title *</label>
        <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. iPhone 14 Pro 256GB" style={{ ...inp, marginBottom: 16 }} />
        <label style={lbl}>Description *</label>
        <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe your listing in detail..." rows={4} style={{ ...inp, resize: "vertical", marginBottom: 16 }} />
      </>}

      {step === 1 && <>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Pricing</h2>
        <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 14, marginBottom: 24 }}>Set your price or leave blank to negotiate.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={lbl}>Currency</label>
            <select value={form.currency} onChange={e => set("currency", e.target.value)} style={inp}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Price</label>
            <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" style={inp} />
          </div>
        </div>
        <label style={lbl}>Price Label (optional)</label>
        <input value={form.priceLabel} onChange={e => set("priceLabel", e.target.value)} placeholder='e.g. "/month", "/hour"' style={{ ...inp, marginBottom: 16 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20 }}>
          <input type="checkbox" checked={form.isNegotiable} onChange={e => set("isNegotiable", e.target.checked)} style={{ width: 18, height: 18, accentColor: "#E8533A" }} />
          <span style={{ fontSize: 14, color: "rgba(240,237,232,0.7)" }}>Price is negotiable</span>
        </label>
        <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>Photos & Video</h2>
        <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 14, marginBottom: 24 }}>Add up to 8 photos. First photo is the cover image.</p>
        <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(232,83,58,0.3)", borderRadius: 14, padding: "32px 20px", textAlign: "center", cursor: "pointer", marginBottom: 16, background: "rgba(232,83,58,0.03)" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{uploading ? "Uploading..." : "Click to upload photos"}</div>
          <div style={{ fontSize: 12, color: "rgba(240,237,232,0.4)" }}>JPG, PNG, WebP up to 10MB each</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleImageUpload(Array.from(e.target.files))} />
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(240,237,232,0.7)", marginBottom: 8 }}>🎥 Product Video (optional · max 10 seconds · 50MB)</div>
          <div onClick={() => videoRef.current?.click()} style={{ border: "2px dashed rgba(45,158,107,0.3)", borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", background: "rgba(45,158,107,0.03)" }}>
            {videoUploading ? <div style={{ color: "#2D9E6B", fontWeight: 700 }}>⏳ Uploading video...</div> : video ? <div style={{ color: "#2D9E6B", fontWeight: 700 }}>✅ Video uploaded! Click to replace.</div> : <div><div style={{ fontSize: 28, marginBottom: 6 }}>🎥</div><div style={{ fontSize: 13, fontWeight: 600 }}>Click to upload a short product video</div><div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", marginTop: 4 }}>MP4, MOV · Max 10 seconds · 50MB</div></div>}
          </div>
          <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handleVideoUpload(e.target.files[0])} />
          {video && <video src={video} controls style={{ width: "100%", borderRadius: 10, marginTop: 10, maxHeight: 200 }} />}
        </div>
        {images.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {images.map((url, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: i === 0 ? "2px solid #E8533A" : "1px solid rgba(255,255,255,0.1)" }}>
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {i === 0 && <div style={{ position: "absolute", bottom: 4, left: 4, background: "#E8533A", borderRadius: 4, fontSize: 9, padding: "2px 6px", fontWeight: 700 }}>COVER</div>}
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 12 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </>}

      {step === 2 && <>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Location</h2>
        <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 14, marginBottom: 24 }}>Where is this listing based?</p>
        <label style={lbl}>Country *</label>
        <select value={form.country} onChange={e => set("country", e.target.value)} style={{ ...inp, marginBottom: 16 }}>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {form.country === 'Ghana' && (
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Region</label>
            <select value={form.region || ''} onChange={e => set('region', e.target.value)} style={{ ...inp }}>
              <option value=''>Select region</option>
              {GHANA_REGIONS.map(r => <option key={r} value={r}>{r} Region</option>)}
            </select>
          </div>
        )}
        <label style={lbl}>City / Town</label>
        <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Accra, Lagos, Nairobi" style={{ ...inp, marginBottom: 16 }} />
        <label style={lbl}>Location details</label>
        <input value={form.locationText} onChange={e => set("locationText", e.target.value)} placeholder="e.g. East Legon, Accra" style={{ ...inp, marginBottom: 16 }} />
        <label style={lbl}>Contact Phone Number</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <select value={form.dialCode || '+233'} onChange={e => set('dialCode', e.target.value)} style={{ ...inp, width: 110 }}>
            {['+233','+234','+254','+27','+44','+1'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder='024 000 0000' style={{ ...inp, flex: 1 }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
          <input type='checkbox' checked={form.showWhatsapp || false} onChange={e => set('showWhatsapp', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#25D366' }} />
          <span style={{ fontSize: 14, color: 'rgba(240,237,232,0.7)' }}>📱 Also show WhatsApp button</span>
        </label>

        {(form.type === 'service' || form.type === 'job') && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 16 }}>
            <input type="checkbox" checked={form.isRemote} onChange={e => set("isRemote", e.target.checked)} style={{ width: 18, height: 18, accentColor: "#E8533A" }} />
            <span style={{ fontSize: 14, color: "rgba(240,237,232,0.7)" }}>Available remotely / worldwide</span>
          </label>
        )}
        <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 10, marginTop: 8 }}>Preview</h2>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
          {images[0] && <img src={images[0]} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />}
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", marginBottom: 4 }}>{form.type?.toUpperCase()} · {form.category}</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{form.title || "No title"}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#E8533A", marginBottom: 6 }}>{form.price ? `${form.currency} ${Number(form.price).toLocaleString()}` : "Price on request"}{form.isNegotiable && " · Negotiable"}</div>
            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)" }}>📍 {form.locationText || form.city || form.country}</div>
          </div>
        </div>
        {error && <div style={{ background: "rgba(232,83,58,0.1)", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 10, padding: 14, color: "#E8533A", fontSize: 14, marginBottom: 16 }}>{error}</div>}
      </>}

      {step === 2 && false && <>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Review & publish</h2>
        <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 14, marginBottom: 24 }}>Check your listing before going live.</p>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
          {images[0] && <img src={images[0]} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />}
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", marginBottom: 4 }}>{form.type.toUpperCase()} · {form.category}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{form.title || "No title"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#E8533A", marginBottom: 8 }}>
              {form.price ? `${form.currency} ${Number(form.price).toLocaleString()}${form.priceLabel}` : "Price on request"}
              {form.isNegotiable && " · Negotiable"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.5)", marginBottom: 12 }}>📍 {form.locationText || form.city || form.country}</div>
            <div style={{ fontSize: 13, color: "rgba(240,237,232,0.6)", lineHeight: 1.6 }}>{form.description?.slice(0, 150)}{form.description?.length > 150 ? "..." : ""}</div>
          </div>
        </div>
        {error && <div style={{ background: "rgba(232,83,58,0.1)", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 10, padding: 14, color: "#E8533A", fontSize: 14, marginBottom: 16 }}>{error}</div>}
      </>}

      <button onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : handleSubmit()} disabled={loading || uploading} style={{ width: "100%", background: loading ? "rgba(232,83,58,0.5)" : "linear-gradient(135deg,#E8533A,#C47F17)", border: "none", color: "#fff", padding: 15, borderRadius: 13, fontSize: 15, fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", fontFamily: "sans-serif", marginTop: 20 }}>
        {loading ? "Publishing..." : step === STEPS.length - 1 ? "🚀 Publish Listing" : "Continue →"}
      </button>
    </div>
  );
}
