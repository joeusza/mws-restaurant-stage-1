/**
 * Common database helper functions.
 */
class DBHelper {



  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  // static fetchRestaurants(callback) {
  //   let xhr = new XMLHttpRequest();
  //   xhr.open('GET', DBHelper.DATABASE_URL);
  //   xhr.onload = () => {
  //     if (xhr.status === 200) { // Got a success response from server!
  //       const json = JSON.parse(xhr.responseText);
  //       const restaurants = json.restaurants;
  //       callback(null, restaurants);
  //     } else { // Oops!. Got an error from server.
  //       const error = (`Request failed. Returned status of ${xhr.status}`);
  //       callback(error, null);
  //     }
  //   };
  //   xhr.send();
  // }

  // .then(response => response.json())
  // .then(data => callback(null, restaurants))
  // .catch(error => callback(`Request failed. Returned status of ${error.statusText}`, null);

  /**
  could possibly be used as a part of a check to make sure that idb is only
  updated when the number of restaurants returned from the fetch is less than
  the number of restaurants in idb
  */
  // dbPromise.then(db => {
  //   return db.transaction('restaurants')
  //   .objectStore('restaurants').count()
  //   .then(function(restCount) {
  //     console.log(restCount);
  //     return restCount;
  //   });


  // static fetchRestaurants(callback, id) {
  //
  //   const dbPromise = idb.open('rest-db', 1, upgradeDb => {
  //     switch(upgradeDb.oldVersion) {
  //       case 0:
  //       upgradeDb.createObjectStore('restaurants', {keypath: id});
  //     }
  //   });
  //
  //   dbPromise.then(db => {
  //     return db.transaction('restaurants')
  //     .objectStore('restaurants').getAll();
  //   }).then(function(allRestaurants) {
  //     let restLength = allRestaurants.length;
  //     if (restLength > 0) {
  //       console.log(restLength);
  //       console.log(allRestaurants);
  //       // this does not work
  //       // data has been retrieved from idb offline but is still unavailable to the user
  //       return Promise.resolve(allRestaurants);
  //       }
  //   });
  //
  //   let fetchURL = DBHelper.DATABASE_URL
  //   console.log(fetchURL);
  //   fetch(fetchURL)
  //   .then(function(response) {
  //     // check needed here so that it only clones the reponse when idb actually needs to be updated
  //     let response2Json = response.clone().json()
  //     .then(function(restObjs) {
  //         function addRest2Db(restObj) {
  //         // console.log(restObj.id);
  //         return dbPromise.then(db => {
  //         const tx = db.transaction('restaurants', 'readwrite');
  //         tx.objectStore('restaurants').put(restObj, restObj.id);
  //         return tx.complete;
  //           });
  //         }
  //         for (const restObj of restObjs) {
  //         addRest2Db(restObj);
  //         }
  //     });
  //     // this has to be an or return all restaurants
  //     return response.json();
  //   })
  //   // .then(data => callback(null, data))
  //   .then(function(data) {
  //     console.log(data);
  //     callback(null, data);
  //   })
  //   .catch(error => callback(`Request failed. Returned ${error}`, null));
  // }



  // static fetchRestaurants(callback, id) {
  //     let fetchURL = DBHelper.DATABASE_URL;
  //
  //     const dbPromise = idb.open('rest-db', 1, upgradeDb => {
  //       switch(upgradeDb.oldVersion) {
  //         case 0:
  //         upgradeDb.createObjectStore('restaurants', {keypath: id});
  //       }
  //     });

    // dbPromise.then(db => {
    //   return db.transaction('restaurants')
    //     .objectStore('restaurants').getAll();
    //     }).then(function(allRestaurants) {
    //     let restLength = allRestaurants.length;
    //     if (restLength > 0) {
    //       console.log(restLength);
    //       console.log(allRestaurants);
    //       // this does not work
    //       // data has been retrieved from idb offline but is still unavailable to the user
    //       return allRestaurants;
    //       } else {
    //         fetch(fetchURL)
    //         .then(function(response) {
    //           let response2Json = response.clone().json()
    //           .then(function(restObjs) {
    //           function addRest2Db(restObj) {
    //           // console.log(restObj.id);
    //           return dbPromise.then(db => {
    //           const tx = db.transaction('restaurants', 'readwrite');
    //           tx.objectStore('restaurants').put(restObj, restObj.id);
    //           return tx.complete;
    //           });
    //         }
    //         for (const restObj of restObjs) {
    //         addRest2Db(restObj);
    //         }
    //       });
    //     console.log(response.json());
    //     return response.json();
    //   });
    //     }
    //   })
    //   // .then(data => callback(null, data))
    //   .then(function(data) {
    //     console.log(data);
    //     callback(null, data);
    //   })
    //   .catch(error => callback(`Request failed. Returned ${error}`, null))
    // }



    static fetchRestaurants(callback, id) {
      // comment
        let fetchURL;
        if (!id) {
          fetchURL = DBHelper.DATABASE_URL;
        } else {
          fetchURL = `${DBHelper.DATABASE_URL}/${id}`;
        }

        // let fetchIdb = idb.open('rest-db', 1)
        //         .then(db => {
        //         return db.transaction('restaurants', 'readonly')
        //         .objectStore('restaurants').getAll();
        //        })

        // let dbChecked = false;
        //
        // const dbPromise = idb.open('rest-db', 1, upgradeDb => {
        //   switch(upgradeDb.oldVersion) {
        //     case 0:
        //     upgradeDb.createObjectStore('restaurants', {keypath: id});
        //   }
        // });
        //
        // let allDbRestPromise = dbPromise.then(db => {
        //   return db.transaction('restaurants')
        //   .objectStore('restaurants').getAll();
        // });



        // dbPromise.then(db => {
        //   return db.transaction('restaurants')
        //   .objectStore('restaurants').getAll();
        //   })
        //   .then(function(allRestaurants) {
        //     console.log(allRestaurants);
        //     let restLength = allRestaurants.length;
        //     console.log(restLength);
        //     if (restLength > 0) {
        //       return allRestaurants;
        //     } else {
        //       console.log(fetchURL);
        //       fetch(fetchURL)
        //       .then(function(response) {
        //         return response.json();
        //       });
        //     }
        // })

        fetch(fetchURL)
        .then(function(response) {
                return response.json();
        })
        .then(data => callback(null, data))
        // .catch(function getFromDb() {
        //   idb.open('rest-db', 1)
        //   .then(db => {
        //   return db.transaction('restaurants', 'readonly')
        //   .objectStore('restaurants').getAll();
        //  })
        // .then(allRestaurants => callback(null, allRestaurants))
        // .catch(error => callback(`Request failed. Returned ${error}`, null))
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
          console.log(`rest ${restaurant}`);
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
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
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
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




  // /* static mapMarkerForRestaurant(restaurant, map) {
  //   const marker = new google.maps.Marker({
  //     position: restaurant.latlng,
  //     title: restaurant.name,
  //     url: DBHelper.urlForRestaurant(restaurant),
  //     map: map,
  //     animation: google.maps.Animation.DROP}
  //   );
  //   return marker;

  // } */

}


  // console.log('store');
  // const dbPromise = idb.open('rest-db', 1, upgradeDb => {
  //   const restRevStore = upgradeDb.createObjectStore('restRev');
  //   restRevStore.put('world', 'hello');
  // });




    // let dbPromise = idb.open('rest-db', 1, function(upgradeDb) {
    //   switch(upgradeDb.oldVersion) {
    //     case 0:
    //     const restaurantStore = upgradeDb.createObjectStore('restaurant');
    //     restaurantStore.put("world", "hello");
    //   }
    // });
