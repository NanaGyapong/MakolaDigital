"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  try { return localStorage.getItem("makola_token"); } catch { return null; }
}

function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}

export default function BuyerDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("saved");
  const [saved, setSaved] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/auth/login?redirect=/dashboard/buyer"); return; }
    const payload = parseJwt(token);
    if (!payload) { router.push("/auth/login"); return; }
    setUser(payload);
    fetchAll(token);
  }, []);

  async function fetchAll(token) {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [savedRes, msgRes] = await Promise.all([
        fetch(`${API}/listings/saved/mine`, { headers }),
        fetch(`${API}/messages/threads`, { headers }),
      ]);
      const savedData = savedRes.ok ? await savedRes.json() : { listings: [] };
      const msgData = msgRes.ok ? await msgRes.json() : { threads: [] };
      setSaved(savedData.listings || []);
      setThreads(msgData.threads || []);
    } catch {}
    setLoading(false);
  }

  async function unsave(listingId) {
    const token = getToken();
    setRemovingId(listingId);
    try {
      await fetch(`${API}/listings/${listingId}/unsave`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(prev => prev.filter(l => l.id !== listingId));
    } catch {}
    setRemovingId(null);
  }

  const formatPrice = (l) => {
    if (!l.price || Number(l.price) === 0) return l.type === "job" ? "Competitive" : "Price on request";
    return (l.price_currency || "GHS") + " " + Number(l.price).toLocaleString() + (l.is_negotiable ? " · Neg." : "");
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const s = {
    page: { background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "system-ui,-apple-system,sans-serif", paddingBottom: 80 },
    header: { background: "#111", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 },
    backBtn: { background: "none", border: "none", color: "rgba(240,237,232,0.5)", fontSize: 20, cursor: "pointer", padding: 0 },
    tabBar: { display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#111", padding: "0 20px" },
    tab: (a) => ({ background: "none", border: "none", color: a ? "#E8533A" : "rgba(240,237,232,0.4)", borderBottom: a ? "2px solid #E8533A" : "2px solid transparent", padding: "14px 0", marginRight: 24, fontSize: 14, fontWeight: a ? 700 : 500, cursor: "pointer" }),
    content: { padding: "20px 16px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 },
    card: { background: "#1A1A1A", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", position: "relative", cursor: "pointer" },
    img: { width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", background: "#222" },
    removeBtn: { position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" },
    empty: { textAlign: "center", padding: "48px 20px", color: "rgba(240,237,232,0.3)" },
    ctaBtn: { background: "#E8533A", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
    thread: { background: "#1A1A1A", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: "50%", background: "#E8533A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => router.push("/")}>←</button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>My Account</div>
          {user && <div style={{ fontSize: 12, color: "rgba(240,237,232,0.4)", marginTop: 2 }}>Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋</div>}
        </div>
      </div>

      <div style={s.tabBar}>
        <button style={s.tab(tab === "saved")} onClick={() => setTab("saved")}>
          ❤️ Saved {saved.length > 0 && `(${saved.length})`}
        </button>
        <button style={s.tab(tab === "messages")} onClick={() => setTab("messages")}>
          💬 Messages {threads.length > 0 && `(${threads.length})`}
        </button>
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "rgba(240,237,232,0.3)", fontSize: 14 }}>Loading...</div>
        ) : tab === "saved" ? (
          saved.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
              <div style={{ fontSize: 14, marginBottom: 16 }}>No saved listings yet.<br />Tap "Add to Catalogue" on any listing to save it here.</div>
              <button style={s.ctaBtn} onClick={() => router.push("/")}>Browse Listings</button>
            </div>
          ) : (
            <div style={s.grid}>
              {saved.map(l => (
                <div key={l.id} style={s.card} onClick={() => router.push(`/listing/${l.id}`)}>
                  {l.primary_image
                    ? <img src={l.primary_image} alt={l.title} style={s.img} />
                    : <div style={{ ...s.img, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🛍️</div>
                  }
                  <button style={s.removeBtn} onClick={e => { e.stopPropagation(); unsave(l.id); }} disabled={removingId === l.id} title="Remove">
                    {removingId === l.id ? "…" : "✕"}
                  </button>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{l.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#E8533A", marginBottom: 4 }}>{formatPrice(l)}</div>
                    <div style={{ fontSize: 10, color: "rgba(240,237,232,0.4)" }}>📍 {l.location_text || l.city || "Ghana"}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          threads.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, marginBottom: 16 }}>No messages yet.<br />Message a seller on any listing to start a conversation.</div>
              <button style={s.ctaBtn} onClick={() => router.push("/")}>Browse Listings</button>
            </div>
          ) : (
            <div>
              {threads.map(t => {
                const other = t.other_user || {};
                const initials = (other.name || other.email || "?").charAt(0).toUpperCase();
                const hasUnread = t.unread_count > 0;
                return (
                  <div key={`${t.listing_id}_${other.id}`} style={s.thread} onClick={() => router.push(`/dashboard/inbox?thread=${t.listing_id}`)}>
                    <div style={s.avatar}>{other.avatar && other.avatar.length <= 10 ? other.avatar : initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{other.name || other.email || "Seller"}</div>
                      <div style={{ fontSize: 12, color: "rgba(240,237,232,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.last_message || "Tap to view"}</div>
                      {t.listing_title && <div style={{ fontSize: 10, color: "rgba(240,237,232,0.3)", marginTop: 2 }}>Re: {t.listing_title}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      {t.last_message_at && <div style={{ fontSize: 10, color: "rgba(240,237,232,0.3)" }}>{timeAgo(t.last_message_at)}</div>}
                      {hasUnread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8533A" }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
