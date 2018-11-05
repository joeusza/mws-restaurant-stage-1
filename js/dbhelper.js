// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//     .then(function(reg) {
//     // registration worked
//       console.log(`Registration succeeded. Scope is ${reg.scope}`);
//     }).catch(function(error) {
//     // registration failed
//     console.log(`Registration failed with ${error}`);
//     });
//   }

// const dbPromise =
//   idb.open('restaurant-reviews-db', 2, function(upgradeDb) {
//     switch (upgradeDb.oldVersion) {
//       case 0:
//         upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
//       case 1:
//         upgradeDb.createObjectStore('reviews', { keyPath: 'id' })
//            .createIndex('restaurant_id', 'restaurant_id');
//     }
//   });

/**
 * Common database helper functions.
 */
class DBHelper {

  static dbPromise() {
     return idb.open('rest-db', 2, function(upgradeDb) {
       switch (upgradeDb.oldVersion) {
         case 0:
         upgradeDb.createObjectStore('restaurants', {
          keyPath: 'id'
        });
        case 1:
        const reviewsStore = upgradeDb.createObjectStore('reviews', {
         keyPath: 'id'
       });
       reviewsStore.createIndex('restaurant_id', 'restaurant_id');
       }
     });
   }

  static putReviews(reviews) {
    console.log('putReviews Version B.5');
    if (!reviews.push) reviews = [reviews];
    console.log(reviews);
    DBHelper.dbPromise()
    .then(db => {
      const store = db.transaction('reviews', 'readwrite').objectStore('reviews');
      Promise.all(reviews.map(networkReview => {
        console.log(networkReview);
        return store.get(networkReview.id).then(idbReview => {
          if (!idbReview || networkReview.updatedAt > idbReview.updatedAt) {
            return store.put(networkReview);
          }
        });
      })).then(function () {
        console.log('complete');
        return store.complete;
      });
    });
  }

  /**
     * Get all reviews for a specific restaurant, by its id, using promises.
     */
  static getReviewsForRestaurant(id) {
    DBHelper.dbPromise()
    .then(db => {
      const storeIndex = db.transaction('reviews').objectStore('reviews').index('restaurant_id');
      return storeIndex.getAll(Number(id));
      });
    }

   // code given in https://alexandroperez.github.io/mws-walkthrough/?3.2.upgrading-idb-for-restaurant-reviews by Alexandro Perez

  /**
   * Get all reviews for a specific restaurant, by its id, using promises.
   */
  // code given in https://alexandroperez.github.io/mws-walkthrough/?3.2.upgrading-idb-for-restaurant-reviews by Alexandro Perez

  static get DATABASE_URL() {
    return `http://localhost:1337/restaurants`;
  }

  static fetchRestaurants(callback) {
    /**
     * implemntation of this function using fetch api and storing data offline based on explanation given in
     * MWS Restaurant App - Stage 2 Webinar with Darren https://www.youtube.com/watch?v=S7UGidduflQ
     */
      const fetchURL = DBHelper.DATABASE_URL;
      DBHelper.dbPromise()
      .then(db => {
        return db.transaction('restaurants', 'readonly')
        .objectStore('restaurants').getAll();
      })
      .then(function(dbRestaurants) {
        let restData = dbRestaurants;
        // console.log('restData', restData);
        if (restData.length > 0) {
          // console.log('from idb');
          // console.log(dbRestaurants);
          return restData;
        } else {
          // console.log('from fetch');
          return fetch(fetchURL)
          .then(function(response) {
            let restData = response.json();
            return restData;
          });
        }
        // console.log('returned', restData);
        return restData;
      })
      .then(function(restObjs) {
        // console.log('restObjs', restObjs);
        DBHelper.dbPromise()
        .then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          const store = tx.objectStore('restaurants');
          for (const restObj of restObjs) {
            store.put(restObj);
          }
          return tx.complete;
        });
        callback(null, restObjs);
      })
      .catch(error => callback(`Request failed. Returned ${error}`, null));
    }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          // console.log(`rest ${restaurant}`);
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }


  /**
   * Fetch reviews for each restaurant with proper error handling.
   * Code taken from https://alexandroperez.github.io/mws-walkthrough/?3.1.getting-reviews-from-new-sails-server by Alexandro Perez
   */
  static get REVIEWS_URL() {
    return `http://localhost:1337/reviews/?restaurant_id=`;
  }

  static fetchReviewsByRestaurantId(restaurant_id) {
    const revPoint = `${DBHelper.REVIEWS_URL}${restaurant_id}`;
    console.log(revPoint);
    return fetch(revPoint)
    .then(response => {
      if (!response.ok) return Promise.reject("Reviews couldn't be fetched from network");
      return response.json();
    })
    .then(fetchedReviews => {
      // if reviews could be fetched from network:
      // TODO: store reviews on idb
      console.log(fetchedReviews);
      DBHelper.putReviews(fetchedReviews);
      return fetchedReviews;
    });
    // .catch(networkError => {
      // if reviews couldn't be fetched from network:
      // try to get reviews from idb
      // console.log(`${networkError}, trying idb.`);
      // DBHelper.getReviewsForRestaurant(restaurant_id)
      // .then(idbReviews => {
      //   // if no reviews were found on idb return null
      //   if (idbReviews.length < 1) return null;
      //   return idbReviews;
      // });
    // });
  }

  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   * Adding of test to subsstitute restaurant.id for restaurant.photograph suggested by fellow student 'Laura (MWS)' Laura Franklin
   * However the actual code is my own
   */
  static imageUrlForRestaurant(restaurant) {
    let photoId = restaurant.photograph;
    if ((typeof photoId) === 'string') {
      return (`/img/${photoId}.jpg`);
    } else {
      let photoId = restaurant.id.toString();
      return (`/img/${photoId}.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
    }


}
