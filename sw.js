const CACHE_NAME = "sda-solfa-v2";

const FILES_TO_CACHE = [
  "/",
  "index.html",
  "index-ii.html",
  "style.css",
  "script.js",
  "manifest.json",

  "sdalogo.png",
  "sdalogo.jpg",
  "bg-image-1.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});