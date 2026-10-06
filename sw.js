const CACHE_NAME = 'rym-shell-v2';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/auth.js',
  './js/components.js',
  './js/content.js',
  './js/firebase-setup.js',
  './js/payment.js',
  './js/rules.js',
  './js/ui.js',
  './logo.webp',
  './icon.svg',
  './me.webp',
  './manifest.json'
];

// Pre-cache App Shell on Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache partial item skip:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Clean up stale caches on Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Handler with STRICT Firebase & Payment Bypass
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1. Only intercept http/https requests (strictly ignore chrome-extension://, data:, etc.)
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
    return;
  }

  const url = new URL(req.url);

  // 2. MUST NEVER intercept or cache Firebase, Google APIs, or Payment Gateway traffic
  if (
    url.hostname.includes('firebasedatabase.app') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('securetoken') ||
    url.hostname.includes('razorpay.com') ||
    req.method !== 'GET'
  ) {
    return; // Pass directly to native network
  }

  // 3. Network-First strategy with Cache Fallback for visited pages & assets
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, resClone).catch(() => {});
          }).catch(() => {});
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(req).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          // Fallback to home page if navigating
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
