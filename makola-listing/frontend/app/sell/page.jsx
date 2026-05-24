// app/sell/page.jsx
"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/auth.service";

// ── Constants ─────────────────────────────────────────────────
const STEPS = ["Type","Details","Pricing","Photos","Location","Extras","Review"];

const CURRENCIES = [
  { code:"GHS", symbol:"GH₵", flag:"🇬🇭" },
  { code:"NGN", symbol:"₦",   flag:"🇳🇬" },
  { code:"KES", symbol:"KSh", flag:"🇰🇪" },
  { code:"USD", symbol:"$",   flag:"🇺🇸" },
  { code:"GBP", symbol:"£",   flag:"🇬🇧" },
];

const TYPES = [
  { id:"product", icon:"🛍️", name:"Product", desc:"Physical or digital goods" },
  { id:"service", icon:"🔧", name:"Service", desc:"Skills, freelance & trades" },
  { id:"job",     icon:"💼", name:"Job",     desc:"Full-time, part-time, remote" },
  { id:"rental",  icon:"🏠", name:"Rental",  desc:"Property, vehicles, equipment" },
];

// ── Hooks ─────────────────────────────────────────────────────
function useListingForm() {
  const [form, setForm] = useState({
    type: "product",
    categoryId: "",
    title: "",
    description: "",
    price: "",
    priceCurrency: "GHS",
    priceType: "fixed",
    isNegotiable: false,
    locationText: "",
    country: "Ghana",
    isRemote: false,
    tags: [],
    condition: "new",
    deliveryAvailable: false,
    images: [],        // File objects
    imageUrls: [],     // Preview URLs
    metadata: {},
  });

  const set = useCallback((key) => (val) => {
    setForm(f => ({ ...f, [key]: typeof val === "function" ? val(f[key]) : val }));
  }, []);

  const addTag = useCallback((tag) => {
    if (!tag.trim()) return;
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) || f.tags.length >= 10 ? f.tags : [...f.tags, tag],
    }));
  }, []);

  const removeTag = useCallback((tag) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  }, []);

  const addImages = useCallback((files) => {
    const newFiles = Array.from(files).slice(0, 8);
    setForm(f => {
      const combined = [...f.images, ...newFiles].slice(0, 8);
      const urls = combined.map(file =>
        typeof file === "string" ? file : URL.createObjectURL(file)
      );
      return { ...f, images: combined, imageUrls: urls };
    });
  }, []);

  const removeImage = useCallback((idx) => {
    setForm(f => {
      const images = f.images.filter((_, i) => i !== idx);
      const imageUrls = f.imageUrls.filter((_, i) => i !== idx);
      return { ...f, images, imageUrls };
    });
  }, []);

  return { form, set, addTag, removeTag, addImages, removeImage };
}

// ── Sub-components ────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.55)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:7 }}>
      {children}{required && <span style={{ color:"#E8533A" }}> *</span>}
    </label>
  );
}

function Input({ ...props }) {
  return (
    <input style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"12px 14px", color:"#F0EDE8", fontSize:14, outline:"none", fontFamily:"inherit" }} {...props} />
  );
}

function Textarea({ ...props }) {
  return (
    <textarea style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"12px 14px", color:"#F0EDE8", fontSize:14, outline:"none", resize:"vertical", minHeight:120, lineHeight:1.65, fontFamily:"inherit" }} {...props} />
  );
}

function Select({ children, ...props }) {
  return (
    <select style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"12px 14px", color:"#F0EDE8", fontSize:14, outline:"none", cursor:"pointer", fontFamily:"inherit" }} {...props}>
      {children}
    </select>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div onClick={() => onChange(!value)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
      <div style={{ width:40, height:22, borderRadius:11, background:value?"#2D9E6B":"rgba(255,255,255,0.12)", position:"relative", transition:"background .2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:3, left:value?21:3, width:16, height:16, borderRadius:8, background:"#fff", transition:"left .2s" }} />
      </div>
      <span style={{ fontSize:13, fontWeight:600, color:value?"#F0EDE8":"rgba(240,237,232,0.55)" }}>{label}</span>
    </div>
  );
}

// ── Step components ───────────────────────────────────────────
function StepType({ form, set }) {
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:8 }}>What are you listing?</div>
      <p style={{ fontSize:13.5, color:"rgba(240,237,232,0.55)", marginBottom:24, lineHeight:1.6 }}>Choose the type that best describes your listing.</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
        {TYPES.map(t => (
          <button key={t.id} type="button" onClick={() => set("type")(t.id)}
            style={{ background:form.type===t.id?"rgba(232,83,58,0.08)":"rgba(255,255,255,0.04)", border:`1.5px solid ${form.type===t.id?"#E8533A":"rgba(255,255,255,0.08)"}`, borderRadius:13, padding:"18px 14px", cursor:"pointer", textAlign:"center", transition:"all .15s" }}>
            <span style={{ fontSize:32, display:"block", marginBottom:10 }}>{t.icon}</span>
            <span style={{ fontSize:14, fontWeight:800, color:"#F0EDE8", display:"block" }}>{t.name}</span>
            <span style={{ fontSize:12, color:"rgba(240,237,232,0.5)", marginTop:5, display:"block" }}>{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDetails({ form, set, addTag, removeTag }) {
  const [tagInput, setTagInput] = useState("");
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:8 }}>Listing details</div>
      <p style={{ fontSize:13.5, color:"rgba(240,237,232,0.55)", marginBottom:24, lineHeight:1.6 }}>A clear title and detailed description builds buyer trust and gets more views.</p>
      <div style={{ marginBottom:20 }}>
        <FieldLabel required>Title</FieldLabel>
        <Input placeholder="e.g. iPhone 15 Pro Max 256GB — Brand New, All Colours" value={form.title} onChange={e => set("title")(e.target.value)} maxLength={200} />
        <div style={{ fontSize:11, color:"rgba(240,237,232,0.28)", marginTop:5, textAlign:"right" }}>{form.title.length}/200</div>
      </div>
      <div style={{ marginBottom:20 }}>
        <FieldLabel required>Description</FieldLabel>
        <Textarea placeholder="Describe your listing in detail — condition, specifications, what's included, delivery options..." value={form.description} onChange={e => set("description")(e.target.value)} maxLength={5000} rows={7} />
        <div style={{ fontSize:11, color:"rgba(240,237,232,0.28)", marginTop:5, display:"flex", justifyContent:"space-between" }}>
          <span>~{Math.round(form.description.split(/\s+/).filter(Boolean).length)} words (aim for 100+)</span>
          <span>{form.description.length}/5000</span>
        </div>
      </div>
      <div style={{ marginBottom:20 }}>
        <FieldLabel>Tags</FieldLabel>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, padding:"10px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, minHeight:48 }}>
          {form.tags.map(tag => (
            <div key={tag} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(232,83,58,0.1)", border:"1px solid rgba(232,83,58,0.25)", borderRadius:16, padding:"3px 10px", fontSize:12, fontWeight:700, color:"#E8533A" }}>
              {tag}
              <button type="button" onClick={() => removeTag(tag)} style={{ background:"none", border:"none", color:"rgba(232,83,58,0.6)", cursor:"pointer", fontSize:14, lineHeight:1, padding:0 }}>×</button>
            </div>
          ))}
          <input value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if((e.key==="Enter"||e.key===",") && tagInput.trim()){e.preventDefault();addTag(tagInput.trim().replace(/,/g,""));setTagInput("");} }}
            placeholder={form.tags.length ? "" : "Add tags (press Enter)..."}
            style={{ background:"none", border:"none", outline:"none", color:"#F0EDE8", fontSize:13.5, minWidth:80, flex:1, fontFamily:"inherit" }} />
        </div>
        <div style={{ fontSize:11.5, color:"rgba(240,237,232,0.28)", marginTop:5 }}>Tags help buyers find your listing. Add 3–8 relevant tags (brand, colour, condition...).</div>
      </div>
    </div>
  );
}

function StepPricing({ form, set }) {
  const curr = CURRENCIES.find(c => c.code === form.priceCurrency) || CURRENCIES[0];
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:8 }}>Set your price</div>
      <p style={{ fontSize:13.5, color:"rgba(240,237,232,0.55)", marginBottom:24, lineHeight:1.6 }}>Research similar listings to set a competitive price. You can always adjust later.</p>

      <div style={{ marginBottom:20 }}>
        <FieldLabel>Price type</FieldLabel>
        <div style={{ display:"flex", gap:6 }}>
          {[["fixed","Fixed price"],["range","Price range"],["free","Free / Contact"]].map(([v,l]) => (
            <button key={v} type="button" onClick={() => set("priceType")(v)}
              style={{ background:form.priceType===v?"rgba(232,83,58,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${form.priceType===v?"rgba(232,83,58,0.3)":"rgba(255,255,255,0.08)"}`, color:form.priceType===v?"#E8533A":"rgba(240,237,232,0.55)", borderRadius:8, padding:"7px 14px", fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {form.priceType !== "free" && (
        <>
          <div style={{ marginBottom:20 }}>
            <FieldLabel required>Currency & price</FieldLabel>
            <div style={{ display:"flex", gap:10 }}>
              <Select value={form.priceCurrency} onChange={e => set("priceCurrency")(e.target.value)} style={{ width:100 }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </Select>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e => set("price")(e.target.value)} style={{ flex:1 }} />
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <Toggle value={form.isNegotiable} onChange={set("isNegotiable")} label="Price is negotiable" />
          </div>
          {form.price && (
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"14px 16px", fontSize:13, color:"rgba(240,237,232,0.65)", lineHeight:1.65 }}>
              Buyer pays: <strong style={{ color:"#E8533A" }}>{curr.symbol} {(parseFloat(form.price)*1.03).toFixed(2)}</strong> (incl. 3% platform fee) ·
              You receive: <strong style={{ color:"#2D9E6B" }}>{curr.symbol} {(parseFloat(form.price)*0.97).toFixed(2)}</strong>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StepPhotos({ form, addImages, removeImage }) {
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:8 }}>Photos</div>
      <p style={{ fontSize:13.5, color:"rgba(240,237,232,0.55)", marginBottom:24, lineHeight:1.6 }}>Upload up to 8 photos. Listings with 5+ photos get 4× more views. First photo is your main image.</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
        {Array.from({length:8}, (_, i) => (
          <div key={i} onClick={() => !form.imageUrls[i] && document.getElementById("file-input").click()}
            style={{ aspectRatio:"1", background:"rgba(255,255,255,0.04)", border:`2px dashed ${i===0&&!form.imageUrls[0]?"rgba(232,83,58,0.4)":form.imageUrls[i]?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.08)"}`, borderStyle:form.imageUrls[i]?"solid":"dashed", borderRadius:12, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:form.imageUrls[i]?"default":"pointer", position:"relative", overflow:"hidden", transition:"all .2s" }}>
            {form.imageUrls[i] ? (
              <>
                <img src={form.imageUrls[i]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                <button type="button" onClick={e => {e.stopPropagation();removeImage(i);}}
                  style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,0.6)", border:"none", borderRadius:6, width:24, height:24, color:"#fff", fontSize:13, cursor:"pointer" }}>×</button>
                {i===0 && <div style={{ position:"absolute", bottom:6, left:6, background:"#E8533A", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:4 }}>MAIN</div>}
              </>
            ) : (
              <>
                <span style={{ fontSize:i===0?24:20, marginBottom:5, color:"rgba(240,237,232,0.28)" }}>{i===0?"📸":"+"}</span>
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(240,237,232,0.28)" }}>{i===0?"Add main photo":"Photo"}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <input id="file-input" type="file" accept="image/*" multiple hidden onChange={e => { addImages(e.target.files); e.target.value=""; }} />

      <button type="button" onClick={() => document.getElementById("file-input").click()}
        style={{ width:"100%", background:"none", border:"1px dashed rgba(255,255,255,0.15)", color:"rgba(240,237,232,0.5)", borderRadius:11, padding:"12px", fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
        📁 Browse photos ({form.images.length}/8 uploaded)
      </button>

      <div style={{ marginTop:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:"12px 14px", fontSize:12.5, color:"rgba(240,237,232,0.55)", lineHeight:1.65 }}>
        <strong style={{ color:"#F0EDE8" }}>Photo tips:</strong> Good lighting · Multiple angles · Close-ups of any defects · JPG/PNG/WebP, max 10MB each
      </div>
    </div>
  );
}

function StepLocation({ form, set }) {
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:8 }}>Location</div>
      <p style={{ fontSize:13.5, color:"rgba(240,237,232,0.55)", marginBottom:24, lineHeight:1.6 }}>Buyers search by location. Be as specific as possible to reach nearby buyers.</p>
      <div style={{ marginBottom:16 }}>
        <FieldLabel required>Country</FieldLabel>
        <Select value={form.country} onChange={e => set("country")(e.target.value)}>
          {["Ghana","Nigeria","Kenya","South Africa","United Kingdom","United States","Canada"].map(c => <option key={c}>{c}</option>)}
        </Select>
      </div>
      <div style={{ marginBottom:16 }}>
        <FieldLabel required>City / Area</FieldLabel>
        <Input placeholder="e.g. East Legon, Accra" value={form.locationText} onChange={e => set("locationText")(e.target.value)} />
      </div>
      {(form.type === "service" || form.type === "job") && (
        <div style={{ marginBottom:16 }}>
          <Toggle value={form.isRemote} onChange={set("isRemote")} label="Available remotely / Worldwide" />
        </div>
      )}
    </div>
  );
}

function StepExtras({ form, set }) {
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:8 }}>Additional details</div>
      <p style={{ fontSize:13.5, color:"rgba(240,237,232,0.55)", marginBottom:24, lineHeight:1.6 }}>More detail builds trust and helps buyers make faster decisions.</p>
      {form.type === "product" && (
        <>
          <div style={{ marginBottom:20 }}>
            <FieldLabel>Condition</FieldLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[["new","✨","Brand new"],["like_new","⭐","Like new"],["good","👍","Good"],["fair","🔧","Fair"],["for_parts","🛠️","For parts"]].map(([v,ic,n]) => (
                <button key={v} type="button" onClick={() => set("condition")(v)}
                  style={{ background:form.condition===v?"rgba(45,158,107,0.08)":"rgba(255,255,255,0.04)", border:`1.5px solid ${form.condition===v?"#2D9E6B":"rgba(255,255,255,0.08)"}`, borderRadius:10, padding:"10px 8px", textAlign:"center", cursor:"pointer", transition:"all .15s" }}>
                  <span style={{ fontSize:18, display:"block", marginBottom:5 }}>{ic}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:form.condition===v?"#2D9E6B":"#F0EDE8" }}>{n}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <Toggle value={form.deliveryAvailable} onChange={set("deliveryAvailable")} label="Delivery available" />
          </div>
        </>
      )}
      {form.type === "job" && (
        <div style={{ marginBottom:20 }}>
          <FieldLabel>Job type</FieldLabel>
          <Select>
            <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Remote</option>
          </Select>
        </div>
      )}
      {form.type === "rental" && (
        <div style={{ marginBottom:20 }}>
          <FieldLabel>Rental period</FieldLabel>
          <Select><option>Per day</option><option>Per week</option><option>Per month</option><option>Per year</option></Select>
        </div>
      )}
    </div>
  );
}

function StepReview({ form }) {
  const curr = CURRENCIES.find(c => c.code === form.priceCurrency) || CURRENCIES[0];
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginBottom:8 }}>Review & publish</div>
      <p style={{ fontSize:13.5, color:"rgba(240,237,232,0.55)", marginBottom:24 }}>Check everything looks right before going live.</p>
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:18, marginBottom:18 }}>
        <div style={{ fontSize:16, fontWeight:900, color:"#F0EDE8", marginBottom:4 }}>{form.title||"No title yet"}</div>
        <div style={{ fontSize:12, color:"rgba(240,237,232,0.5)", marginBottom:14 }}>{form.type} · {form.locationText||form.country}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[["Price",form.price?`${curr.symbol} ${parseFloat(form.price).toLocaleString()}`:"Not set"],["Photos",`${form.images.length} uploaded`],["Tags",`${form.tags.length} tags`],["Location",form.locationText||form.country||"Not set"]].map(([l,v])=>(
            <div key={l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:9, padding:"10px 12px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(240,237,232,0.3)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:13.5, fontWeight:700, color:"#F0EDE8" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize:13, color:"rgba(240,237,232,0.5)", lineHeight:1.65 }}>
        By publishing, you agree to Makola Digital's <a href="/terms" style={{ color:"#E8533A", fontWeight:700 }}>Terms of Service</a> and <a href="/guidelines" style={{ color:"#E8533A", fontWeight:700 }}>Seller Guidelines</a>.
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listingId, setListingId] = useState(null);
  const { form, set, addTag, removeTag, addImages, removeImage } = useListingForm();

  const stepProps = { form, set, addTag, removeTag, addImages, removeImage };

  const next = async () => {
    if (step === STEPS.length - 1) {
      await handlePublish();
    } else {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      // Step 1: Create listing draft
      const { data: created } = await api.post("/listings", {
        type: form.type,
        title: form.title,
        description: form.description,
        price: form.priceType !== "free" ? form.price : undefined,
        priceCurrency: form.priceCurrency,
        priceType: form.priceType,
        isNegotiable: form.isNegotiable,
        locationText: form.locationText,
        country: form.country,
        isRemote: form.isRemote,
        tags: form.tags,
        metadata: { condition: form.condition, deliveryAvailable: form.deliveryAvailable },
      });

      const id = created.listing.id;
      setListingId(id);

      // Step 2: Upload images
      if (form.images.length > 0) {
        const fd = new FormData();
        form.images.forEach(img => fd.append("images", img));
        await api.post(`/listings/${id}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Step 3: Publish
      await api.post(`/listings/${id}/publish`);
      router.push(`/dashboard/listings?published=${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Publishing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { maxWidth:720, margin:"0 auto", padding:"32px 20px", fontFamily:"'Plus Jakarta Sans',sans-serif" },
    progress: { display:"flex", gap:6, marginBottom:32 },
    progressBar: (active, done) => ({ flex:1, height:4, borderRadius:2, background:done?"#2D9E6B":active?"#E8533A":"rgba(255,255,255,0.1)", transition:"background .3s" }),
    btns: { display:"flex", gap:10, marginTop:32 },
    nextBtn: { flex:1, background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:14, borderRadius:13, fontSize:15, fontWeight:900, cursor:"pointer", opacity:loading?0.6:1 },
    prevBtn: { background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(240,237,232,0.55)", padding:"12px 24px", borderRadius:13, fontSize:14, fontWeight:700, cursor:"pointer" },
  };

  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh" }}>
      <div style={s.page}>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>Step {step+1} of {STEPS.length} — {STEPS[step]}</div>
        </div>
        <div style={s.progress}>
          {STEPS.map((_, i) => <div key={i} style={s.progressBar(i===step, i<step)} />)}
        </div>

        {step === 0 && <StepType {...stepProps} />}
        {step === 1 && <StepDetails {...stepProps} />}
        {step === 2 && <StepPricing {...stepProps} />}
        {step === 3 && <StepPhotos {...stepProps} />}
        {step === 4 && <StepLocation {...stepProps} />}
        {step === 5 && <StepExtras {...stepProps} />}
        {step === 6 && <StepReview {...stepProps} />}

        <div style={s.btns}>
          {step > 0 && <button style={s.prevBtn} onClick={() => setStep(s => s-1)}>← Back</button>}
          <button style={{ ...s.nextBtn, background:step===STEPS.length-1?"linear-gradient(135deg,#2D9E6B,#3B7DD8)":"linear-gradient(135deg,#E8533A,#C47F17)" }}
            onClick={next} disabled={loading}>
            {loading ? "Publishing..." : step === STEPS.length-1 ? "🚀 Publish listing" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
