export default function sitemap() {
  const base = "https://www.makoladigital.online";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sell`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/auth/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/auth/login`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog/how-to-sell-online-ghana-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/top-things-to-buy-sell-makola-digital`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/makola-digital-registered-ghanaian-company`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/delete-account`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/catalogue`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
