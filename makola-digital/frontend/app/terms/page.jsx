"use client";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#E8533A", cursor: "pointer", fontSize: 14, marginBottom: 24 }}>← Back</button>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Terms & Conditions</h1>
        <p style={{ color: "rgba(240,237,232,0.5)", marginBottom: 32 }}>Last updated: June 2026</p>

        {[
          { title: "1. Acceptance of Terms", content: "By registering on Makola Digital, you agree to these Terms and Conditions. If you do not agree, please do not use our platform. Makola Digital reserves the right to update these terms at any time." },
          { title: "2. User Accounts", content: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account and password. Makola Digital will not be liable for any loss resulting from unauthorized use of your account." },
          { title: "3. Seller Responsibilities", content: "Sellers must provide accurate descriptions of their products and services. Sellers are responsible for the quality and delivery of items listed. False or misleading listings will result in immediate account suspension. Each ID number can only be linked to one account." },
          { title: "4. Buyer Responsibilities", content: "Buyers must conduct due diligence before making purchases. Always inspect products before payment where possible. Meet sellers in safe public places. Makola Digital is not responsible for transactions conducted outside the platform." },
          { title: "5. Prohibited Items", content: "The following are strictly prohibited: illegal goods or services, counterfeit products, weapons, drugs, adult content, and any items that violate Ghanaian law or the laws of the seller's country." },
          { title: "6. Fees & Payments", content: "Basic listings on Makola Digital are free. Premium features may attract fees which will be clearly communicated. Makola Digital does not currently process payments between buyers and sellers." },
          { title: "7. Privacy Policy", content: "Your personal information is collected solely for platform operations. We do not sell your data to third parties. Your phone number and email may be used to send you platform notifications and weekly updates. You may unsubscribe at any time." },
          { title: "8. Intellectual Property", content: "All content on Makola Digital including logos, designs, and text is owned by Makola Digital. Users may not copy or reproduce platform content without written permission." },
          { title: "9. Limitation of Liability", content: "Makola Digital is a marketplace platform and does not take responsibility for the quality of goods, services, or job listings posted by sellers. Disputes between buyers and sellers are handled through our dispute resolution system." },
          { title: "10. Governing Law", content: "These terms are governed by the laws of the Republic of Ghana. Any disputes shall be resolved under Ghanaian jurisdiction." },
          { title: "11. Contact Us", content: "For questions about these terms, contact us at hello@makoladigital.online or visit makoladigital.online." },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#E8533A", marginBottom: 8 }}>{section.title}</h3>
            <p style={{ fontSize: 14, color: "rgba(240,237,232,0.7)", lineHeight: 1.7 }}>{section.content}</p>
          </div>
        ))}

        <div style={{ background: "rgba(232,83,58,0.08)", border: "1px solid rgba(232,83,58,0.2)", borderRadius: 12, padding: 20, marginTop: 32 }}>
          <p style={{ fontSize: 13, color: "rgba(240,237,232,0.6)", margin: 0 }}>🌍 Makola Digital is Africa's trusted marketplace. By using our platform you agree to trade responsibly and contribute to a safe, thriving African economy.</p>
        </div>
      </div>
    </div>
  );
}
