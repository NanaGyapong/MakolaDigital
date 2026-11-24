"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

async function getValidToken() {
  let token = localStorage.getItem("makola_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      const refreshToken = localStorage.getItem("makola_refresh");
      if (!refreshToken) return null;
      const res = await fetch(API + "/auth/refresh", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) { localStorage.removeItem("makola_token"); return null; }
      const data = await res.json();
      localStorage.setItem("makola_token", data.accessToken);
      if (data.refreshToken) localStorage.setItem("makola_refresh", data.refreshToken);
      return data.accessToken;
    }
    return token;
  } catch { return token; }
}

const FOOD_CATEGORIES = [
  { emoji: "🍚", label: "Cooked Food", value: "Food & Beverages" },
  { emoji: "🍰", label: "Pastries & Cakes", value: "Food & Beverages" },
  { emoji: "🥤", label: "Drinks & Juices", value: "Food & Beverages" },
  { emoji: "🫙", label: "Groceries & Ingredients", value: "Food & Agriculture" },
  { emoji: "🍺", label: "Alcoholic Drinks", value: "Food & Beverages" },
  { emoji: "🥗", label: "Snacks & Light Bites", value: "Food & Beverages" },
  { emoji: "🌾", label: "Fresh Farm Produce", value: "Food & Agriculture" },
  { emoji: "🍳", label: "Catering / Events", value: "Food & Beverages" },
];

const DELIVERY_OPTIONS = [
  { emoji: "🏃", label: "Pickup only", value: "pickup" },
  { emoji: "🛵", label: "I deliver", value: "delivery" },
  { emoji: "📱", label: "WhatsApp order", value: "whatsapp" },
  { emoji: "🏪", label: "Dine-in / Visit", value: "dinein" },
];

const GHANA_CITIES = ["Accra","Kumasi","Tema","Takoradi","Cape Coast","Tamale","Sunyani","Koforidua","Ho","Bolgatanga","Kasoa","Madina","Spintex","East Legon","Osu","Dansoman","Achimota","Dome","Ashaiman"];

const inp = { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, padding:"13px 16px", color:"#F0EDE8", fontSize:14, fontFamily:"sans-serif", boxSizing:"border-box", outline:"none" };
const lbl = { fontSize:12, fontWeight:600, color:"rgba(240,237,232,0.5)", marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:"0.05em" };

const STEPS = ["Category","Details","Pricing & Location","Photos"];

export default function SellFoodPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [done, setDone] = useState(false);
  const [listingId, setListingId] = useState(null);
  const [form, setForm] = useState({
    category: null, deliveryOptions: [], title: "", description: "",
    price: "", currency: "GHS", isNegotiable: false, minOrder: "",
    city: "", locationText: "", phone: "", showWhatsapp: true,
    availableFrom: "", availableTo: "", portionSize: "",
  });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setE = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    if (!token) router.replace("/auth/login?redirect=/sell/food");
  }, []);

  const canNext = () => {
    if (step === 0) return !!form.category && form.deliveryOptions.length > 0;
    if (step === 1) return form.title.trim().length >= 3 && form.description.trim().length >= 10;
    if (step === 2) return form.price && Number(form.price) >= 0 && form.city;
    return true;
  };

  const handleImages = async (files) => {
    const arr = Array.from(files).slice(0, 5);
    setPreviewImages(arr.map((f) => URL.createObjectURL(f)));
    setUploadingImages(true);
    const token = await getValidToken();
    const urls = [];
    for (const file of arr) {
      const fd = new FormData();
      fd.append("image", file);
      try {
        const res = await fetch(`${API}/upload/image`, { method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd });
        const data = await res.json();
        if (data.url) urls.push(data.url);
      } catch {}
    }
    setUploadedUrls(urls);
    setUploadingImages(false);
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    const token = await getValidToken();
    if (!token) { router.replace("/auth/login?redirect=/sell/food"); return; }
    const deliveryNote = form.deliveryOptions.map(d => DELIVERY_OPTIONS.find(o => o.value === d)?.label).join(", ");
    const descFull = [
      form.description,
      form.portionSize ? `\n\n📦 Portion size: ${form.portionSize}` : "",
      form.minOrder ? `\n🛒 Minimum order: ${form.minOrder}` : "",
      form.availableFrom && form.availableTo ? `\n⏰ Available: ${form.availableFrom} – ${form.availableTo}` : "",
      `\n\n🚚 Order method: ${deliveryNote}`,
    ].join("").trim();
    const payload = {
      type: "product", title: form.title, description: descFull,
      price: parseFloat(form.price) || 0, price_currency: form.currency,
      is_negotiable: form.isNegotiable, category: form.category.value,
      country: "Ghana", city: form.city,
      location_text: form.locationText || form.city,
      contact_phone: form.phone, show_whatsapp: form.showWhatsapp,
      images: uploadedUrls, status: "active",
    };
    try {
      const res = await fetch(`${API}/listings`, {
        method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create listing");
      setListingId(data.listing?.id || data.id);
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F0EDE8", fontFamily:"sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px" }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:72, marginBottom:16 }}>🎉</div>
        <h1 style={{ fontSize:26, fontWeight:900, marginBottom:8 }}>You're live!</h1>
        <p style={{ fontSize:14, color:"rgba(240,237,232,0.6)", marginBottom:28 }}>Your food listing is now on Makola Digital. Buyers can find and order from you.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {listingId && <button onClick={() => router.push(`/listing/${listingId}`)} style={{ background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:"14px 24px", borderRadius:12, fontSize:15, fontWeight:900, cursor:"pointer" }}>View my listing →</button>}
          <button onClick={() => { setDone(false); setStep(0); setForm({ category:null, deliveryOptions:[], title:"", description:"", price:"", currency:"GHS", isNegotiable:false, minOrder:"", city:"", locationText:"", phone:"", showWhatsapp:true, availableFrom:"", availableTo:"", portionSize:"" }); setPreviewImages([]); setUploadedUrls([]); }} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"#F0EDE8", padding:"14px 24px", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>+ List another item</button>
          <button onClick={() => router.push("/food")} style={{ background:"none", border:"none", color:"rgba(240,237,232,0.5)", fontSize:13, cursor:"pointer", marginTop:4 }}>Browse food listings</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F0EDE8", fontFamily:"sans-serif", paddingBottom:100 }}>
      <nav style={{ background:"#0D0D0D", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.07)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#E8533A,#C47F17)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🌍</div>
          <span style={{ fontWeight:700, fontSize:16 }}>Makola<span style={{ color:"#E8533A" }}>Digital</span></span>
        </div>
        <button onClick={() => router.push("/sell")} style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(240,237,232,0.6)", padding:"6px 12px", borderRadius:8, fontSize:12, cursor:"pointer" }}>General listing</button>
      </nav>

      <div style={{ background:"linear-gradient(135deg,#E8533A,#C47F17)", padding:"20px 16px 24px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Food Vendor Onboarding</div>
        <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:4 }}>List your food 🍛</h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Reach thousands of hungry buyers across Ghana — it's free</p>
      </div>

      <div style={{ background:"#0D0D0D", padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0, background: i < step ? "#2D9E6B" : i === step ? "linear-gradient(135deg,#E8533A,#C47F17)" : "rgba(255,255,255,0.08)", color: i <= step ? "#fff" : "rgba(240,237,232,0.4)" }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{ fontSize:11, fontWeight: i === step ? 700 : 400, color: i === step ? "#F0EDE8" : "rgba(240,237,232,0.4)", whiteSpace:"nowrap" }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ flex:1, height:1, background: i < step ? "rgba(45,158,107,0.4)" : "rgba(255,255,255,0.08)", margin:"0 8px" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 16px" }}>

        {step === 0 && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>What are you selling?</h2>
            <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:20 }}>Choose the type of food you offer</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
              {FOOD_CATEGORIES.map((cat) => (
                <button key={cat.label} onClick={() => set("category")(cat)} style={{ background: form.category?.label === cat.label ? "rgba(232,83,58,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${form.category?.label === cat.label ? "rgba(232,83,58,0.6)" : "rgba(255,255,255,0.09)"}`, borderRadius:12, padding:"14px 12px", cursor:"pointer", textAlign:"left", color:"#F0EDE8", transition:"all 0.15s" }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{cat.emoji}</div>
                  <div style={{ fontSize:12, fontWeight:700 }}>{cat.label}</div>
                </button>
              ))}
            </div>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>How do customers order? <span style={{ fontWeight:400, color:"rgba(240,237,232,0.4)" }}>(select all)</span></h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {DELIVERY_OPTIONS.map((opt) => {
                const active = form.deliveryOptions.includes(opt.value);
                return (
                  <button key={opt.value} onClick={() => set("deliveryOptions")(active ? form.deliveryOptions.filter(v => v !== opt.value) : [...form.deliveryOptions, opt.value])} style={{ background: active ? "rgba(45,158,107,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${active ? "rgba(45,158,107,0.5)" : "rgba(255,255,255,0.09)"}`, borderRadius:12, padding:"14px 12px", cursor:"pointer", textAlign:"left", color:"#F0EDE8", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:20 }}>{opt.emoji}</span>
                    <span style={{ fontSize:12, fontWeight:700 }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Describe your food</h2>
            <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:20 }}>Good descriptions get more orders</p>
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Item name *</label>
              <input value={form.title} onChange={setE("title")} placeholder='e.g. "Jollof Rice with Chicken"' style={inp} maxLength={80} />
              <div style={{ fontSize:11, color:"rgba(240,237,232,0.3)", marginTop:4 }}>{form.title.length}/80</div>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Description *</label>
              <textarea value={form.description} onChange={setE("description")} placeholder="Describe what's included, ingredients, spice level, allergens, freshness..." rows={4} style={{ ...inp, resize:"vertical", lineHeight:1.6 }} maxLength={500} />
              <div style={{ fontSize:11, color:"rgba(240,237,232,0.3)", marginTop:4 }}>{form.description.length}/500</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
              <div><label style={lbl}>Portion size</label><input value={form.portionSize} onChange={setE("portionSize")} placeholder='e.g. "Serves 1"' style={inp} /></div>
              <div><label style={lbl}>Min. order</label><input value={form.minOrder} onChange={setE("minOrder")} placeholder='e.g. "2 packs"' style={inp} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div><label style={lbl}>Available from</label><input value={form.availableFrom} onChange={setE("availableFrom")} placeholder="e.g. 7am" style={inp} /></div>
              <div><label style={lbl}>Available until</label><input value={form.availableTo} onChange={setE("availableTo")} placeholder="e.g. 9pm" style={inp} /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Pricing & location</h2>
            <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:20 }}>Where are you and how much do you charge?</p>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:10, marginBottom:18 }}>
              <div><label style={lbl}>Currency</label><select value={form.currency} onChange={setE("currency")} style={{ ...inp, width:"auto", paddingRight:12, appearance:"none", cursor:"pointer" }}>{["GHS","USD","GBP","EUR"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label style={lbl}>Price *</label><input type="number" value={form.price} onChange={setE("price")} placeholder="0.00" style={inp} min="0" /></div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 14px" }}>
              <input type="checkbox" id="neg" checked={form.isNegotiable} onChange={e => set("isNegotiable")(e.target.checked)} style={{ accentColor:"#E8533A", width:16, height:16 }} />
              <label htmlFor="neg" style={{ fontSize:13, color:"rgba(240,237,232,0.7)", cursor:"pointer" }}>Price is negotiable</label>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>City *</label>
              <select value={form.city} onChange={setE("city")} style={{ ...inp, appearance:"none", cursor:"pointer" }}>
                <option value="">Select city</option>
                {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Exact location / area</label>
              <input value={form.locationText} onChange={setE("locationText")} placeholder='e.g. "Near Accra Mall, Tetteh Quarshie"' style={inp} />
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>WhatsApp / phone number</label>
              <input value={form.phone} onChange={setE("phone")} placeholder="e.g. 0244123456" style={inp} type="tel" />
            </div>
            {form.phone && (
              <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(37,211,102,0.07)", border:"1px solid rgba(37,211,102,0.2)", borderRadius:10, padding:"10px 14px" }}>
                <input type="checkbox" id="wa" checked={form.showWhatsapp} onChange={e => set("showWhatsapp")(e.target.checked)} style={{ accentColor:"#25D366", width:16, height:16 }} />
                <label htmlFor="wa" style={{ fontSize:13, color:"rgba(240,237,232,0.7)", cursor:"pointer" }}>Show WhatsApp button on listing</label>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Add photos</h2>
            <p style={{ fontSize:13, color:"rgba(240,237,232,0.5)", marginBottom:20 }}>Listings with photos get 5× more views. Up to 5 photos.</p>
            <div onClick={() => fileInputRef.current?.click()} style={{ border:"2px dashed rgba(232,83,58,0.4)", borderRadius:16, padding:"32px 20px", textAlign:"center", cursor:"pointer", marginBottom:16, background:"rgba(232,83,58,0.04)" }}>
              <div style={{ fontSize:36, marginBottom:8 }}>📸</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#E8533A", marginBottom:4 }}>Tap to add photos</div>
              <div style={{ fontSize:12, color:"rgba(240,237,232,0.4)" }}>JPG, PNG or WEBP · Max 5MB each</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => handleImages(e.target.files)} />
            {uploadingImages && <div style={{ textAlign:"center", padding:16, color:"rgba(240,237,232,0.5)", fontSize:13 }}>⏳ Uploading photos...</div>}
            {previewImages.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, marginBottom:20 }}>
                {previewImages.map((url, i) => (
                  <div key={i} style={{ position:"relative", borderRadius:10, overflow:"hidden", aspectRatio:"1", background:"rgba(255,255,255,0.05)" }}>
                    <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    {i === 0 && <div style={{ position:"absolute", bottom:4, left:4, background:"rgba(0,0,0,0.7)", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:6 }}>COVER</div>}
                    {uploadedUrls[i] && <div style={{ position:"absolute", top:4, right:4, background:"rgba(45,158,107,0.9)", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✓</div>}
                  </div>
                ))}
              </div>
            )}
            {error && <div style={{ background:"rgba(232,83,58,0.12)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"rgba(240,237,232,0.6)", marginBottom:8 }}>📋 Summary</div>
              <div style={{ fontSize:13, color:"rgba(240,237,232,0.8)", lineHeight:1.8 }}>
                <div>🍛 {form.category?.label}</div>
                <div>📌 {form.title}</div>
                <div>💰 {form.currency} {form.price}{form.isNegotiable ? " (negotiable)" : ""}</div>
                <div>📍 {form.locationText || form.city}</div>
                <div>🚚 {form.deliveryOptions.map(d => DELIVERY_OPTIONS.find(o => o.value === d)?.label).join(", ")}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:12, marginTop:28 }}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#F0EDE8", padding:14, borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>← Back</button>}
          {step < STEPS.length - 1
            ? <button onClick={() => { if (canNext()) setStep(s => s + 1); }} disabled={!canNext()} style={{ flex:2, background: canNext() ? "linear-gradient(135deg,#E8533A,#C47F17)" : "rgba(255,255,255,0.08)", border:"none", color: canNext() ? "#fff" : "rgba(240,237,232,0.3)", padding:14, borderRadius:12, fontSize:15, fontWeight:900, cursor: canNext() ? "pointer" : "not-allowed" }}>Continue →</button>
            : <button onClick={handleSubmit} disabled={loading || uploadingImages} style={{ flex:2, background: loading || uploadingImages ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color: loading || uploadingImages ? "rgba(240,237,232,0.3)" : "#fff", padding:14, borderRadius:12, fontSize:15, fontWeight:900, cursor: loading || uploadingImages ? "not-allowed" : "pointer" }}>{loading ? "Publishing..." : uploadingImages ? "Uploading photos..." : "🚀 Publish listing"}</button>
          }
        </div>
      </div>
    </div>
  );
}
