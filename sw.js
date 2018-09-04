const staticCacheName = 'mws-restaurant-v9';
const mainAssets = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/data/restaurants.json',
  '/js/',
  '/js/main.js',
  '/js/dbhelper.js',
  '/js/restaurant_info.js',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(mainAssets);
    })
  );
});

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

self.addEventListener('fetch', function(event) {
  // console.log(event.request);
  let cacheRequest = event.request;
  let restPage = 'restaurant.html';
  if (cacheRequest.url.indexOf(restPage) > -1) {
    cacheRequest = new Request(restPage);
  }

  event.respondWith(
    caches.match(cacheRequest)
    .then(function(response) {
      return response || fetch(cacheRequest)
      .then(function(nextResponse) {
        return caches.open(staticCacheName)
        .then(function(cache) {
          cache.put(cacheRequest, nextResponse.clone());
          return nextResponse;
          });
      });
    })
  );
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//     .then(function(response) {
//       if (response) return response;
//         let requestClone = event.request.clone();
//           return fetch(requestClone)
//           .then(function(response) {
//             if (!response) return response;
//             let responseClone = response.clone();
//             caches.open(staticCacheName)
//             .then(function(cache) {
//               cache.put(event.request, responseClone);
//               return response;
//             });
//             });
//     })
//   );
// });
      // if (response) {return response}
      // let requestClone = event.request.clone();
      // return fetch(requestClone)
      // .then(function(response) {
      //   if (!response) return response;
      //   let responseClone = response.clone();
      //   caches.open(staticCacheName).then(function(cache) {
      //     cache.put(event.request, responseClone);
      //     return response;
      //   });
      // });
    // });
  // );
