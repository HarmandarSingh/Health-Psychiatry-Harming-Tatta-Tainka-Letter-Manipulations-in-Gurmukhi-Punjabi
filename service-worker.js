const CACHE_NAME = 'philfo-ai-cache-v12';
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
  
  // External CDNs
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Opened cache. Caching all app assets.');
        // Use a Set to avoid duplicates and cache all unique URLs.
        const urls = [...new Set(urlsToCache)];
        await Promise.all(
          urls.map((url) => {
            // For external resources, we need to create a Request with no-cors mode.
            const request = (url.startsWith('http'))
              ? new Request(url, { mode: 'no-cors' })
              : url;
            return cache.add(request).catch((reason) => {
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

  // Network-first strategy for CDN to get latest versions, with cache fallback.
  if (requestUrl.hostname === 'cdn.tailwindcss.com' || requestUrl.hostname === 'unpkg.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
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
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // --- MIME Type Fix for .tsx files ---
          if (requestUrl.pathname.endsWith('.tsx') || requestUrl.pathname.endsWith('.ts')) {
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

  // For other cross-origin requests (e.g., Google Ads, esm.sh), use a network-first strategy.
  // This ensures we get the latest versions but provides an offline fallback.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request).then(networkResponse => {
        // esm.sh can return opaque responses which can't be cloned. We cache them carefully.
        if (networkResponse.ok || networkResponse.type === 'opaque') {
            cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => cache.match(event.request));
    })
  );
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
