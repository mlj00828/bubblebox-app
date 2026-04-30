// BubbleBox service worker
// Minimal: just enables installability + offline fallback for the home page.
// We don't aggressively cache because the booking form needs to hit a live API.

const CACHE_NAME = "bubblebox-v1";
const OFFLINE_URLS = ["/", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .catch(() => {
        // If the offline page doesn't exist, install still succeeds
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET navigation requests
  if (event.request.method !== "GET") return;
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match("/offline.html").then((res) => res || caches.match("/"))
    )
  );
});
