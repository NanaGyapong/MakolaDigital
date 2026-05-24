// app/offline/page.jsx
export default function OfflinePage() {
  const s = {
    page: { minHeight:"100vh", background:"#0A0A0A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#F0EDE8" },
    icon: { fontSize:72, marginBottom:24 },
    title: { fontSize:26, fontWeight:900, letterSpacing:"-.03em", marginBottom:10 },
    sub: { fontSize:14, color:"rgba(240,237,232,0.55)", lineHeight:1.7, textAlign:"center", maxWidth:360, marginBottom:32 },
    card: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:16, padding:"20px 24px", width:"100%", maxWidth:400, marginBottom:20 },
    cardTitle: { fontSize:14, fontWeight:800, marginBottom:12 },
    item: { display:"flex", alignItems:"center", gap:10, fontSize:13, color:"rgba(240,237,232,0.65)", marginBottom:10 },
    retryBtn: { background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:"13px 32px", borderRadius:13, fontSize:15, fontWeight:900, cursor:"pointer" },
  };

  return (
    <div style={s.page}>
      <div style={s.icon}>📵</div>
      <div style={s.title}>You're offline</div>
      <p style={s.sub}>
        No internet connection detected. You can still browse listings you've viewed recently.
      </p>

      <div style={s.card}>
        <div style={s.cardTitle}>Available offline</div>
        {[
          ["📱","Recently viewed listings"],
          ["💬","Saved conversations"],
          ["❤️","Your saved/wishlist items"],
          ["📦","Your active listings"],
        ].map(([icon, text]) => (
          <div key={text} style={s.item}><span>{icon}</span>{text}</div>
        ))}
      </div>

      <button style={s.retryBtn} onClick={() => window.location.reload()}>
        🔄 Try again
      </button>

      <p style={{ marginTop:16, fontSize:12, color:"rgba(240,237,232,0.28)" }}>
        Makola Digital works offline thanks to PWA technology
      </p>
    </div>
  );
}
