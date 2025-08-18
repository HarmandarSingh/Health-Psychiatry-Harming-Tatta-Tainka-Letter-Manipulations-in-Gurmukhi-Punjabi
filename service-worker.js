const CACHE_NAME = 'philfo-ai-cache-v11';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './index.css'
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

  // Network-first strategy for Tailwind CSS CDN to improve offline resilience.
  if (requestUrl.hostname === 'cdn.tailwindcss.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request).then(networkResponse => {
          // If fetch is successful, cache the new response and return it
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // If fetch fails (e.g., offline), try to get it from the cache
          console.log(`Network failed for ${requestUrl}, serving from cache.`);
          return cache.match(event.request);
        });
      })
    );
    return;
  }

  // Cache-first, network-fallback strategy for our own origin requests.
  if (requestUrl.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(async (networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // --- MIME Type Fix for .tsx files ---
          if (requestUrl.pathname.endsWith('.tsx')) {
            const body = await networkResponse.text();
            const headers = new Headers(networkResponse.headers);
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
    return;
  }

  // For other cross-origin requests (e.g., Google Ads), let the browser handle them.
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