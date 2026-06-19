export const metadata = {
  title: "Makola Digital — Africa's Marketplace",
  description: "Buy, sell and connect across Africa & the diaspora. Products, services, jobs and rentals.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8533A" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Makola Digital" />
      </head>
      <body>{children}</body>
    </html>
  );
}
