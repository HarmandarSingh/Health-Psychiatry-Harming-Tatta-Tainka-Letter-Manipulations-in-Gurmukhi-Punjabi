const CACHE_NAME = 'philfo-ai-cache-v6';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'index.jsx',
  'App.jsx',
  'types.js',
  'constants.js',
  'LanguageContext.jsx',
  'translations.js',
  'services/geminiService.js',
  'components/Header.jsx',
  'components/LoadingSpinner.jsx',
  'components/Introduction.jsx',
  'components/ElementsExplorer.jsx',
  'components/GurmukhiMatrix.jsx',
  'components/CymaticsVisualizer.jsx',
  'components/ConceptExplainer.jsx',
  'components/AiStreamsVisualizer.jsx',
  'components/UniverseSimulator.jsx',
  'components/BusinessModelSimulator.jsx',
  'components/ResearchLibrary.jsx',
  'components/Journal.jsx',
  'components/ShareAndConnect.jsx',
  'components/AdsenseUnit.jsx',
  'components/MarkdownRenderer.jsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching initial assets');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Only handle GET requests and requests for our own origin.
  // This prevents the service worker from trying to handle
  // cross-origin requests for things like Google Ads or the Tailwind CDN,
  // which would fail when offline.
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
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