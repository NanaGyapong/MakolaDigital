const API = process.env.NEXT_PUBLIC_API_URL;

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API}/listings/${params.id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const l = data.listing;
    const img = data.images?.[0]?.url || "https://www.makoladigital.online/icon-512.png";

    if (!l) return { title: "Listing | Makola Digital" };

    const price = l.price ? `${l.price_currency} ${Number(l.price).toLocaleString()}` : "";
    const title = `${l.title}${price ? ` — ${price}` : ""} | Makola Digital`;
    const description = l.description
      ? l.description.slice(0, 160)
      : `Buy ${l.title} on Makola Digital — Ghana's free online marketplace.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://www.makoladigital.online/listing/${params.id}`,
        siteName: "Makola Digital",
        images: [{ url: img, width: 800, height: 600, alt: l.title }],
        type: "website",
        locale: "en_GH",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [img],
      },
    };
  } catch {
    return { title: "Listing | Makola Digital" };
  }
}

export default function ListingLayout({ children }) {
  return children;
}
