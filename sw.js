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
    switch(upgradeDb.oldVersion) {
      case 0:
      upgradeDb.createObjectStore('restaurants', {keypath: 'id'});
    }
  });
}



self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(mainAssets);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    createRestDB()
    );
  });
// Delete old cache(s) so that only latest will be available
//   event.waitUntil(
//     caches.keys().then(function(cacheNames) {
//       return Promise.all(
//         cacheNames.filter(function(cacheName) {
//           return cacheName.startsWith('mws-restaurant') &&
//                  cacheName != staticCacheName;
//         }).map(function(cacheName) {
//           return caches.delete(cacheName);
//         })
//       );
//     })
//   );
// });
//
//
// // //  If request is not already in cache,
self.addEventListener('fetch', function(event) {

if (event.request.url.includes('restaurants')) {
  console.log(event.request.url);
  const parts = event.request.url.split('/');
  const partsArray = Object.values(parts);
  console.log(partsArray);
  let id;
  if (!partsArray.pop() === 'restaurants') {
      id = parseInt(partsArray.pop(), 10);
      console.log(id);
  }

  event.respondWith(
    idb.open('rest-db', 1)
    .then(db => {return db.transaction('restaurants', 'readonly')
    .objectStore('restaurants').get(id);
    })
    .then(data => {
    return {
    (data && data.data ) || fetch(event.request)
    .then(fetchResponse => fetchResponse.json())
    .then(function(restObjs){
      console.log(restObjs);
        function addRest2Db(restObj) {
          idb.open('rest-db', 1)
          .then(db => {
              const tx = db.transaction('restaurants', 'readwrite');
              tx.objectStore('restaurants').put(restObj, restObj.id);
              return tx.complete;
            });
          }
        for (const restObj of restObjs) {
            addRest2Db(restObj);
            }
      return restObjs;
    })
    .then(function(finalResponse) {
      return new Response(JSON.stringify(finalResponse));
    });
  );

    // .then(finalResponse => {
    //   return new Response(JSON.stringify(finalResponse));
    // }));


  // idb.open('rest-db', 1)
  // .then(db => {return db.transaction('restaurants', 'readonly')
  // .objectStore('restaurants').getAll();
  // })
  // .then(function(allRestaurants) {
  // let restLength = allRestaurants.length;
  // if (restLength > 0) {
  //   console.log('some');
  //   return allRestaurants;
  // } else {
  //   console.log('none');
  //   fetch(event.request.url)
  //   .then(function(response) {
  //     idb.open('rest-db', 1)
  //     .then(db => {return db.transaction('restaurants', 'readonly')
  //     return response.json();
  //   });
  // }
  // }));
  }
  else {
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
