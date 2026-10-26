// Cambiar VERSION en cada publicación para que los celulares bajen la versión nueva.
const VERSION = "gira-2026-10-26-9";
const ARCHIVOS = ["./", "index.html", "manifest.webmanifest", "icons/gira-logo-2.png", "icons/gira-icon-192.png", "icons/gira-icon-512.png", "icons/gira-maskable-512.png", "icons/gira-apple-touch-icon.png", "fonts/anton.woff2", "fonts/great-vibes.woff2", "fonts/montserrat-400.woff2", "fonts/montserrat-500.woff2", "fonts/montserrat-600.woff2", "fonts/montserrat-700.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// La página: primero la red (para ver cambios), si no hay datos usa la guardada.
// Lo demás (fuentes, íconos): primero lo guardado.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req.url, { cache: "no-cache" })
      .then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put("index.html", copia)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
