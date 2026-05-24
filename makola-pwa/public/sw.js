// Makola Digital Service Worker v1.0
// Strategies: Cache-first (static), Network-first (API), Stale-while-revalidate (pages)

const CACHE_VERSION = "v1.2.0";
const STATIC_CACHE  = `makola-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `makola-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE   = `makola-images-${CACHE_VERSION}`;
const API_CACHE     = `makola-api-${CACHE_VERSION}`;

// ── Assets to pre-cache on install ──────────────────────────
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/_next/static/css/app.css",
];

// ── Cache size limits ────────────────────────────────────────
const CACHE_LIMITS = {
  [DYNAMIC_CACHE]: 60,
  [IMAGE_CACHE]:   100,
  [API_CACHE]:     30,
};

// ── INSTALL ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k.startsWith("makola-") && ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE].includes(k))
            .map(k => caches.delete(k))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, ws://
  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  // ── API requests: Network-first with cache fallback ────────
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, 5000));
    return;
  }

  // ── Images: Cache-first ────────────────────────────────────
  if (request.destination === "image" || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    event.respondWith(cacheFirstWithNetwork(request, IMAGE_CACHE));
    return;
  }

  // ── Static Next.js assets: Cache-first forever ─────────────
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirstForever(request));
    return;
  }

  // ── Pages: Stale-while-revalidate ──────────────────────────
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ══════════════════════════════════════════════════════════════
// CACHING STRATEGIES
// ══════════════════════════════════════════════════════════════

// Network-first: try network, fall back to cache, then offline page
async function networkFirstWithCache(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      cache.put(request, response.clone());
      await trimCache(cacheName);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // API fallback — return structured error
    if (request.url.includes("/api/")) {
      return new Response(
        JSON.stringify({ message: "You appear to be offline. Please check your connection.", offline: true }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
    return caches.match("/offline") || new Response("Offline", { status: 503 });
  }
}

// Cache-first: serve from cache, update in background
async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await trimCache(cacheName);
    }
    return response;
  } catch {
    return new Response("Image unavailable offline", { status: 503 });
  }
}

// Cache-first forever (immutable assets with content hash in URL)
async function cacheFirstForever(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

// Stale-while-revalidate: serve cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(cacheName);
    }
    return response;
  }).catch(() => cached || caches.match("/offline"));

  return cached || fetchPromise;
}

// Trim cache to limit size
async function trimCache(cacheName) {
  const limit = CACHE_LIMITS[cacheName];
  if (!limit) return;

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > limit) {
    await cache.delete(keys[0]);
  }
}

// ══════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: "Makola Digital", body: event.data.text() }; }

  const {
    title = "Makola Digital",
    body = "",
    icon = "/icons/icon-192.png",
    badge = "/icons/badge-72.png",
    image,
    tag,
    url = "/",
    actions = [],
    data = {},
  } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      image,
      tag,
      data: { url, ...data },
      actions,
      vibrate: [100, 50, 100],
      requireInteraction: payload.requireInteraction || false,
    })
  );
});

// ── Notification click ───────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";
  const action = event.action;

  let targetUrl = url;
  if (action === "reply") targetUrl = url.includes("/messages") ? url : "/messages";
  if (action === "view") targetUrl = url;
  if (action === "dismiss") return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new tab
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── Background sync (retry failed actions) ───────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-messages") {
    event.waitUntil(syncPendingMessages());
  }
  if (event.tag === "sync-saves") {
    event.waitUntil(syncPendingSaves());
  }
});

async function syncPendingMessages() {
  // In real implementation: read from IndexedDB and retry failed sends
  console.log("[SW] Syncing pending messages...");
}

async function syncPendingSaves() {
  console.log("[SW] Syncing pending saves...");
}

// ── Periodic background sync (pre-fetch new listings) ────────
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "update-listings") {
    event.waitUntil(
      fetch("/api/v1/listings?limit=20&sort=newest")
        .then(r => r.json())
        .then(data => {
          // Cache the results for offline browsing
          console.log("[SW] Pre-fetched", data.listings?.length, "new listings");
        })
        .catch(() => {})
    );
  }
});

// ── Message from main thread ─────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CACHE_URLS") {
    const { urls } = event.data;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => cache.addAll(urls))
    );
  }
  if (event.data?.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(
        keys.filter(k => k.startsWith("makola-dynamic")).map(k => caches.delete(k))
      ))
    );
  }
});
