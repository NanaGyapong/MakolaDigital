"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "${process.env.NEXT_PUBLIC_API_URL}";
const CATEGORIES = {
  product: ['Vehicles > Cars','Vehicles > Motorbikes & Tricycles','Vehicles > Spare Parts','Phones & Tablets > Smartphones','Phones & Tablets > Accessories','Electronics > TVs & Audio','Electronics > Computers & Laptops','Home & Furniture > Furniture','Home & Furniture > Appliances','Fashion > Men Wear','Fashion > Women Wear','Fashion > Kids & Babies','Fashion > Shoes','Beauty & Care > Skincare','Beauty & Care > Hair','Beauty & Care > Makeup','Food & Agriculture > Fresh Produce','Food & Agriculture > Grains & Cereals','Animals & Pets > Poultry','Animals & Pets > Livestock','Arts & Crafts > Handmade'],
  service: ['Services > Repair & Construction','Services > Cleaning','Services > Events & Catering','Tech & Digital > Web & App Development','Tech & Digital > Graphics & Design','Education & Training > Tutoring','Home Services > Plumbing','Home Services > Electrical'],
  job: ['Jobs > Full-time','Jobs > Part-time','Jobs > Contract','Jobs > Internship','Jobs > Remote'],
  rental: ['Property > Apartment for Rent','Property > House for Rent','Property > Land for Sale','Property > House for Sale','Property > Shortlet / Airbnb'],
};
const CURRENCIES = ["GHS","NGN","USD","GBP","EUR"];
const inp = { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, padding:"13px 16px", color:"#F0EDE8", fontSize:14, fontFamily:"sans-serif", boxSizing:"border-box", outline:"none" };
const lbl = { fontSize:12, fontWeight:600, color:"rgba(240,237,232,0.5)", marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:"0.05em" };

export default function EditListing() {
  const router = useRouter();
  const { id } = useParams();
  const fileRef = useRef();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title:"", description:"", price:"", currency:"GHS",
    priceLabel:"", isNegotiable:false, type:"product", category:""
  });

  useEffect(() => {
    const token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }
    fetch(`${API}/listings/${id}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const l = data.listing || data;
        setForm({
          title: l.title || "",
          description: l.description || "",
          price: l.price || "",
          currency: l.price_currency || "GHS",
          priceLabel: l.price_label || "",
          isNegotiable: l.is_negotiable || false,
          type: l.type || "product",
          category: l.category_name || ""
        });
        if (l.images) setImages(l.images.map(img => img.url || img));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleImageUpload = async (files) => {
    setUploading(true);
    const token = localStorage.getItem("makola_token");
    for (const file of files) {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API}/listings/upload-image`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd
      });
      const data = await res.json();
      if (data.url) setImages(prev => [...prev, data.url]);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("makola_token");
    if (!token) { router.push("/auth/login"); return; }
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/listings/${id}`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ ...form, images })
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setTimeout(() => router.push("/dashboard/analytics"), 2000); }
      else setError(data.message || "Failed to update listing");
    } catch(e) { setError("Network error. Please try again."); }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"#F0EDE8", fontFamily:"sans-serif" }}>
      <div style={{ textAlign:"center" }}><div style={{ fontSize:40, marginBottom:16 }}>✏️</div><div>Loading listing...</div></div>
    </div>
  );

  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F0EDE8", fontFamily:"sans-serif", padding:"28px 24px", maxWidth:700, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button onClick={() => router.push("/dashboard/analytics")} style={{ background:"none", border:"none", color:"#E8533A", fontSize:14, cursor:"pointer", padding:0 }}>← Back</button>
        <div>
          <div style={{ fontSize:18, fontWeight:900 }}>Edit Listing</div>
          <div style={{ fontSize:12, color:"rgba(240,237,232,0.4)", marginTop:2 }}>Changes will go to pending review</div>
        </div>
      </div>

      {success && <div style={{ background:"rgba(45,158,107,0.1)", border:"1px solid rgba(45,158,107,0.3)", borderRadius:10, padding:14, color:"#2D9E6B", fontSize:14, marginBottom:16, textAlign:"center", fontWeight:700 }}>✅ Listing updated! Redirecting...</div>}
      {error && <div style={{ background:"rgba(232,83,58,0.1)", border:"1px solid rgba(232,83,58,0.3)", borderRadius:10, padding:14, color:"#E8533A", fontSize:14, marginBottom:16 }}>{error}</div>}

      <div style={{ marginBottom:16 }}>
        <label style={lbl}>Title *</label>
        <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} style={inp} placeholder="e.g. iPhone 14 Pro 256GB" />
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={lbl}>Category</label>
        <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} style={inp}>
          <option value="">Select category</option>
          {(CATEGORIES[form.type]||[]).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={lbl}>Description *</label>
        <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={5} style={{ ...inp, resize:"vertical" }} placeholder="Describe your listing..." />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:12, marginBottom:16 }}>
        <div>
          <label style={lbl}>Currency</label>
          <select value={form.currency} onChange={e => setForm(p=>({...p,currency:e.target.value}))} style={inp}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Price</label>
          <input type="number" value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} placeholder="0.00" style={inp} />
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={lbl}>Price Label (optional)</label>
        <input value={form.priceLabel} onChange={e => setForm(p=>({...p,priceLabel:e.target.value}))} placeholder='e.g. "/month"' style={inp} />
      </div>

      <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:20 }}>
        <input type="checkbox" checked={form.isNegotiable} onChange={e => setForm(p=>({...p,isNegotiable:e.target.checked}))} style={{ width:18, height:18, accentColor:"#E8533A" }} />
        <span style={{ fontSize:14, color:"rgba(240,237,232,0.7)" }}>Price is negotiable</span>
      </label>

      <div style={{ marginBottom:20 }}>
        <label style={lbl}>Photos</label>
        <div onClick={() => fileRef.current?.click()} style={{ border:"2px dashed rgba(232,83,58,0.3)", borderRadius:14, padding:"24px", textAlign:"center", cursor:"pointer", marginBottom:12, background:"rgba(232,83,58,0.03)" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📸</div>
          <div style={{ fontSize:13, fontWeight:600 }}>{uploading ? "Uploading..." : "Click to upload photos"}</div>
          <div style={{ fontSize:11, color:"rgba(240,237,232,0.4)", marginTop:4 }}>First photo is the cover image</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => handleImageUpload(Array.from(e.target.files))} />
        {images.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {images.map((url,i) => (
              <div key={i} style={{ position:"relative", aspectRatio:"1", borderRadius:10, overflow:"hidden", border: i===0 ? "2px solid #E8533A" : "1px solid rgba(255,255,255,0.1)" }}>
                <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                {i===0 && <div style={{ position:"absolute", bottom:4, left:4, background:"#E8533A", borderRadius:4, fontSize:9, padding:"2px 6px", fontWeight:700 }}>COVER</div>}
                {i!==0 && <div onClick={() => setImages(prev => { const arr=[...prev]; arr.splice(i,1); return [url,...arr]; })} style={{ position:"absolute", bottom:4, left:4, background:"rgba(0,0,0,0.7)", borderRadius:4, fontSize:9, padding:"2px 6px", fontWeight:700, cursor:"pointer", color:"#fff" }}>Set cover</div>}
                <button onClick={() => setImages(prev => prev.filter((_,j) => j!==i))} style={{ position:"absolute", top:4, right:4, background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", borderRadius:"50%", width:20, height:20, cursor:"pointer", fontSize:12 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving || uploading} style={{ width:"100%", background: saving ? "rgba(232,83,58,0.5)" : "linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:15, borderRadius:13, fontSize:15, fontWeight:900, cursor: saving ? "not-allowed" : "pointer", fontFamily:"sans-serif" }}>
        {saving ? "Saving..." : "💾 Save Changes"}
      </button>
    </div>
  );
}
