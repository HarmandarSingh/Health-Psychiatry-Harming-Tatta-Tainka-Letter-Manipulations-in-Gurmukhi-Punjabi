const CACHE_NAME = 'philfo-ai-cache-v13';
const urlsToCache = [
  // Essential App Shell
  './',
  './index.html',
  './manifest.json',
  './index.css',

  // Core scripts
  './index.tsx',
  './App.tsx',
  './LanguageContext.tsx',
  './translations.ts',
  './types.ts',
  './constants.ts',

  // Services
  './services/geminiService.ts',

  // Components
  './components/Header.tsx',
  './components/Introduction.tsx',
  './components/ElementsExplorer.tsx',
  './components/GurmukhiMatrix.tsx',
  './components/CymaticsVisualizer.tsx',
  './components/ConceptExplainer.tsx',
  './components/AiStreamsVisualizer.tsx',
  './components/UniverseSimulator.tsx',
  './components/BusinessModelSimulator.tsx',
  './components/ResearchLibrary.tsx',
  './components/ShareAndConnect.tsx',
  './components/Journal.tsx',
  './components/AdsenseUnit.tsx',
  './components/LoadingSpinner.tsx',
  './components/MarkdownRenderer.tsx',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Opened cache. Caching app shell assets.');
        // Don't cache external assets during install, focus on the app shell
        await cache.addAll(urlsToCache).catch(err => {
            console.error("Failed to cache app shell:", err);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Don't intercept non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignore Google Ads requests completely and let the browser handle them.
  if (requestUrl.hostname === 'pagead2.googlesyndication.com') {
    return;
  }

  // Network-first strategy for CDN to get latest versions, with cache fallback.
  if (requestUrl.hostname === 'cdn.tailwindcss.com' || requestUrl.hostname === 'unpkg.com' || requestUrl.hostname === 'esm.sh') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request).then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
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
          // If the network request fails, we can't do anything.
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Clone the response to use in the cache
          const responseToCache = networkResponse.clone();

          // --- MIME Type Fix for .tsx/.ts files ---
          if (requestUrl.pathname.endsWith('.tsx') || requestUrl.pathname.endsWith('.ts')) {
            const body = await responseToCache.text();
            const headers = new Headers(responseToCache.headers);
            headers.set('Content-Type', 'application/javascript');
            
            const fixedResponse = new Response(body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers,
            });
            
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, fixedResponse);
          } else {
            // For all other same-origin files, cache them as is.
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, responseToCache);
          }

          return networkResponse;
        }).catch(error => {
            console.error('Fetching from network failed:', error);
            // Optionally, return a fallback page here
        });
      })
    );
    return;
  }
  
  // For any other requests, just let them go to the network.
  return;
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