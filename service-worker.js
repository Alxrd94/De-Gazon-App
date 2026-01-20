/**
 * Service Worker for de Gazon App PWA
 * Handles caching and offline functionality
 */

const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `gazon-app-${CACHE_VERSION}`;

// Files to cache immediately on install
const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './src/css/variables.css',
    './src/css/reset.css',
    './src/css/main.css',
    './src/css/components.css',
    './src/js/app.js',
    './src/js/auth.js',
    './src/js/router.js',
    './src/js/storage.js',
    './src/js/utils.js',
    './src/js/photoAnalysis.js',
    './src/js/fertilizerPlanner.js',
    './src/js/loyalty.js',
    './src/pages/login.html',
    './src/pages/home.html',
    './src/pages/photo-analysis.html',
    './src/pages/fertilizer-planner.html',
    './src/pages/loyalty.html',
    '/src/assets/icons/icon-192x192.png',
    '/src/assets/icons/icon-512x512.png'
];

// Runtime cache name for dynamic content
const RUNTIME_CACHE = `gazon-app-runtime-${CACHE_VERSION}`;

/**
 * Install event - cache precache resources
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching app shell');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('[Service Worker] Skip waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Precaching failed:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete old cache versions
                            return cacheName.startsWith('gazon-app-') &&
                                   cacheName !== CACHE_NAME &&
                                   cacheName !== RUNTIME_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Claiming clients');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle different request types
    if (request.method === 'GET') {
        // Use cache-first strategy for app shell
        if (isAppShellRequest(url.pathname)) {
            event.respondWith(cacheFirst(request));
        }
        // Use network-first for HTML pages (to get updates)
        else if (request.headers.get('accept')?.includes('text/html')) {
            event.respondWith(networkFirst(request));
        }
        // Use cache-first for other static assets
        else {
            event.respondWith(cacheFirst(request));
        }
    }
});

/**
 * Check if request is for app shell
 * @param {string} pathname - Request pathname
 * @returns {boolean} True if app shell request
 */
function isAppShellRequest(pathname) {
    return PRECACHE_URLS.some(url => url === pathname);
}

/**
 * Cache-first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        console.log('[Service Worker] Cache hit:', request.url);
        return cached;
    }

    try {
        console.log('[Service Worker] Cache miss, fetching:', request.url);
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);

        // Return offline fallback if available
        return getOfflineFallback(request);
    }
}

/**
 * Network-first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response
 */
async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);

    try {
        console.log('[Service Worker] Network first:', request.url);
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        // Return offline fallback
        return getOfflineFallback(request);
    }
}

/**
 * Get offline fallback response
 * @param {Request} request - Original request
 * @returns {Promise<Response>} Fallback response
 */
async function getOfflineFallback(request) {
    // For HTML requests, return the cached index.html
    if (request.headers.get('accept')?.includes('text/html')) {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match('./index.html');
        if (fallback) {
            return fallback;
        }
    }

    // Return a basic offline response
    return new Response(
        JSON.stringify({
            error: 'Offline',
            message: 'Je bent offline. Sommige functies zijn beperkt.'
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }
    );
}

/**
 * Background sync event (for future use)
 */
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

/**
 * Sync data with server (placeholder for future implementation)
 */
async function syncData() {
    console.log('[Service Worker] Syncing data...');
    // TODO: Implement data sync logic
}

/**
 * Push notification event (for future use)
 */
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');

    const options = {
        body: event.data?.text() || 'Nieuwe update beschikbaar',
        icon: './src/assets/icons/icon-192x192.png',
        badge: './src/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('de Gazon App', options)
    );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('[Service Worker] Loaded');
