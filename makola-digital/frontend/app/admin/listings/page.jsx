"use client";
import { useState, useEffect } from "react";
const API = process.env.NEXT_PUBLIC_API_URL;
export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(API + "/listings?status=" + filter + "&limit=50");
      const data = await res.json();
      setListings(data.listings || []);
    } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { fetchListings(); }, [filter]);
  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("makola_token");
    await fetch(API + "/listings/" + id + "/status", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ status }) });
    fetchListings();
  };
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", padding: 28, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>📦 Listings Management</h1>
        <a href="/admin/dashboard" style={{ color: "#E8533A" }}>← Dashboard</a>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["pending","active","flagged","rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ background: filter===s?"#E8533A":"rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 16px", borderRadius: 8, cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
        ))}
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 48 }}>Loading...</div> :
       listings.length === 0 ? <div style={{ textAlign: "center", padding: 48, color: "rgba(240,237,232,0.4)" }}>No {filter} listings</div> :
       <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
         {listings.map(l => (
           <div key={l.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
             <div>
               <div style={{ fontWeight: 700 }}>{l.title}</div>
               <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>{l.type} · {l.price_currency} {Number(l.price).toLocaleString()} · by {l.seller_name}</div>
               <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>📍 {l.location_text||l.city} · {new Date(l.created_at).toLocaleDateString()}</div>
             </div>
             {filter==="pending" && <div style={{ display: "flex", gap: 8 }}>
               <button onClick={() => updateStatus(l.id,"active")} style={{ background: "#2D9E6B", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>✅ Approve</button>
               <button onClick={() => updateStatus(l.id,"rejected")} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>❌ Reject</button>
             </div>}
           </div>
         ))}
       </div>}
    </div>
  );
}