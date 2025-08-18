const CACHE_NAME = 'philfo-ai-cache-v15';
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching app shell assets individually.');
        const promises = urlsToCache.map(urlToCache => {
          return cache.add(urlToCache).catch(err => {
            console.warn(`Failed to cache ${urlToCache}:`, err);
          });
        });
        return Promise.all(promises);
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // For non-GET requests or requests to different origins (CDNs, ads),
  // do not use the service worker. Let the browser handle it.
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // For same-origin requests, use a cache-first strategy.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then(async networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);

        // --- MIME Type Fix for .tsx/.ts files ---
        if (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts')) {
          const body = await responseToCache.text();
          const headers = new Headers(responseToCache.headers);
          // This is the crucial fix for in-browser Babel with TSX
          headers.set('Content-Type', 'application/javascript');
          
          const fixedResponse = new Response(body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers,
          });
          
          await cache.put(request, fixedResponse);
        } else {
          await cache.put(request, responseToCache);
        }

        return networkResponse;
      }).catch(error => {
        console.error(`Fetch failed for ${request.url}:`, error);
        // If fetch fails (e.g., offline), we don't have it in cache,
        // so we can't do anything. The browser will show its offline error page.
        throw error;
      });
    })
  );
});