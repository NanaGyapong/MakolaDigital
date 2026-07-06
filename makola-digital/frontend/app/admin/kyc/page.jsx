"use client";
// app/admin/kyc/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("makola_token") : null; }

async function apiCall(path, opts={}) {
  const res = await fetch(API+path, { headers: { "Content-Type":"application/json", Authorization:"Bearer "+getToken(), ...opts.headers }, ...opts });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

const STATUS_COLORS = { pending:"#C47F17", verified:"#2D9E6B", rejected:"#E8533A" };

export default function KycQueuePage() {
  const [apps, setApps] = useState([]);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const d = await apiCall("/kyc/applications?status="+status+(search?"&search="+search:""));
      setApps(d.applications);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status, search]);

  const doAction = async (id, action) => {
    setActionLoading(true);
    try {
      const status = action==="approve" ? "verified" : "rejected";
      await apiCall("/kyc/applications/"+id, { method:"PATCH", body:JSON.stringify({ status }) });
      setToast(action==="approve" ? "✅ Approved!" : "❌ Rejected");
      setSelected(null); setNote(""); load();
      setTimeout(()=>setToast(""),3000);
    } catch (e) { setToast("Error: "+e.message); }
    finally { setActionLoading(false); }
  };

  const s = { background:"#08090A", minHeight:"100vh", color:"#F0EDE8", fontFamily:"'Syne',sans-serif", padding:"24px" };
  const card = { background:"#0E0F11", border:"1px solid rgba(255,255,255,0.07)", borderRadius:13 };
  const inp = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:9, padding:"9px 14px", color:"#F0EDE8", fontSize:13, outline:"none", fontFamily:"inherit" };

  return (
    <div style={s}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:800, letterSpacing:"-.03em" }}>KYC Review Queue</h1>
        <p style={{ fontSize:12, color:"rgba(240,237,232,0.5)", marginTop:3 }}>Identity & business verification applications</p>
      </div>

      {toast && <div style={{ position:"fixed", bottom:24, right:24, background:"#0E0F11", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:"14px 18px", fontWeight:700, zIndex:999, fontSize:13 }}>{toast}</div>}

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, background:"#0E0F11", border:"1px solid rgba(255,255,255,0.07)", borderRadius:11, padding:4, width:"fit-content", marginBottom:18 }}>
        {["pending","verified","rejected"].map(s => (
          <button key={s} onClick={()=>setStatus(s)} style={{ padding:"7px 16px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", background:status===s?"#141618":"none", color:status===s?"#F0EDE8":"rgba(240,237,232,0.45)", cursor:"pointer" }}>
            {s=="pending"?"⏳":s=="verified"?"✅":"❌"} {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <input style={{ ...inp, width:280 }} placeholder="🔍  Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ textAlign:"center", padding:48, color:"rgba(240,237,232,0.4)" }}>Loading...</div>
        ) : apps.length === 0 ? (
          <div style={{ textAlign:"center", padding:48, color:"rgba(240,237,232,0.4)" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>📭</div>
            No {status} applications
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>{["Applicant","Business","ID Type","Submitted","Status","Actions"].map(h=>(
                <th key={h} style={{ fontSize:10, color:"rgba(240,237,232,0.28)", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", padding:"11px 20px", textAlign:"left", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {apps.map(k => (
                <tr key={k.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"13px 20px" }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{k.full_name}</div>
                    <div style={{ fontSize:11, color:"rgba(240,237,232,0.4)", fontFamily:"monospace" }}>{k.email}</div>
                  </td>
                  <td style={{ padding:"13px 20px", fontSize:12.5, fontWeight:600 }}>{k.business_name||"—"}</td>
                  <td style={{ padding:"13px 20px", fontSize:12 }}>{k.id_type}</td>
                  <td style={{ padding:"13px 20px", fontSize:11.5, color:"rgba(240,237,232,0.45)", fontFamily:"monospace" }}>{new Date(k.created_at).toLocaleDateString()}</td>
                  <td style={{ padding:"13px 20px" }}>
                    <span style={{ background:STATUS_COLORS[k.status]+"22", color:STATUS_COLORS[k.status], border:"1px solid "+STATUS_COLORS[k.status]+"44", borderRadius:6, padding:"3px 9px", fontSize:10.5, fontWeight:700 }}>{k.status}</span>
                  </td>
                  <td style={{ padding:"13px 20px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>setSelected(k)} style={{ background:"rgba(59,125,216,0.1)", border:"1px solid rgba(59,125,216,0.3)", color:"#3B7DD8", borderRadius:7, padding:"5px 11px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Review</button>
                      {k.status==="pending" && <>
                        <button onClick={()=>doAction(k.id,"approve")} style={{ background:"rgba(45,158,107,0.1)", border:"1px solid rgba(45,158,107,0.3)", color:"#2D9E6B", borderRadius:7, padding:"5px 11px", fontSize:11, fontWeight:700, cursor:"pointer" }}>✓ Approve</button>
                        <button onClick={()=>setSelected(k)} style={{ background:"rgba(232,83,58,0.1)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", borderRadius:7, padding:"5px 11px", fontSize:11, fontWeight:700, cursor:"pointer" }}>✕ Reject</button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={()=>setSelected(null)}>
          <div style={{ background:"#0E0F11", border:"1px solid rgba(255,255,255,0.12)", borderRadius:18, width:"100%", maxWidth:600, maxHeight:"90vh", overflow:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize:16, fontWeight:800 }}>KYC Review — {selected.full_name}</div>
              <button onClick={()=>setSelected(null)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(240,237,232,0.5)" }}>✕</button>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                {[["Full name",selected.full_name],["Email",selected.email],["Business",selected.business_name||"—"],["ID type",selected.id_type],["ID number",selected.id_number],["Country",selected.country]].map(([l,v])=>(
                  <div key={l} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:11, padding:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"rgba(240,237,232,0.3)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:5 }}>{l}</div>
                    <div style={{ fontSize:13.5, fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.4)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Document previews</div>
                <div style={{ display:"flex", gap:10 }}>
                  {selected.id_front_url && <a href={selected.id_front_url} target="_blank" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"14px 20px", textAlign:"center", color:"#3B7DD8", textDecoration:"none", fontSize:12, fontWeight:700 }}>📄 ID Front</a>}
                  {selected.id_back_url && <a href={selected.id_back_url} target="_blank" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"14px 20px", textAlign:"center", color:"#3B7DD8", textDecoration:"none", fontSize:12, fontWeight:700 }}>📋 ID Back</a>}
                </div>
              </div>
              {selected.kyc_status === "pending" && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.4)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Review note (shown to applicant if rejecting)</div>
                  <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note..." style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"12px 14px", color:"#F0EDE8", fontSize:13, outline:"none", resize:"vertical", minHeight:80, fontFamily:"inherit" }} />
                </div>
              )}
            </div>
            {selected.kyc_status === "pending" && (
              <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={()=>setSelected(null)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)", color:"#F0EDE8", padding:"9px 18px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:13 }}>Cancel</button>
                <button onClick={()=>doAction(selected.id,"reject")} disabled={actionLoading} style={{ background:"rgba(232,83,58,0.12)", border:"1px solid rgba(232,83,58,0.3)", color:"#E8533A", padding:"9px 18px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:13 }}>❌ Reject</button>
                <button onClick={()=>doAction(selected.id,"approve")} disabled={actionLoading} style={{ background:"#2D9E6B", border:"none", color:"#fff", padding:"9px 20px", borderRadius:10, fontWeight:800, cursor:"pointer", fontSize:13 }}>{actionLoading?"Processing...":"✅ Approve KYC"}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
