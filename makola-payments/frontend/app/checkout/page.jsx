// app/checkout/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/auth.service";

const CURRENCIES = [
  { code: "GHS", symbol: "GH₵", flag: "🇬🇭", name: "Ghana Cedis", gateway: "paystack" },
  { code: "NGN", symbol: "₦",   flag: "🇳🇬", name: "Nigerian Naira", gateway: "paystack" },
  { code: "KES", symbol: "KSh", flag: "🇰🇪", name: "Kenyan Shilling", gateway: "flutterwave" },
  { code: "ZAR", symbol: "R",   flag: "🇿🇦", name: "South African Rand", gateway: "flutterwave" },
  { code: "USD", symbol: "$",   flag: "🇺🇸", name: "US Dollar", gateway: "stripe" },
  { code: "GBP", symbol: "£",   flag: "🇬🇧", name: "British Pound", gateway: "stripe" },
  { code: "EUR", symbol: "€",   flag: "🇪🇺", name: "Euro", gateway: "stripe" },
];

const GATEWAY_INFO = {
  paystack:     { name: "Paystack",     logo: "🔵", methods: ["Mobile Money", "Card", "Bank Transfer"] },
  flutterwave:  { name: "Flutterwave", logo: "🟠", methods: ["Mobile Money", "Card", "Bank Transfer", "M-Pesa"] },
  stripe:       { name: "Stripe",      logo: "🟣", methods: ["Credit/Debit Card", "Apple Pay", "Google Pay"] },
};

export default function CheckoutPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get("order");

  const [order, setOrder]       = useState(null);
  const [currency, setCurrency] = useState("GHS");
  const [fees, setFees]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState("currency"); // currency | confirm | processing | success

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const gateway = GATEWAY_INFO[selectedCurrency.gateway];

  // Load order + fees
  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`).then(r => setOrder(r.data.order)).catch(console.error);
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    api.get(`/payments/fees?amount=${order.total}&currency=${currency}`)
      .then(r => setFees(r.data))
      .catch(console.error);
  }, [order, currency]);

  const handlePay = async () => {
    setLoading(true);
    setStep("processing");
    try {
      const { data } = await api.post("/payments/initiate", {
        orderId,
        currency,
        callbackUrl: `${window.location.origin}/payments/verify`,
      });

      // Redirect to payment gateway
      if (data.authorizationUrl) window.location.href = data.authorizationUrl; // Paystack
      else if (data.paymentLink) window.location.href = data.paymentLink;       // Flutterwave
      else if (data.clientSecret) router.push(`/checkout/stripe?secret=${data.clientSecret}&order=${orderId}`); // Stripe
    } catch (err) {
      console.error(err);
      setStep("confirm");
      setLoading(false);
    }
  };

  const s = {
    wrap: { maxWidth:540, margin:"0 auto", padding:"32px 20px", fontFamily:"'Plus Jakarta Sans',sans-serif" },
    card: { background:"#0D0D0D", border:"1px solid rgba(255,255,255,0.09)", borderRadius:18, overflow:"hidden" },
    hdr:  { background:"linear-gradient(135deg,#1a0800,#1a1000)", padding:"24px 28px", borderBottom:"1px solid rgba(255,255,255,0.07)" },
    body: { padding:"24px 28px" },
    sec:  { marginBottom:22 },
    seclbl: { fontSize:11, fontWeight:700, color:"rgba(240,237,232,0.4)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:10, display:"block" },
    curr: (sel) => ({ background:sel?"rgba(232,83,58,0.08)":"rgba(255,255,255,0.04)", border:`1.5px solid ${sel?"#E8533A":"rgba(255,255,255,0.08)"}`, borderRadius:11, padding:"11px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all .15s" }),
    row:  { display:"flex", justifyContent:"space-between", fontSize:13.5, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)", color:"rgba(240,237,232,0.65)" },
    total:{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:900, color:"#F0EDE8", paddingTop:12, marginTop:4 },
    btn:  { width:"100%", background:"linear-gradient(135deg,#E8533A,#C47F17)", border:"none", color:"#fff", padding:15, borderRadius:13, fontSize:15, fontWeight:900, cursor:"pointer", boxShadow:"0 4px 20px rgba(232,83,58,.3)" },
    meth: { display:"flex", gap:6, flexWrap:"wrap", marginTop:10 },
    methTag: { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:6, padding:"4px 10px", fontSize:11.5, fontWeight:600, color:"rgba(240,237,232,0.6)" },
  };

  if (!order) return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:14, color:"rgba(240,237,232,0.5)" }}>Loading order...</div>
    </div>
  );

  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh" }}>
      <div style={s.wrap}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"rgba(240,237,232,0.4)", textTransform:"uppercase", letterSpacing:".07em" }}>Secure checkout</div>
          <div style={{ fontSize:22, fontWeight:900, color:"#F0EDE8", letterSpacing:"-.03em", marginTop:4 }}>🔒 Makola Digital</div>
        </div>

        <div style={s.card}>
          <div style={s.hdr}>
            <div style={{ fontSize:12, color:"rgba(240,237,232,0.4)", marginBottom:5 }}>You're buying</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#F0EDE8" }}>{order.listing_title || "Listing"}</div>
            <div style={{ fontSize:12, color:"rgba(240,237,232,0.5)", marginTop:4 }}>from {order.seller_name}</div>
          </div>

          <div style={s.body}>
            {/* Currency selector */}
            <div style={s.sec}>
              <span style={s.seclbl}>Pay in your currency</span>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
                {CURRENCIES.map(c => (
                  <button key={c.code} style={s.curr(currency===c.code)} onClick={() => setCurrency(c.code)}>
                    <span style={{ fontSize:20 }}>{c.flag}</span>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#F0EDE8" }}>{c.symbol} {c.code}</div>
                      <div style={{ fontSize:10.5, color:"rgba(240,237,232,0.45)" }}>{c.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway info */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ fontSize:20 }}>{gateway.logo}</span>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:"#F0EDE8" }}>Powered by {gateway.name}</div>
                  <div style={{ fontSize:11.5, color:"rgba(240,237,232,0.45)" }}>Secure · Encrypted · Africa-first</div>
                </div>
              </div>
              <div style={s.meth}>
                {gateway.methods.map(m => <span key={m} style={s.methTag}>{m}</span>)}
              </div>
            </div>

            {/* Order summary */}
            <div style={s.sec}>
              <span style={s.seclbl}>Order summary</span>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:11, padding:"14px 16px" }}>
                <div style={s.row}><span>Item price</span><span style={{ color:"#F0EDE8" }}>{selectedCurrency.symbol} {fees?.subtotal?.toLocaleString() || "—"}</span></div>
                <div style={s.row}><span>Platform fee (3%)</span><span>{selectedCurrency.symbol} {fees?.platformFee?.toLocaleString() || "—"}</span></div>
                {fees?.gatewayFee > 0 && <div style={s.row}><span>Processing fee</span><span>{selectedCurrency.symbol} {fees.gatewayFee?.toFixed(2)}</span></div>}
                <div style={s.total}><span>Total</span><span style={{ color:"#E8533A" }}>{selectedCurrency.symbol} {fees?.total?.toLocaleString() || "—"}</span></div>
              </div>
            </div>

            {/* Buyer protection */}
            <div style={{ background:"rgba(45,158,107,0.06)", border:"1px solid rgba(45,158,107,0.2)", borderRadius:11, padding:"12px 16px", marginBottom:20 }}>
              <div style={{ fontSize:13, color:"rgba(240,237,232,0.7)", lineHeight:1.6 }}>🛡️ <strong style={{ color:"#F0EDE8" }}>Makola Buyer Guarantee:</strong> Your payment is held in escrow until you confirm receipt. 7-day dispute window.</div>
            </div>

            {/* Pay button */}
            <button style={s.btn} onClick={handlePay} disabled={loading || !fees}>
              {loading ? "Redirecting to payment..." : `Pay ${selectedCurrency.symbol} ${fees?.total?.toLocaleString() || "..."} securely →`}
            </button>

            <div style={{ textAlign:"center", marginTop:14, fontSize:11.5, color:"rgba(240,237,232,0.3)" }}>
              Your payment is encrypted and processed by {gateway.name}.<br />
              Makola Digital never stores your card details.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
