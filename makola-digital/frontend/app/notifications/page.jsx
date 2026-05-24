import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:4000/api/v1" });
"use client";
// app/notifications/page.jsx
"use client";
import { useState, useEffect } from "react";

const ICONS = {
  new_message:      "💬",
  order_update:     "📦",
  order_confirmed:  "✅",
  new_order:        "🎉",
  review:           "⭐",
  kyc_approved:     "✅",
  kyc_rejected:     "❌",
  listing_live:     "🚀",
  listing_expiring: "⏰",
  payment_failed:   "❌",
  dispute:          "⚖️",
  system:           "🔔",
};

const COLORS = {
  new_message:     "#3B7DD8",
  order_confirmed: "#2D9E6B",
  new_order:       "#2D9E6B",
  review:          "#C47F17",
  kyc_approved:    "#2D9E6B",
  kyc_rejected:    "#E8533A",
  listing_live:    "#E8533A",
  listing_expiring:"#C47F17",
  payment_failed:  "#E8533A",
  dispute:         "#C47F17",
  system:          "#8B5CF6",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // all | unread
  const [prefs, setPrefs] = useState(null);
  const [showPrefs, setShowPrefs] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/notifications?unread_only=${tab === "unread"}`);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadPrefs = async () => {
    const { data } = await api.get("/notifications/preferences");
    setPrefs(data.preferences);
  };

  useEffect(() => { load(); }, [tab]);
  useEffect(() => { loadPrefs(); }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(p => Math.max(0, p - 1));
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications(p => p.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const savePrefs = async (newPrefs) => {
    await api.patch("/notifications/preferences", newPrefs);
    setPrefs(newPrefs);
  };

  const s = {
    page: { maxWidth:700, margin:"0 auto", padding:"24px 20px", fontFamily:"'Plus Jakarta Sans',sans-serif" },
    hdr:  { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 },
    title: { fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em" },
    tabs: { display:"flex", gap:6, marginBottom:20, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:11, padding:4, width:"fit-content" },
    tab: (a) => ({ background:a?"rgba(232,83,58,0.12)":"none", border:`1px solid ${a?"rgba(232,83,58,0.3)":"transparent"}`, color:a?"#E8533A":"rgba(240,237,232,0.5)", padding:"7px 16px", borderRadius:8, fontSize:12.5, fontWeight:700, cursor:"pointer" }),
    card: (unread) => ({ background:unread?"rgba(232,83,58,0.04)":"rgba(255,255,255,0.03)", border:`1px solid ${unread?"rgba(232,83,58,0.15)":"rgba(255,255,255,0.07)"}`, borderRadius:14, padding:16, marginBottom:10, display:"flex", gap:13, cursor:"pointer", transition:"all .15s" }),
    icon: (type) => ({ width:42, height:42, borderRadius:12, background:(COLORS[type]||"#8B5CF6")+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }),
    prefCard: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:20, marginTop:20 },
    toggle: (on) => ({ width:42, height:24, borderRadius:12, background:on?"#2D9E6B":"rgba(255,255,255,0.15)", position:"relative", cursor:"pointer", transition:"background .2s", flexShrink:0, border:"none" }),
  };

  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh" }}>
      <div style={s.page}>
        {/* Header */}
        <div style={s.hdr}>
          <div>
            <div style={s.title}>Notifications</div>
            {unreadCount > 0 && <div style={{ fontSize:12, color:"rgba(240,237,232,0.5)", marginTop:4 }}>{unreadCount} unread</div>}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(240,237,232,0.5)", padding:"8px 14px", borderRadius:9, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
                Mark all read
              </button>
            )}
            <button onClick={() => setShowPrefs(p => !p)} style={{ background:showPrefs?"rgba(232,83,58,0.1)":"rgba(255,255,255,0.05)", border:`1px solid ${showPrefs?"rgba(232,83,58,0.3)":"rgba(255,255,255,0.1)"}`, color:showPrefs?"#E8533A":"rgba(240,237,232,0.5)", padding:"8px 14px", borderRadius:9, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
              ⚙️ Preferences
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={s.tab(tab==="all")} onClick={() => setTab("all")}>All</button>
          <button style={s.tab(tab==="unread")} onClick={() => setTab("unread")}>
            Unread {unreadCount > 0 && <span style={{ background:"#E8533A", color:"#fff", borderRadius:9, padding:"1px 6px", fontSize:10, fontWeight:800, marginLeft:5 }}>{unreadCount}</span>}
          </button>
        </div>

        {/* Notifications list */}
        {loading ? (
          Array.from({length:5}).map((_,i) => (
            <div key={i} style={{ ...s.card(false), animation:"pulse 1.5s ease-in-out infinite" }}>
              <div style={{ width:42, height:42, borderRadius:12, background:"rgba(255,255,255,0.05)" }} />
              <div style={{ flex:1 }}>
                <div style={{ width:"60%", height:13, borderRadius:4, background:"rgba(255,255,255,0.06)", marginBottom:8 }} />
                <div style={{ width:"90%", height:11, borderRadius:4, background:"rgba(255,255,255,0.04)" }} />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 20px", color:"rgba(240,237,232,0.4)" }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🔔</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#F0EDE8", marginBottom:8 }}>All caught up</div>
            <div style={{ fontSize:13 }}>No {tab === "unread" ? "unread " : ""}notifications yet</div>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={s.card(!n.is_read)} onClick={() => !n.is_read && markRead(n.id)}>
              <div style={s.icon(n.type)}>{ICONS[n.type] || "🔔"}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                  <div style={{ fontSize:13.5, fontWeight:n.is_read?600:800, color:"#F0EDE8", lineHeight:1.4 }}>{n.title}</div>
                  <div style={{ fontSize:10.5, color:"rgba(240,237,232,0.3)", whiteSpace:"nowrap", fontWeight:600 }}>{timeAgo(n.created_at)}</div>
                </div>
                {n.body && <div style={{ fontSize:12.5, color:"rgba(240,237,232,0.55)", marginTop:4, lineHeight:1.5 }}>{n.body}</div>}
              </div>
              {!n.is_read && <div style={{ width:8, height:8, borderRadius:4, background:"#E8533A", flexShrink:0, marginTop:6 }} />}
            </div>
          ))
        )}

        {/* Email preferences */}
        {showPrefs && prefs && (
          <div style={s.prefCard}>
            <div style={{ fontSize:15, fontWeight:800, color:"#F0EDE8", marginBottom:4 }}>Email preferences</div>
            <div style={{ fontSize:12.5, color:"rgba(240,237,232,0.5)", marginBottom:18 }}>
              Control which emails Makola Digital sends you. Transactional emails (orders, verification) are always sent.
            </div>
            {[
              ["messages", "💬", "New messages", "When someone sends you a message"],
              ["order_updates", "📦", "Order updates", "Order confirmations, status changes, payout notifications"],
              ["listing_alerts", "📣", "Listing alerts", "When your listings expire or get views milestones"],
              ["marketing", "📬", "Weekly digest", "New listings matching your saved searches"],
              ["analytics", "📊", "Weekly seller stats", "Your store performance summary every Monday"],
            ].map(([key, icon, label, desc]) => (
              <div key={key} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13.5, fontWeight:700, color:"#F0EDE8" }}>{label}</div>
                  <div style={{ fontSize:12, color:"rgba(240,237,232,0.45)", marginTop:2 }}>{desc}</div>
                </div>
                <button style={s.toggle(prefs[key])} onClick={() => savePrefs({ ...prefs, [key]: !prefs[key] })}>
                  <div style={{ position:"absolute", top:3, left:prefs[key]?20:3, width:18, height:18, borderRadius:9, background:"#fff", transition:"left .2s" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
