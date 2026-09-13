const CACHE_NAME = "kadappadi-directory-v2";
const CORE_ASSETS = ["./manifest.json", "./icon-192.png", "./icon-512.png", "./banner.jpg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Google Sheet data: always go to network, never cache
  if (url.includes("docs.google.com") || url.includes("googleusercontent.com")) {
    return;
  }

  // The page itself (index.html / navigation): network-first,
  // so updates show immediately. Falls back to cache only if offline.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Static assets (icons, manifest, banner): cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
