// Service Worker implemented following advice given by coach Doug Brown
// Doug Brown: Webinar 1 https://www.youtube.com/watch?v=92dtrNU1GQc
// Doug Brown: Webinar 2: UPDATED - YouTube https://www.youtube.com/watch?v=Q2CJYf_XA58&feature=youtu.be

const staticCacheName = 'mws-restaurant-v6';
const mainAssets = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  // '/data/restaurants.json',
  // '/js/',
  '/js/main.js',
  '/js/dbhelper.js',
  '/js/restaurant_info.js',
  '/js/idb.js',
  '/manifest.webmanifest',
  '/img/icons/icon-72x72.png',
  '/img/icons/icon-96x96.png',
  '/img/icons/icon-128x128.png',
  '/img/icons/icon-144x144.png',
  '/img/icons/icon-152x152.png',
  '/img/icons/icon-192x192.png',
  '/img/icons/icon-384x384.png',
  '/img/icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(mainAssets);
    })
  );
});

// Delete old cache(s) so that only latest will be available
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('mws-restaurant') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// //  If request is not already in cache,
self.addEventListener('fetch', function(event) {
if (!event.request.url.includes('restaurants')) {
  // console.log('sw caching', event.request.url);
  let cacheRequest = event.request;
  // Check if `restaurant.html` is anywhere in the requested URL. If it is, respond with the `restaurant.html` page.
  let restPage = 'restaurant.html';
  if (cacheRequest.url.indexOf(restPage) > -1) {
    cacheRequest = new Request(restPage);
  }
//
// //
  event.respondWith(caches.match(cacheRequest)
    // Problem previously caused by missing parentheses for event.respondWith caches.match(cacheRequest).
    // This was fixed after reciving advice from coach Doug Brown.
    //  If request already in the cache, return it.  If not, fetch it, clone it, put the clone in the cache and return it.
    .then(function(response) {
      return response || fetch(cacheRequest)
      .then(function(nextResponse) {
        return caches.open(staticCacheName)
        .then(function(cache) {
          cache.put(cacheRequest, nextResponse.clone());
          return nextResponse;
          });
      });
    }));
  }
});
