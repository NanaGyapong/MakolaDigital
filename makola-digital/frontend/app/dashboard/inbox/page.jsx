"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "https://sparkling-charm-production-cb2c.up.railway.app/api/v1";

export default function InboxPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("makola_token") : null;

  useEffect(() => {
    if (!token) { router.push("/auth/login"); return; }
    fetch(`${API}/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setMessages(data.messages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Group messages by listing + other user
  const threads = messages.reduce((acc, m) => {
    const key = m.listing_id + "_" + (m.sender_id === m.receiver_id ? m.sender_id : [m.sender_id, m.receiver_id].sort().join("_"));
    if (!acc[key]) acc[key] = { listing_title: m.listing_title, listing_id: m.listing_id, other_name: m.sender_name !== m.receiver_name ? (messages.find(x => x.listing_id === m.listing_id)?.sender_name || m.sender_name) : m.sender_name, messages: [], unread: 0 };
    acc[key].messages.push(m);
    if (!m.is_read) acc[key].unread++;
    return acc;
  }, {});

  const threadList = Object.values(threads);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    const lastMsg = selected.messages[0];
    const receiverId = lastMsg.sender_id;
    try {
      await fetch(`${API}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId: selected.listing_id, receiverId, body: reply, type: "message" })
      });
      setReply("");
      // Refresh
      const res = await fetch(`${API}/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 56, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,13,13,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => router.push("/")}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #E8533A, #C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌍</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Makola<span style={{ color: "#E8533A" }}>Digital</span></span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push("/dashboard/analytics")} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#F0EDE8", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Dashboard</button>
        </div>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "calc(100vh - 56px)" }}>

        {/* Thread List */}
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.07)", overflowY: "auto" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>💬 Messages</h2>
            <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginTop: 4 }}>{threadList.length} conversation{threadList.length !== 1 ? "s" : ""}</div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(240,237,232,0.4)" }}>Loading...</div>
          ) : threadList.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(240,237,232,0.4)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
              <div>No messages yet</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>Messages from buyers will appear here</div>
            </div>
          ) : (
            threadList.map((thread, i) => (
              <div key={i} onClick={() => setSelected(thread)} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", background: selected === thread ? "rgba(232,83,58,0.08)" : "transparent", borderLeft: selected === thread ? "3px solid #E8533A" : "3px solid transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{thread.other_name}</div>
                  {thread.unread > 0 && <span style={{ background: "#E8533A", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{thread.unread}</span>}
                </div>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)", marginBottom: 4 }}>Re: {thread.listing_title}</div>
                <div style={{ fontSize: 12, color: "rgba(240,237,232,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thread.messages[0]?.body}</div>
              </div>
            ))
          )}
        </div>

        {/* Message Thread */}
        {selected ? (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontWeight: 700 }}>{selected.other_name}</div>
              <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>Re: {selected.listing_title}</div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[...selected.messages].reverse().map((m, i) => {
                const isMe = m.sender_id !== selected.messages[0].receiver_id;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "70%", background: isMe ? "rgba(232,83,58,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${isMe ? "rgba(232,83,58,0.3)" : "rgba(255,255,255,0.09)"}`, borderRadius: 12, padding: "10px 14px" }}>
                      {m.type === "offer" && <div style={{ fontSize: 11, fontWeight: 700, color: "#2D9E6B", marginBottom: 4 }}>💰 OFFER</div>}
                      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.body}</div>
                      <div style={{ fontSize: 10, color: "rgba(240,237,232,0.4)", marginTop: 6 }}>{new Date(m.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Box */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10 }}>
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply()}
                placeholder="Type your reply..."
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "10px 14px", color: "#F0EDE8", fontSize: 14, outline: "none" }}
              />
              <button onClick={sendReply} disabled={sending || !reply.trim()} style={{ background: "#E8533A", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: sending || !reply.trim() ? 0.5 : 1 }}>
                {sending ? "..." : "Send →"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,237,232,0.3)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div>Select a conversation</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
