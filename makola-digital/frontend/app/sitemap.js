export default function sitemap() {
  const base = "https://www.makoladigital.online";
  const now = new Date();

  // Dynamic blog posts (served via /blog/[slug])
  const blogSlugs = [
    "graduate-jobs-ghana-2026",
    "best-online-marketplaces-ghana-2026",
    "best-online-marketplaces-nigeria-2026",
    "best-places-to-rent-in-accra-2026",
    "side-hustles-for-students-ghana-2026",
    "student-hostels-legon-upsa-wisconsin-accra-2026",
    "how-to-rent-apartment-accra-ghana-2026",
    "how-to-buy-hybrid-car-ghana-2026",
    "how-to-buy-chinese-car-ghana-2026",
    "how-to-sell-online-ghana-2026",
    "top-things-to-buy-sell-makola-digital",
    "makola-digital-registered-ghanaian-company",
    "best-places-buy-second-hand-phones-ghana-2026",
    "how-to-spot-fake-sellers-online-ghana",
    "top-ways-make-money-online-ghana-2026",
    // Static blog routes in /app/blog/[slug-folder]/
    "best-free-classifieds-ghana-2026",
    "best-marketplace-app-west-africa-2026",
    "buy-sell-accra-online-2026",
    "buy-used-cars-ghana-2026",
    "cheap-smartphones-accra-2026",
    "free-job-listings-ghana-2026",
    "jiji-ghana-alternative-2026",
    "makola-digital-on-google-play-store",
    "tonaton-alternative-ghana-2026",
  ];

  const blogEntries = blogSlugs.map(slug => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sell`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/auth/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/auth/login`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...blogEntries,
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/delete-account`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/catalogue`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/category`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/category/fashion`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/electronics`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/home-garden`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/beauty-health`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/food-beverages`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/agriculture`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/animals-pets`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/arts-crafts`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/vehicles`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/property`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/business-services`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/tech-digital`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/education`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/category/home-services`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];
}
