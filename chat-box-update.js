const fs = require('fs');
let c = fs.readFileSync('app/listing/[id]/page.jsx', 'utf8');

// Replace the sent state logic with a live chat
// Add messages state
c = c.replace(
  'const [sent, setSent] = useState(false);',
  'const [sent, setSent] = useState(false);\n  const [chatMessages, setChatMessages] = useState([]);\n  const [chatOpen, setChatOpen] = useState(false);'
);

// Update handleSend to add message to chat
c = c.replace(
  'setSent(true);\n      setMessage(\'\');\n      setOffer(\'\');',
  `setChatMessages(prev => [...prev, { 
        body: tab === 'offer' ? 'Offer: ' + offer + ' ' + listing.price_currency + (message ? ' - ' + message : '') : message,
        type: tab,
        time: new Date(),
        isMe: true
      }]);
      setChatOpen(true);
      setSent(false);
      setMessage('');
      setOffer('');`
);

// Replace the sent success UI with live chat
c = c.replace(
  `{sent ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{tab === "message" ? "Message sent!" : "Offer sent!"}</div>
                    <div style={{ fontSize: 12, color: "rgba(240,237,232,0.5)" }}>The seller will respond shortly.</div>
                    <button onClick={() => setSent(false)} style={{ marginTop: 12, background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Send another</button>
                  </div>
                ) :`,
  `{chatOpen && chatMessages.length > 0 ? (
                  <div>
                    <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {chatMessages.map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: m.isMe ? "flex-end" : "flex-start" }}>
                          <div style={{ maxWidth: "80%", background: m.isMe ? "rgba(232,83,58,0.15)" : "rgba(255,255,255,0.06)", border: "1px solid " + (m.isMe ? "rgba(232,83,58,0.3)" : "rgba(255,255,255,0.09)"), borderRadius: 10, padding: "8px 12px" }}>
                            {m.type === "offer" && <div style={{ fontSize: 10, fontWeight: 700, color: "#2D9E6B", marginBottom: 2 }}>💰 OFFER</div>}
                            <div style={{ fontSize: 13 }}>{m.body}</div>
                            <div style={{ fontSize: 10, color: "rgba(240,237,232,0.4)", marginTop: 4 }}>{m.time.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#2D9E6B", marginBottom: 8 }}>✅ Sent! Continue the conversation:</div>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your next message..." rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 12px", color: "#F0EDE8", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "sans-serif", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleSend} disabled={!message.trim()} style={{ flex: 1, background: "#E8533A", border: "none", color: "#fff", padding: "10px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: !message.trim() ? 0.5 : 1 }}>Send →</button>
                      <button onClick={() => router.push("/dashboard/inbox")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>📥 Inbox</button>
                    </div>
                  </div>
                ) : (`
);

// Close the extra bracket
c = c.replace(
  `{tab === "message" ? "Send Message →" : "Submit Offer →"}
                    </button>
                  </>
                )}`,
  `{tab === "message" ? "Send Message →" : "Submit Offer →"}
                    </button>
                  </>
                )}`
);

fs.writeFileSync('app/listing/[id]/page.jsx', c);
console.log('Done');
