"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"];
const WORK_MODES = ["On-site", "Remote", "Hybrid"];
const CATEGORIES = ["Tech Jobs", "Sales & Marketing", "Finance", "Healthcare", "Education", "Engineering", "Operations", "HR", "Legal", "Other"];
const COUNTRIES = ["Ghana", "Nigeria", "Kenya", "South Africa", "United Kingdom", "United States"];

export default function AdminPostJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    company: "",
    category: "Tech Jobs",
    jobType: "Full-time",
    workMode: "On-site",
    country: "Ghana",
    city: "",
    salaryMin: "",
    salaryMax: "",
    currency: "GHS",
    description: "",
    requirements: "",
    applyUrl: "",
    source: "LinkedIn",
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.company || !form.description) {
      setError("Title, company and description are required");
      return;
    }
    setLoading(true);
    setError("");
    const token = localStorage.getItem("makola_token");
    try {
      const description = `${form.description}\n\n${form.requirements ? "**Requirements:**\n" + form.requirements : ""}\n\n${form.applyUrl ? "**Apply here:** " + form.applyUrl : ""}`.trim();
      const res = await fetch(`${API}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: "job",
          category: form.category,
          title: form.title + " — " + form.company,
          description,
          price: form.salaryMin || null,
          currency: form.currency,
          priceLabel: form.salaryMax ? `- ${form.currency} ${form.salaryMax} / month` : "/ month",
          isNegotiable: false,
          country: form.country,
          city: form.city,
          locationText: `${form.city}, ${form.country} (${form.workMode})`,
          isRemote: form.workMode === "Remote",
          images: [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Auto-approve since admin is posting
        await fetch(`${API}/listings/${data.listingId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: "active" }),
        });
        setSuccess(true);
      } else {
        setError(data.message || "Failed to post job");
      }
    } catch (e) { setError("Network error"); }
    setLoading(false);
  };

  const inp = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "11px 14px", color: "#F0EDE8", fontSize: 13.5, outline: "none", boxSizing: "border-box", fontFamily: "sans-serif" };
  const lbl = { display: "block", fontSize: 11, fontWeight: 700, color: "rgba(240,237,232,0.5)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 };

  if (success) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Job Posted Successfully!</h2>
        <p style={{ color: "rgba(240,237,232,0.6)", marginBottom: 24 }}>{form.title} at {form.company} is now live on Makola Digital.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => { setSuccess(false); setForm({ ...form, title: "", company: "", description: "", requirements: "", applyUrl: "" }); }} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Post Another Job</button>
          <button onClick={() => router.push("/admin/listings")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "12px 24px", borderRadius: 10, cursor: "pointer" }}>View Listings</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: 28 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>💼 Post a Job</h1>
            <p style={{ fontSize: 13, color: "rgba(240,237,232,0.5)", margin: 0 }}>Post jobs from LinkedIn or any source directly to Makola Digital</p>
          </div>
          <a href="/admin/dashboard" style={{ color: "#E8533A", fontSize: 13 }}>← Dashboard</a>
        </div>

        {error && <div style={{ background: "rgba(232,83,58,0.1)", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 10, padding: 14, color: "#E8533A", fontSize: 13, marginBottom: 20 }}>⚠️ {error}</div>}

        {/* Source */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, margin: "0 0 16px" }}>📋 Job Source</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Source</label>
              <select value={form.source} onChange={set("source")} style={inp}>
                {["LinkedIn", "Company Website", "Makola Digital", "Other"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Apply URL (optional)</label>
              <input value={form.applyUrl} onChange={set("applyUrl")} placeholder="https://linkedin.com/jobs/..." style={inp} />
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>🏢 Basic Information</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Job Title *</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. Information Systems Business Analyst" style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Company *</label>
            <input value={form.company} onChange={set("company")} placeholder="e.g. Promasidor" style={inp} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Job Type</label>
              <select value={form.jobType} onChange={set("jobType")} style={inp}>
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Work Mode</label>
              <select value={form.workMode} onChange={set("workMode")} style={inp}>
                {WORK_MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Category</label>
            <select value={form.category} onChange={set("category")} style={inp}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Location */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>📍 Location</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Country</label>
              <select value={form.country} onChange={set("country")} style={inp}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>City</label>
              <input value={form.city} onChange={set("city")} placeholder="e.g. Accra" style={inp} />
            </div>
          </div>
        </div>


        {/* Description */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>📝 Job Description *</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>About the role</label>
            <textarea value={form.description} onChange={set("description")} placeholder="Paste the job description from LinkedIn here..." rows={8} style={{ ...inp, resize: "vertical" }} />
          </div>
          <div>
            <label style={lbl}>Requirements & Qualifications</label>
            <textarea value={form.requirements} onChange={set("requirements")} placeholder="List the qualifications and requirements..." rows={5} style={{ ...inp, resize: "vertical" }} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? "rgba(232,83,58,0.5)" : "linear-gradient(135deg,#E8533A,#C47F17)", border: "none", color: "#fff", padding: 15, borderRadius: 13, fontSize: 15, fontWeight: 900, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Publishing..." : "🚀 Publish Job on Makola Digital"}
        </button>

      </div>
    </div>
  );
}
