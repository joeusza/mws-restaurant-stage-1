self.importScripts('/js/idb.js');

const staticCacheName = 'mws-restaurant-v1';
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
  '/js/idb.js'
];

function createRestDB() {
  idb.open('rest-db', 1, upgradeDb => {
    upgradeDb.createObjectStore('restaurants', {keypath: 'id'});
  });
}

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
    createRestDB()
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
    // problem previously caused by missing parentheses for event.respondWith caches.match(cacheRequest)
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
