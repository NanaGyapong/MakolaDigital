// components/InstallBanner.jsx
"use client";
import { useState, useEffect } from "react";
import { useInstallPrompt } from "@/hooks/usePWA";

// ── Detect OS/browser for custom instructions ─────────────────
function getInstallInstructions() {
  const ua = navigator.userAgent;
  const isIOS    = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChrome = /Chrome/.test(ua);
  const isEdge   = /Edg/.test(ua);

  if (isIOS && isSafari) return { type: "ios-safari",  text: 'Tap the Share button (⬆️) then "Add to Home Screen"' };
  if (isIOS)             return { type: "ios-other",   text: 'Open in Safari to install Makola Digital' };
  if (isEdge)            return { type: "edge",        text: 'Click the ⊕ icon in the address bar to install' };
  if (isChrome)          return { type: "chrome",      text: 'Click the install icon in the address bar' };
  return                        { type: "generic",     text: 'Add to home screen from your browser menu' };
}

// ── Smart banner — shows once, respects "not now" ─────────────
export function InstallBanner() {
  const { canInstall, isInstalled, isInstalling, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if dismissed within last 7 days
    const dismissedAt = localStorage.getItem("pwa_banner_dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 86400000) {
      setDismissed(true);
    }
    setInstructions(getInstallInstructions());
  }, []);

  const handleInstall = async () => {
    if (canInstall) {
      const { outcome } = await promptInstall();
      if (outcome === "accepted") setInstalled(true);
    } else {
      setShowFallback(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_banner_dismissed", Date.now().toString());
    setDismissed(true);
  };

  if (dismissed || isInstalled || installed) return null;

  const s = {
    banner: {
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999,
      background: "linear-gradient(135deg, #0D0D0D, #131315)",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      padding: "16px 20px 20px",
      boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    handle: { width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "0 auto 14px" },
    row: { display: "flex", alignItems: "center", gap: 14, marginBottom: 14 },
    appIcon: { width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#E8533A,#C47F17)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 },
    appInfo: { flex: 1 },
    appName: { fontSize: 15, fontWeight: 900, color: "#F0EDE8", letterSpacing: "-0.02em" },
    appDesc: { fontSize: 12, color: "rgba(240,237,232,0.55)", marginTop: 3, lineHeight: 1.5 },
    installBtn: { background: "#E8533A", border: "none", color: "#fff", padding: "11px 22px", borderRadius: 11, fontSize: 14, fontWeight: 800, cursor: "pointer", flexShrink: 0, boxShadow: "0 3px 14px rgba(232,83,58,0.35)" },
    dismissBtn: { width: "100%", background: "none", border: "none", color: "rgba(240,237,232,0.35)", fontSize: 13, cursor: "pointer", marginTop: 4, fontFamily: "inherit", padding: "4px 0" },
    featureRow: { display: "flex", gap: 16, marginBottom: 12 },
    feature: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(240,237,232,0.55)", fontWeight: 600 },
    instructions: { background: "rgba(232,83,58,0.08)", border: "1px solid rgba(232,83,58,0.2)", borderRadius: 11, padding: "12px 14px", marginBottom: 12, fontSize: 13, color: "rgba(240,237,232,0.75)", lineHeight: 1.6 },
  };

  return (
    <div style={s.banner}>
      <div style={s.handle} />

      <div style={s.row}>
        <div style={s.appIcon}>🌍</div>
        <div style={s.appInfo}>
          <div style={s.appName}>Makola Digital</div>
          <div style={s.appDesc}>Africa's marketplace · Free to install</div>
        </div>
        {canInstall && (
          <button style={s.installBtn} onClick={handleInstall} disabled={isInstalling}>
            {isInstalling ? "Installing..." : "Install"}
          </button>
        )}
      </div>

      <div style={s.featureRow}>
        {[["⚡","Fast & offline"],["🔔","Push alerts"],["📱","App-like feel"],["🚫","No app store"]].map(([icon, text]) => (
          <div key={text} style={s.feature}><span>{icon}</span>{text}</div>
        ))}
      </div>

      {showFallback && instructions && (
        <div style={s.instructions}>
          📲 {instructions.text}
        </div>
      )}

      {!canInstall && !showFallback && (
        <button style={{ ...s.installBtn, width: "100%", marginBottom: 8 }} onClick={handleInstall}>
          📲 Install Makola Digital
        </button>
      )}

      <button style={s.dismissBtn} onClick={handleDismiss}>
        Not now
      </button>
    </div>
  );
}

// ── Update banner — shown when new SW is available ────────────
export function UpdateBanner({ onUpdate }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", top: 56, left: 16, right: 16, zIndex: 998,
      background: "#0D0D0D", border: "1px solid rgba(45,158,107,0.35)",
      borderRadius: 13, padding: "13px 16px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <span style={{ fontSize: 20 }}>🔄</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#F0EDE8" }}>Update available</div>
        <div style={{ fontSize: 12, color: "rgba(240,237,232,0.55)", marginTop: 2 }}>New version of Makola Digital is ready</div>
      </div>
      <button onClick={onUpdate} style={{ background: "#2D9E6B", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Update</button>
      <button onClick={() => setVisible(false)} style={{ background: "none", border: "none", color: "rgba(240,237,232,0.4)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
    </div>
  );
}

// ── Offline banner ────────────────────────────────────────────
export function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <div style={{
      position: "fixed", top: 56, left: 0, right: 0, zIndex: 997,
      background: "rgba(196,127,23,0.12)", borderBottom: "1px solid rgba(196,127,23,0.3)",
      padding: "10px 20px", textAlign: "center",
      fontSize: 13, fontWeight: 700, color: "#C47F17",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      📵 You're offline — browsing cached content
    </div>
  );
}
