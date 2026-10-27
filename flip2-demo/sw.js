const CACHE_NAME = "flip2-shaimaa-demo-v1";
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(new Request(new URL("./", self.registration.scope), {cache:"reload"}));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req) || await cache.match(new URL("./", self.registration.scope).href);
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      if (cached) return cached;
      throw e;
    }
  })());
});