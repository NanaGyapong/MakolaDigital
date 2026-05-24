// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  sw: "sw.js",                    // Use our custom SW (not generated)
  skipWaiting: false,             // We handle this manually for UX
  register: false,                // We register manually via hook
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  fallbacks: {
    document: "/offline",         // Offline fallback page
    image: "/icons/offline-img.png",
  },
  runtimeCaching: [],             // Defined in sw.js instead
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone for Docker
  output: "standalone",

  // Security headers
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        // PWA requires HTTPS in prod — handled by Nginx
      ],
    }, {
      // Service worker: no-cache header required
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    }, {
      // Manifest: short cache
      source: "/manifest.json",
      headers: [
        { key: "Cache-Control", value: "public, max-age=3600" },
        { key: "Content-Type", value: "application/manifest+json" },
      ],
    }];
  },

  images: {
    domains: ["res.cloudinary.com"],
    formats: ["image/webp", "image/avif"],
  },
};

module.exports = withPWA(nextConfig);
