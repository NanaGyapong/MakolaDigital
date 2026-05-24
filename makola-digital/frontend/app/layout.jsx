export const metadata = { title: "Makola Digital", description: "Africa's marketplace" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
