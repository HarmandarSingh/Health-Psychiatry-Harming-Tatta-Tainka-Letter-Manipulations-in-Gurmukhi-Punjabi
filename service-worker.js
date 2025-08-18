const CACHE_NAME = 'philfo-ai-cache-v17';
const urlsToCache = [
  // This list should be kept in sync with project files.
  './',
  './index.html',
  './manifest.json',
  './index.css',
  './index.tsx',
  './App.tsx',
  './LanguageContext.tsx',
  './translations.ts',
  './types.ts',
  './constants.ts',
  './services/geminiService.ts',
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

/**
 * Fetches a request, fixes the MIME type for TS/TSX files,
 * puts the response in the cache, and returns the original network response.
 * @param {Request} request - The request to fetch.
 * @param {Cache} cache - The cache instance to store the response.
 * @returns {Promise<Response>} The original network response.
 */
const fetchAndCacheWithMimeFix = async (request, cache) => {
  // Always go to the network for updates, bypassing the HTTP cache.
  const networkResponse = await fetch(request, { cache: 'reload' });

  // Check if we received a valid response
  if (networkResponse && networkResponse.ok) {
    const responseToCache = networkResponse.clone();
    const url = new URL(request.url);

    // Critical MIME type fix for Netlify and other static hosts
    if (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts')) {
      const body = await responseToCache.text();
      const headers = new Headers(responseToCache.headers);
      headers.set('Content-Type', 'application/javascript');
      
      const fixedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });
      // Put the response with the corrected MIME type into the cache
      await cache.put(request, fixedResponse);
    } else {
      // For all other files, cache them as is
      await cache.put(request, responseToCache);
    }
  } else if (networkResponse) {
     console.warn(`Skipping cache for ${request.url}. Status: ${networkResponse.status}`);
  }

  return networkResponse;
};


// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching app shell assets individually for resilience.');
        const promises = urlsToCache.map(urlToCache => {
          const request = new Request(urlToCache);
          return fetchAndCacheWithMimeFix(request, cache).catch(err => {
            console.warn(`Failed to cache ${urlToCache}:`, err);
          });
        });
        return Promise.all(promises);
      })
  );
});

// Activate event: clean up old caches
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


// Fetch event: serve from cache, fall back to network, and update cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and ad-related requests
  if (request.method !== 'GET' || url.hostname.includes('googlesyndication.com') || url.hostname.includes('googleadservices.com')) {
    return;
  }

  // Use a "Cache first, then network" strategy.
  // This is fast and ensures offline functionality.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Return the cached response if it exists.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from the network.
      // The fetch will also update the cache for next time.
      return caches.open(CACHE_NAME).then(cache => {
        return fetchAndCacheWithMimeFix(request, cache);
      }).catch(error => {
        console.error(`Service Worker fetch failed for ${request.url}:`, error);
        // This is where you might want to return an offline fallback page,
        // but for now, we'll let the browser handle the error.
        throw error;
      });
    })
  );
});