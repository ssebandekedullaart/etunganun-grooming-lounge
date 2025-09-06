// service-worker.js
const CACHE_NAME = "egl-catalogue-v2"; // bump when you change this file
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./images/logo.png",
  "./images/magnificently-dubai.jpg",
  "./images/for-him-intense.jpg",
  "./images/800-black.jpg",
  "./images/tobacco-collection-intense-dark-exclusive.jpg",
  "./images/oud-vibrant-leather.jpg"
];

// Precache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // activate new SW sooner
});

// Claim pages immediately after activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// Safe fetch handler
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only cache GET requests
  if (req.method !== "GET") return;

  // Workaround for Chrome bug with only-if-cached + no-cors
  // (occurs with some extension-injected requests)
  if (req.cache === "only-if-cached" && req.mode !== "same-origin") return;

  const url = new URL(req.url);

  // Only handle same-origin http(s) requests (skip chrome-extension, data:, blob:, etc.)
  const isHTTP = url.protocol === "http:" || url.protocol === "https:";
  const isSameOrigin = url.origin === self.location.origin;
  if (!isHTTP || !isSameOrigin) return;

  // (Optional) ignore URLs you never want to cache
  // if (/\/(__analytics|__debug)\//.test(url.pathname)) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((resp) => {
          // Cache a copy of successful basic same-origin responses
          const ok = resp && resp.status === 200;
          const cacheableType = resp.type === "basic"; // same-origin
          if (ok && cacheableType) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return resp;
        })
        .catch(() => caches.match("./")); // offline fallback to home
    })
  );
});
