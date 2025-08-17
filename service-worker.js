const CACHE_NAME = 'philfo-ai-cache-v4';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'index.tsx',
  'App.tsx',
  'types.ts',
  'constants.ts',
  'LanguageContext.tsx',
  'translations.ts',
  'services/geminiService.ts',
  'components/Header.tsx',
  'components/LoadingSpinner.tsx',
  'components/Introduction.tsx',
  'components/ElementsExplorer.tsx',
  'components/GurmukhiMatrix.tsx',
  'components/CymaticsVisualizer.tsx',
  'components/ConceptExplainer.tsx',
  'components/AiStreamsVisualizer.tsx',
  'components/UniverseSimulator.tsx',
  'components/BusinessModelSimulator.tsx',
  'components/ResearchLibrary.tsx',
  'components/Journal.tsx',
  'components/ShareAndConnect.tsx',
  'components/AdsenseUnit.tsx',
  'components/MarkdownRenderer.tsx'
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
  // Only handle GET requests.
  if (event.request.method !== 'GET') {
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
            if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
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