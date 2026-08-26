const CACHE_NAME = "sda-solfa-v10";

const APP_FILES = [
    "/",
    "index.html",
    "index-ii.html",
    "style.css",
    "script.js",
    "manifest.json",
    "sdalogo.png",
    "sdalogo.jpg",
    "1.mp3"
    
];


//================================
// INSTALL
//================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(APP_FILES);
        })

    );

    self.skipWaiting();

});


//================================
// ACTIVATE
//================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }

                })

            );

        })

    );

    self.clients.claim();

});


//================================
// FETCH
//================================

self.addEventListener("fetch", event => {

    const request = event.request;

    // Only handle GET requests
    if (request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(request).then(cachedResponse => {

            // Already cached
            if (cachedResponse) {
                return cachedResponse;
            }


            return fetch(request).then(networkResponse => {

                // Cache MP3 files after first successful load
                if (
                    request.url.includes("/audio/") &&
                    request.url.endsWith(".mp3")
                ) {

                    const responseClone =
                        networkResponse.clone();

                    caches.open(CACHE_NAME).then(cache => {

                        cache.put(
                            request,
                            responseClone
                        );

                    });

                }

                return networkResponse;

            });

        })

    );

});
