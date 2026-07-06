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
  verification: {
    google: "Foh7ryhp5XimhfCtLesIbsRb2i1Btfdd3YBF4xhR4tI",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-VDFV4N6FRE"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-VDFV4N6FRE');` }} />
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
      <body style={{ background: "#0A0A0A", margin: 0 }}>{children}
        <script dangerouslySetInnerHTML={{ __html: `
          const VAPID_PUBLIC_KEY = 'BBveH9ySe5tjl-Dh1gf5JD07G9xHgxbG7wL9h5kf2Y9Bz2MWagzZiq0QVghmDPfAJ5ee52z_PuADgltnLl2SOkU';
          function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
          }
          async function registerPush() {
            try {
              const token = localStorage.getItem('makola_token');
              if (!token) return;
              navigator.serviceWorker.register('/sw.js').then(r => console.log('SW registered', r)).catch(e => console.log('SW error', e));
              if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
              const reg = await navigator.serviceWorker.ready;
              const permission = await Notification.requestPermission();
              if (permission !== 'granted') return;
              const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
              });
              await fetch('https://sparkling-charm-production-cb2c.up.railway.app/api/v1/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ subscription: sub })
              });
            } catch(e) { console.log('Push setup:', e.message); }
          }
          setTimeout(registerPush, 5000);
        `}} />
      </body>
    </html>
  );
}
