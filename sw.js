const staticCacheName = 'mws-restaurant-v12';
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
  'js/idb.js'
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


//  If request is not already in cache,
// self.addEventListener('fetch', function(event) {
//   // console.log(event.request);
//   let cacheRequest = event.request;
//   // Check if `restaurant.html` is anywhere in the requested URL. If it is, respond with the `restaurant.html` page.
//   let restPage = 'restaurant.html';
//   if (cacheRequest.url.indexOf(restPage) > -1) {
//     cacheRequest = new Request(restPage);
//   }
//
//   event.respondWith(
//     caches.match(cacheRequest)
//     //  If request already in the cache, return it.  If not, fetch it, clone it, put the clone in the cache and return it.
//     .then(function(response) {
//       return response || fetch(cacheRequest)
//       .then(function(nextResponse) {
//         return caches.open(staticCacheName)
//         .then(function(cache) {
//           cache.put(cacheRequest, nextResponse.clone());
//           return nextResponse;
//           });
//       });
//     })
//   );
// });
