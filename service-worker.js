const CACHE_NAME = 'philfo-ai-cache-v10';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Opened cache. Caching app shell assets individually.');
        await Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url).catch((reason) => {
              console.warn(`Failed to cache ${url}: ${reason}`);
            });
          })
        );
      })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Don't intercept non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For requests to our own origin, use a cache-first, network-fallback strategy.
  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // If we have a match in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network.
        return fetch(event.request).then(async (networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // --- MIME Type Fix for .tsx files ---
          // Some servers may serve .tsx files with an incorrect MIME type
          // ('application/octet-stream'), which causes browsers to block them.
          // We intercept the response and create a new one with the correct header.
          if (requestUrl.pathname.endsWith('.tsx')) {
            const body = await networkResponse.text();
            const headers = new Headers(networkResponse.headers);
            // We set the Content-Type to 'application/javascript' because after
            // Babel's transformation, that's what the browser will execute.
            headers.set('Content-Type', 'application/javascript');
            
            const responseToCache = new Response(body, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: headers,
            });
            
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, responseToCache.clone());
            
            return responseToCache;
          }

          // For all other same-origin files, cache them as is.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
    );
  }
  // For cross-origin requests (e.g., Google Ads, CDNs), we do not call
  // event.respondWith(). This lets the browser handle the request normally,
  // preventing service worker interference and network errors.
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
