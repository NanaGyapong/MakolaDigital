export const metadata = {
  metadataBase: new URL("https://www.makoladigital.online"),
  title: {
    default: "Makola Digital — Buy & Sell in Ghana | Africa's Free Online Marketplace",
    template: "%s | Makola Digital",
  },
  description: "Makola Digital is Ghana and Africa's free online marketplace. Buy and sell phones, electronics, fashion, beauty products, cars, jobs, services & more. List for free, verified sellers, WhatsApp chat.",
  keywords: ["Makola Digital", "Makola market online", "buy and sell Ghana", "Ghana marketplace", "Tonaton alternative", "Jiji Ghana", "online shopping Ghana", "sell online Ghana", "Accra marketplace", "African marketplace", "free classifieds Ghana"],
  authors: [{ name: "Makola Digital Technologies Ltd" }],
  creator: "Makola Digital Technologies Ltd",
  publisher: "Makola Digital Technologies Ltd",
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://www.makoladigital.online",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://www.makoladigital.online",
    siteName: "Makola Digital",
    title: "Makola Digital — Buy & Sell in Ghana | Africa's Free Marketplace",
    description: "Ghana's free online marketplace. Buy and sell phones, electronics, fashion, cars, jobs & more. Verified sellers, WhatsApp chat, list for free.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Makola Digital Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Makola Digital — Buy & Sell in Ghana",
    description: "Africa's free online marketplace. Buy, sell & connect across Ghana and beyond.",
    images: ["/icon-512.png"],
    site: "@makoladigitalon",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8533A" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Makola Digital" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Makola Digital",
              alternateName: "Makola Digital Technologies Ltd",
              url: "https://www.makoladigital.online",
              logo: "https://www.makoladigital.online/icon-512.png",
              description: "Africa's free online marketplace for buying and selling products, services, jobs and rentals.",
              sameAs: [
                "https://www.instagram.com/makoladigital",
                "https://x.com/makoladigitalon",
                "https://www.facebook.com/MakolaDigital",
                "https://www.linkedin.com/company/makoladigital",
              ],
              address: {
                "@type": "PostalAddress",
                addressCountry: "GH",
                addressLocality: "Accra",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Makola Digital",
              url: "https://www.makoladigital.online",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.makoladigital.online/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
