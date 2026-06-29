"use client";
import { useRouter } from "next/navigation";

const posts = [
  {
    "slug": "how-to-sell-online-ghana-2026",
    "title": "How to Sell Your Products Online in Ghana in 2026",
    "excerpt": "A step-by-step guide to selling anything online in Ghana — from phones to fashion to services.",
    "date": "June 28, 2026",
    "readTime": "5 min read",
    "category": "Seller Tips"
  },
  {
    "slug": "top-things-to-buy-sell-makola-digital",
    "title": "Top 10 Things to Buy and Sell on Makola Digital",
    "excerpt": "From smartphones to fashion, these are the most popular categories on Ghana's newest marketplace.",
    "date": "June 27, 2026",
    "readTime": "4 min read",
    "category": "Marketplace"
  },
  {
    "slug": "makola-digital-registered-ghanaian-company",
    "title": "Makola Digital is Now an Officially Registered Ghanaian Company",
    "excerpt": "Makola Digital Technologies Ltd is now officially registered in Ghana — a major milestone for Africa's marketplace.",
    "date": "June 23, 2026",
    "readTime": "3 min read",
    "category": "Company News"
  }
];

export default function BlogPage() {
  const router = useRouter();
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE8", fontFamily: "sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#E8533A", cursor: "pointer", fontSize: 20 }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 16 }}>🌍 Makola Digital</div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-block", background: "rgba(232,83,58,0.12)", border: "1px solid rgba(232,83,58,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#E8533A", marginBottom: 12, fontWeight: 500 }}>BLOG</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>Makola Digital Blog</h1>
          <p style={{ color: "rgba(240,237,232,0.5)", fontSize: 15, margin: 0 }}>Tips, news and insights from Africa's marketplace</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {posts.map(post => (
            <div key={post.slug} onClick={() => router.push("/blog/" + post.slug)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, cursor: "pointer", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ background: "rgba(232,83,58,0.12)", border: "1px solid rgba(232,83,58,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#E8533A", fontWeight: 700 }}>{post.category}</span>
                <span style={{ fontSize: 11, color: "rgba(240,237,232,0.4)" }}>{post.date} · {post.readTime}</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.3 }}>{post.title}</h2>
              <p style={{ fontSize: 14, color: "rgba(240,237,232,0.6)", margin: "0 0 16px", lineHeight: 1.6 }}>{post.excerpt}</p>
              <span style={{ color: "#E8533A", fontSize: 13, fontWeight: 700 }}>Read more →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
