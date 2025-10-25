const CACHE_NAME = "grwh-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico"
  // add other static assets if needed (fonts, icons)
];

self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evt) => {
  // try cache first, fallback to network
  evt.respondWith(
    caches.match(evt.request).then((cached) => {
      if (cached) return cached;
      return fetch(evt.request)
        .then((res) => {
          // optionally cache new requests (only same-origin)
          if (evt.request.method === "GET" && res && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, clone));
          }
          return res;
        })
        .catch(() => {
          // fallback: return cached index.html for navigation
          if (evt.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});