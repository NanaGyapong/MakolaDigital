// app/dashboard/analytics/page.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/auth.service";

const PERIODS = [
  { value:"today", label:"Today" },
  { value:"7d",   label:"7 days" },
  { value:"30d",  label:"30 days" },
  { value:"90d",  label:"3 months" },
  { value:"12m",  label:"12 months" },
  { value:"all",  label:"All time" },
];

const COLORS = { red:"#E8533A", gold:"#C47F17", green:"#2D9E6B", blue:"#3B7DD8", purple:"#8B5CF6" };

// ── Hooks ─────────────────────────────────────────────────────
function useAnalytics(period) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics/overview?period=${period}`)
      .then(r => { setData(r.data); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  return { data, loading, error };
}

function useInsights() {
  const [insights, setInsights] = useState([]);
  useEffect(() => {
    api.get("/analytics/insights").then(r => setInsights(r.data.insights || [])).catch(() => {});
  }, []);
  return insights;
}

// ── Components ─────────────────────────────────────────────────
function KPICard({ label, value, change, color, prefix = "" }) {
  const isUp = change > 0;
  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:13, padding:"15px 16px" }}>
      <div style={{ fontSize:10, fontWeight:700, color:"rgba(240,237,232,0.5)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:900, letterSpacing:"-.03em", color, marginBottom:5 }}>{prefix}{typeof value === "number" ? value.toLocaleString() : value}</div>
      {change !== undefined && (
        <div style={{ fontSize:11, fontWeight:700, color:isUp?"#2D9E6B":change<0?"#E8533A":"rgba(240,237,232,0.5)", display:"flex", alignItems:"center", gap:4 }}>
          <span>{isUp?"↑":"↓"}</span>
          <span>{Math.abs(change).toFixed(1)}% vs previous period</span>
        </div>
      )}
    </div>
  );
}

function BarChart({ data, height = 140 }) {
  if (!data?.length) return <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(240,237,232,0.3)", fontSize:13 }}>No data</div>;
  const max = Math.max(...data.map(d => d.revenue || d.value || 0));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%", justifyContent:"flex-end", position:"relative" }}>
          <div title={`GH₵ ${(d.revenue || d.value || 0).toLocaleString()}`}
            style={{ width:"100%", height:`${Math.max((d.revenue || d.value || 0)/max*100, 3)}%`, background:i===data.length-1?"#E8533A":"rgba(232,83,58,0.4)", borderRadius:"4px 4px 0 0", transition:"height .4s" }} />
          <div style={{ fontSize:9, color:"rgba(240,237,232,0.28)", fontWeight:600, marginTop:5, textAlign:"center" }}>{d.label || d.period?.split("T")[0].slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

function RatingBars({ ratings }) {
  if (!ratings) return null;
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:40, fontWeight:900, color:"#E8533A", letterSpacing:"-.04em" }}>{ratings.avg}</div>
          <div style={{ color:"#C47F17", fontSize:16 }}>{"★".repeat(Math.round(ratings.avg))}</div>
        </div>
        <div style={{ flex:1 }}>
          {ratings.dist?.map(r => (
            <div key={r.stars} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.5)", width:8 }}>{r.stars}</div>
              <div style={{ flex:1, height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", background:"#C47F17", borderRadius:3, width:`${Math.round(r.count/ratings.total*100)}%` }} />
              </div>
              <div style={{ fontSize:11, color:"rgba(240,237,232,0.4)", minWidth:20, textAlign:"right" }}>{r.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }) {
  const colors = { positive:"#2D9E6B", tip:"#3B7DD8", opportunity:"#E8533A", warning:"#C47F17" };
  const color = colors[insight.type] || "#8B5CF6";
  return (
    <div style={{ display:"flex", gap:10, padding:"12px 14px", background:"rgba(255,255,255,0.03)", borderRadius:11, borderLeft:`2px solid ${color}`, cursor:"pointer", transition:"background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
      <span style={{ fontSize:18, flexShrink:0 }}>{insight.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#F0EDE8", marginBottom:3 }}>{insight.title}</div>
        <div style={{ fontSize:12, color:"rgba(240,237,232,0.55)", lineHeight:1.55 }}>{insight.description}</div>
      </div>
      <button style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(240,237,232,0.6)", padding:"5px 10px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap", fontFamily:"inherit" }}>
        {insight.action}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const { data, loading } = useAnalytics(period);
  const insights = useInsights();

  const exportCSV = async (type) => {
    const r = await api.get(`/analytics/export?period=${period}&type=${type}`, { responseType:"blob" });
    const url = URL.createObjectURL(r.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `makola-${type}-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const s = {
    page: { background:"#0A0A0A", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif" },
    hdr:  { background:"#0D0D0D", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 },
    title:{ fontSize:18, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em" },
    main: { padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 },
    kpis: { display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 },
    charts: { display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 },
    bottom: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 },
    card:  { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:13, padding:18 },
    cardTitle: { fontSize:14, fontWeight:800, color:"#F0EDE8", letterSpacing:"-.02em", marginBottom:4 },
    cardSub: { fontSize:12, color:"rgba(240,237,232,0.5)", marginBottom:16 },
    periTab: (active) => ({ background:active?"rgba(232,83,58,0.1)":"none", border:"none", color:active?"#E8533A":"rgba(240,237,232,0.5)", padding:"8px 14px", borderRadius:7, fontSize:12.5, fontWeight:700, cursor:"pointer" }),
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.hdr}>
        <div style={s.title}>Seller Analytics</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {PERIODS.map(p => (
            <button key={p.value} style={s.periTab(period===p.value)} onClick={() => setPeriod(p.value)}>{p.label}</button>
          ))}
          <button onClick={() => exportCSV("orders")} style={{ background:"#E8533A", border:"none", color:"#fff", padding:"7px 14px", borderRadius:9, fontSize:12.5, fontWeight:700, cursor:"pointer", marginLeft:8 }}>
            ↓ Export CSV
          </button>
        </div>
      </div>

      <div style={s.main}>
        {loading ? (
          <div style={{ textAlign:"center", padding:48, color:"rgba(240,237,232,0.4)" }}>Loading analytics...</div>
        ) : !data ? (
          <div style={{ textAlign:"center", padding:48, color:"rgba(240,237,232,0.4)" }}>No data available</div>
        ) : (
          <>
            {/* KPI row */}
            <div style={s.kpis}>
              <KPICard label="Revenue" value={data.metrics.revenue.value.toLocaleString()} change={data.metrics.revenue.change} color="#E8533A" prefix="GH₵ " />
              <KPICard label="Orders"  value={data.metrics.orders.value}  change={data.metrics.orders.change}  color="#2D9E6B" />
              <KPICard label="Profile views" value={data.metrics.views.value.toLocaleString()} change={data.metrics.views.change} color="#3B7DD8" />
              <KPICard label="Conv. rate" value={`${data.metrics.conversion.value}%`} change={data.metrics.conversion.change} color="#C47F17" />
              <KPICard label="Avg. order" value={`GH₵ ${Math.round(data.metrics.avgOrder.value).toLocaleString()}`} change={data.metrics.avgOrder.change} color="#8B5CF6" />
            </div>

            {/* Charts */}
            <div style={s.charts}>
              <div style={s.card}>
                <div style={s.cardTitle}>Revenue over time</div>
                <div style={s.cardSub}>GH₵ — {period === "7d" ? "Daily" : "Monthly"} breakdown</div>
                <BarChart data={data.charts.revenue} />
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>Revenue by type</div>
                <div style={s.cardSub}>Listing category breakdown</div>
                {data.charts.typeBreakdown?.map((t, i) => {
                  const total = data.charts.typeBreakdown.reduce((s,x) => s+parseFloat(x.revenue), 0);
                  const pct = total > 0 ? Math.round(parseFloat(t.revenue)/total*100) : 0;
                  const colors = ["#E8533A","#3B7DD8","#8B5CF6","#2D9E6B","#C47F17"];
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:colors[i%5], flexShrink:0 }} />
                      <div style={{ flex:1, fontSize:13, color:"rgba(240,237,232,0.6)" }}>{t.type}</div>
                      <div style={{ fontSize:14, fontWeight:800 }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top listings table */}
            <div style={{ ...s.card, padding:0, overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={s.cardTitle}>Top listings</div>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
                <thead>
                  <tr>{["Listing","Views","Orders","Revenue","CVR","Trend"].map(h => (
                    <th key={h} style={{ fontSize:10, color:"rgba(240,237,232,0.28)", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", padding:"10px 18px", textAlign:"left", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {data.topListings?.slice(0,5).map(l => (
                    <tr key={l.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"12px 18px" }}><div style={{ fontWeight:700 }}>{l.title}</div><div style={{ fontSize:10.5, color:"rgba(240,237,232,0.4)" }}>{l.type}</div></td>
                      <td style={{ padding:"12px 18px" }}>{l.views.toLocaleString()}</td>
                      <td style={{ padding:"12px 18px" }}>{l.orders}</td>
                      <td style={{ padding:"12px 18px", fontWeight:800, color:"#E8533A" }}>GH₵ {l.revenue.toLocaleString()}</td>
                      <td style={{ padding:"12px 18px" }}>{l.cvr}%</td>
                      <td style={{ padding:"12px 18px", fontSize:16 }}>{l.revenue > 10000 ? "📈" : "➡️"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom row */}
            <div style={s.bottom}>
              <div style={s.card}><div style={s.cardTitle}>Seller ratings</div><div style={s.cardSub}>{data.ratings?.total} verified reviews</div><RatingBars ratings={data.ratings} /></div>
              <div style={s.card}>
                <div style={s.cardTitle}>Monthly goals</div>
                <div style={s.cardSub}>Progress this period</div>
                {[
                  { label:"Revenue", val:data.metrics.revenue.value, target:30000, color:"#E8533A" },
                  { label:"Orders", val:data.metrics.orders.value, target:100, color:"#2D9E6B" },
                  { label:"Profile views", val:data.metrics.views.value, target:5000, color:"#3B7DD8" },
                ].map(g => (
                  <div key={g.label} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, fontWeight:700, marginBottom:6 }}>
                      <span>{g.label}</span>
                      <span style={{ color:g.color }}>{typeof g.val === "number" ? g.val.toLocaleString() : g.val} / {g.target.toLocaleString()}</span>
                    </div>
                    <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:g.color, borderRadius:3, width:`${Math.min(100, Math.round(g.val/g.target*100))}%`, transition:"width .6s" }} />
                    </div>
                    <div style={{ fontSize:11, color:"rgba(240,237,232,0.4)", marginTop:4 }}>{Math.round(g.val/g.target*100)}% of goal</div>
                  </div>
                ))}
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>🤖 ML Insights</div>
                <div style={s.cardSub}>Updated daily · Powered by your data</div>
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {insights.slice(0,3).map((ins, i) => <InsightCard key={i} insight={ins} />)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
