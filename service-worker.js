const CACHE_NAME = "egl-catalogue-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  // images
  "./images/logo.png",
  "./images/magnificently-dubai.jpg",
  "./images/for-him-intense.jpg",
  "./images/800-black.jpg",
  "./images/tobacco-collection-intense-dark-exclusive.jpg",
  "./images/oud-vibrant-leather.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(resp => {
        if (e.request.method === "GET" && resp.status === 200 && !resp.headers.get("Cache-Control")?.includes("no-store")) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => caches.match("./"));
    })
  );
});
