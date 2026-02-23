/// <reference lib="webworker" />

// Service Worker for 집콕신혼 PWA
// Cache strategy: static assets → cache-first, API/pages → network-first

const CACHE_VERSION = "jibkok-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const PRECACHE_URLS = ["/", "/offline"];

// Install: precache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, chrome-extension
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.protocol === "chrome-extension:"
  ) {
    return;
  }

  // API routes → network-first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Next.js static assets → cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(svg|png|jpg|jpeg|webp|woff2?|css|js)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages → network-first with offline fallback
  event.respondWith(networkFirstWithOffline(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback page
    const offlinePage = await caches.match("/offline");
    return offlinePage || new Response("오프라인 상태입니다.", {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
