const CACHE_NAME = 'next-intl-pwa-v2';

// 1. Assets precacheados al instalar la PWA
const PRECACHE_ASSETS = ['/', '/manifest.webmanifest'];

// 2. Arreglo de extensiones de archivos estáticos
const STATIC_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.ico',
  '.webp',
  '.woff2',
  '.woff',
  '.ttf',
  '.css',
  '.js',
  '.json',
  '.webmanifest'
];

// 3. Arreglo de rutas estáticas locales
const STATIC_PATH_PREFIXES = ['/_next/static', '/icons'];

// 4. Arreglo de dominios externos de recursos estáticos (ej. fuentes)
const EXTERNAL_STATIC_HOSTS = ['fonts.gstatic.com', 'fonts.googleapis.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Navegación (HTML pages) -> Network-First (con fallback a caché para offline)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            if (response) return response;
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Comprobar si la petición pertenece a un asset estático utilizando los arreglos
  const isSameOrigin = url.origin === location.origin;

  const isStaticPrefix =
    isSameOrigin &&
    STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  const isStaticExtension =
    isSameOrigin &&
    STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));

  const isExternalStaticHost = EXTERNAL_STATIC_HOSTS.some((host) =>
    url.hostname.includes(host)
  );

  const isStaticAsset =
    isStaticPrefix || isStaticExtension || isExternalStaticHost;

  // Cachear ÚNICAMENTE archivos estáticos / assets
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});


