// service-worker.js
const CACHE = 'etunganun-v3'; // bump this every time you deploy breaking UI changes
const ASSETS = [
  'index.html','shop.html','style.css','app.js','manifest.webmanifest',
  'images/placeholders/fallback.svg','images/placeholders/coming-soon.jpg'
];

// Install: pre-cache core assets, take control fast
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

// Activate: drop old caches immediately
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys
      .filter(k=>k!==CACHE)
      .map(k=>caches.delete(k)))))
  ;
  self.clients.claim();
});

// Network-first for HTML; cache-first for others
self.addEventListener('fetch', e=>{
  const req = e.request;
  if (req.method !== 'GET') return;
  // avoid extensions
  if (req.url.startsWith('chrome-extension')) return;

  const isHTML = req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network first for pages to get fresh deploys
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match(req).then(r=>r || caches.match('index.html')))
    );
  } else {
    // Cache first for static assets
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match('images/placeholders/fallback.svg')))
    );
  }
});
