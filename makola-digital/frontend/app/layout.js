import { Inter } from 'next/font/google';

export const metadata = {
  title: "Makola Digital — Africa's Marketplace",
  description: "Buy, sell and connect across Africa & the diaspora. Products, services, jobs and rentals.",
  manifest: "/manifest.json",
  themeColor: "#E8533A",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Makola Digital",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8533A" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
