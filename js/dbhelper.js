if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(function(reg) {
    // registration worked
      console.log(`Registration succeeded. Scope is ${reg.scope}`);
    }).catch(function(error) {
    // registration failed
    console.log(`Registration failed with ${error}`);
    });
  }

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

   // code given in https://alexandroperez.github.io/mws-walkthrough/?3.3.favorite-restaurants-using-accessible-toggle-buttons by Alexandro Perez
   static putRestaurants(restaurants, forceUpdate = false) {
     if (!restaurants.push) restaurants = [restaurants];
     DBHelper.dbPromise()
     .then(db => {
       const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
       Promise.all(restaurants.map(networkRestaurant => {
         return store.get(networkRestaurant.id).then(idbRestaurant => {
           if (forceUpdate) return store.put(networkRestaurant);
           if (!idbRestaurant || new Date(networkRestaurant.updatedAt) > new Date(idbRestaurant.updatedAt)) {
             return store.put(networkRestaurant);
           }
         });
       })).then(function () {
         return store.complete;
       });
     });
   }

  static putReviews(reviews) {
    if (!reviews.push) reviews = [reviews];
    // console.log(reviews);
    DBHelper.dbPromise()
    .then(db => {
      const store = db.transaction('reviews', 'readwrite').objectStore('reviews');
      Promise.all(reviews.map(networkReview => {
        // console.log(networkReview);
        return store.get(networkReview.id).then(idbReview => {
          if (!idbReview || new Date(networkReview.updatedAt) > new Date(idbReview.updatedAt)) {
            return store.put(networkReview);
          }
        });
      })).then(function () {
        // console.log('complete');
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

  /**
   * Get all reviews for a specific restaurant, by its id, using promises.
   */

  static get DATABASE_URL() {
    return `http://localhost:1337/restaurants`;
  }

  static fetchRestaurants(callback) {
    /**
     * implemntation of this function using fetch api and storing data offline based on explanation given in
     * MWS Restaurant App - Stage 2 Webinar with Darren https://www.youtube.com/watch?v=S7UGidduflQ
     */
      const fetchURL = DBHelper.DATABASE_URL;
      console.log('release candidate');
      DBHelper.dbPromise()
      .then(db => {
        return db.transaction('restaurants', 'readonly')
        .objectStore('restaurants').getAll();
      })
      .then(function(dbRestaurants) {
        let restData = dbRestaurants;
        if (restData.length > 0) {
          return restData;
        } else {
          return fetch(fetchURL)
          .then(function(response) {
            let restData = response.json();
            return restData;
          });
        }
        return restData;
      })
      .then(function(restObjs) {
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
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }


  /**
   * Fetch reviews for each restaurant with proper error handling.
   * Code given in https://alexandroperez.github.io/mws-walkthrough/?3.1.getting-reviews-from-new-sails-server by Alexandro Perez
   */
  static get REVIEWS_URL() {
    return `http://localhost:1337/reviews/?restaurant_id=`;
  }

  static fetchReviewsByRestaurantId(restaurant_id) {
    const revPoint = `${DBHelper.REVIEWS_URL}${restaurant_id}`;
    return fetch(revPoint)
    .then(response => {
      if (!response.ok) return Promise.reject("Reviews couldn't be fetched from network");
      return response.json();
    })
    .then(fetchedReviews => {
      // if reviews could be fetched from network:
      // console.log(fetchedReviews);
      DBHelper.putReviews(fetchedReviews);
      return fetchedReviews;
    })
    .catch(networkError => {
      // if reviews couldn't be fetched from network:
      // try to get reviews from idb
      console.log(`${networkError}, trying idb.`);
      return DBHelper.getReviewsForRestaurant(restaurant_id)
      .then(idbReviews => {
        // if no reviews were found on idb return null
        if (idbReviews.length < 1) return null;
        return idbReviews;
      });
    });
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


    // code inspired by code given in given in https://alexandroperez.github.io/mws-walkthrough/?3.3.favorite-restaurants-using-accessible-toggle-buttons by Alexandro Perez
    // and MWS Restaurant App - Stage 2 Webinar with Darren https://www.youtube.com/watch?v=S7UGidduflQ
    static handleClick() {
      const restaurantId = this.dataset.id;
      const fav = this.getAttribute('aria-pressed') == 'true';
      const url = `${DBHelper.DATABASE_URL}/${restaurantId}/?is_favorite=${!fav}`;
      // this.setAttribute('aria-pressed', !fav);
      let offline_fav = {
        name: 'changeFav',
        data: url,
        object_type: 'favStatus'
        }

      const PUT = {method: 'PUT'};

      return fetch(url, PUT).then(response => {
        if (!response.ok) return Promise.reject("We couldn't mark restaurant as favorite.");
        return response.json();
      }).then(updatedRestaurant => {
        // update restaurant on idb
        DBHelper.dbPromise()
        .then(function(restData) {
          DBHelper.putRestaurants(updatedRestaurant, true);
        });
        // change state of toggle button
        this.setAttribute('aria-pressed', !fav);
      });
    }

    static favoriteButton(restaurant) {
      const button = document.createElement('button');
      button.innerHTML = "&#x2764;"; // this is the heart symbol in hex code
      button.className = "fav"; // you can use this class name to style your button
      button.dataset.id = restaurant.id; // store restaurant id in dataset for later
      button.setAttribute('aria-label', `Mark ${restaurant.name} as a favorite`);
      button.setAttribute('aria-pressed', restaurant.is_favorite);
      button.onclick = DBHelper.handleClick;

      return button;
    }

    /**
     * Returns a li element with review data so it can be appended to
     * the review list.
     */
    static createReviewHTML(review) {
      const li = document.createElement('li');
      if (!navigator.onLine) {
        const connection_status = document.createElement('p');
        connection_status.classList.add('offline_label');
        connection_status.innerHTML = 'Offline'
        li.classList.add('reviews_offline')
        li.appendChild(connection_status);
      }
      const name = document.createElement('p');
      name.innerHTML = review.name;
      li.appendChild(name);

      const date = document.createElement('p');
      date.innerHTML = new Date(review.createdAt).toLocaleDateString();
      li.appendChild(date);

      const rating = document.createElement('p');
      rating.innerHTML = `Rating: ${review.rating}`;
      li.appendChild(rating);

      const comments = document.createElement('p');
      comments.innerHTML = review.comments;
      li.appendChild(comments);

      return li;
    }

    /**
     * Clear form data
     */
    static clearForm() {
      // clear form data
      document.getElementById('name').value = "";
      document.getElementById('rating').selectedIndex = 0;
      document.getElementById('comments').value = "";
    }

    /**
     * Make sure all form fields have a value and return data in
     * an object, so is ready for a POST request.
     */
    static validateAndGetData() {
      const data = {};

      // get name
      let name = document.getElementById('name');
      if (name.value === '') {
        name.focus();
        return;
      }
      data.name = name.value;

      // get rating
      const ratingSelect = document.getElementById('rating');
      const rating = ratingSelect.options[ratingSelect.selectedIndex].value;
      if (rating == "--") {
        ratingSelect.focus();
        return;
      }
      data.rating = Number(rating);

      // get comments
      let comments = document.getElementById('comments');
      if (comments.value === "") {
        comments.focus();
        return;
      }
      data.comments = comments.value;

      // get restaurant_id
      let restaurantId = document.getElementById('review-form').dataset.restaurantId;
      data.restaurant_id = Number(restaurantId);

      // set createdAT
      data.createdAt = new Date().toISOString();

      return data;
    }

    /**
     * Handle submit.
     */

     static postReview(review) {
       const url = `http://localhost:1337/reviews/`;
       const POST = {
         method: 'POST',
         body: JSON.stringify(review)
       };
       return fetch(url, POST).then(response => {
         if (!response.ok) return Promise.reject("We couldn't post review to server.");
         return response.json();
       }).then(newNetworkReview => {
         // save new review on idb
         // console.log(newNetworkReview);
         DBHelper.putReviews(newNetworkReview);
       });
     }

     // inspired by doe given in MWS Restaurant App - Stage 2 Webinar with Darren https://www.youtube.com/watch?v=S7UGidduflQ
     static sendDataWhenOnline(offline_obj) {
       // console.log(Object.values(offline_obj));
       const offlineReview = offline_obj.data;
       // console.log(offlineReview);
       // scheme for storing values in arrays in local storage given in https://stackoverflow.com/questions/40843773/localstorage-keeps-overwriting-my-data
       let revHistory = JSON.parse(localStorage.getItem('reviewsWaitHere')) || [];
       revHistory.push(offlineReview);
       localStorage.setItem('reviewsWaitHere', JSON.stringify(revHistory));

       window.addEventListener('online', (event) => {
         // console.log('online again!');
         let retrievedReviews = localStorage.getItem('reviewsWaitHere');
         retrievedReviews = JSON.parse(retrievedReviews);
         // console.log(`${typeof retrievedReviews} ${retrievedReviews}`);
         [...document.querySelectorAll(".reviews_offline")]
         .forEach(el => {
           el.classList.remove('reviews_offline');
           el.querySelector('.offline_label').remove();
         });
         if (retrievedReviews !== null && retrievedReviews.length > 0) {
           // console.log(retrievedReviews);
           for (const retrievedReview of retrievedReviews) {
             DBHelper.postReview(retrievedReview);
           }
          localStorage.removeItem('reviewsWaitHere');
         }
       });
     }

     // * Code given inhttps://alexandroperez.github.io/mws-walkthrough/?3.4.adding-a-form-for-new-reviews by Alexandro Perez
    static handleSubmit(e) {
      e.preventDefault();
      const newReview = DBHelper.validateAndGetData();
      if (!newReview) return;
      // console.log(`new review`);
      let offline_obj = {
        name: 'addReview',
        // key: newReview.id;
        data: newReview,
        object_type: 'review'
        }
      // console.log(Object.values(offline_obj));
      const reviewList = document.getElementById('reviews-list');
      const review = DBHelper.createReviewHTML(newReview);
      reviewList.appendChild(review);
      DBHelper.clearForm();
      if (!navigator.onLine && offline_obj.name === 'addReview') {
        DBHelper.sendDataWhenOnline(offline_obj);
        return;
      }
      DBHelper.postReview(newReview);
    }

    /**
     * Returns a form element for posting new reviews.
     */
    static reviewForm(restaurantId) {
      const form = document.createElement('form');
      form.id = "review-form";
      form.dataset.restaurantId = restaurantId;

      let p = document.createElement('p');
      const name = document.createElement('input');
      name.id = "name"
      name.setAttribute('type', 'text');
      name.setAttribute('aria-label', 'Name');
      name.setAttribute('placeholder', 'Enter Your Name');
      p.appendChild(name);
      form.appendChild(p);

      p = document.createElement('p');
      const selectLabel = document.createElement('label');
      selectLabel.setAttribute('for', 'rating');
      selectLabel.innerText = "Your rating: ";
      p.appendChild(selectLabel);
      const select = document.createElement('select');
      select.id = "rating";
      select.name = "rating";
      select.classList.add('rating');
      ["--", 1,2,3,4,5].forEach(number => {
        const option = document.createElement('option');
        option.value = number;
        option.innerHTML = number;
        if (number === "--") option.selected = true;
        select.appendChild(option);
      });
      p.appendChild(select);
      form.appendChild(p);

      p = document.createElement('p');
      const textarea = document.createElement('textarea');
      textarea.id = "comments";
      textarea.setAttribute('aria-label', 'comments');
      textarea.setAttribute('placeholder', 'Enter any comments here');
      textarea.setAttribute('rows', '10');
      p.appendChild(textarea);
      form.appendChild(p);

      p = document.createElement('p');
      p.setAttribute('id', 'submitP')
      const addButton = document.createElement('button');
      addButton.setAttribute('type', 'submit');
      addButton.setAttribute('aria-label', 'Add Review');
      addButton.classList.add('add-review');
      // addButton.innerHTML = "<span>+</span>";
      addButton.innerHTML = "<span>Submit Review</span>";
      p.appendChild(addButton);
      form.appendChild(p);

      form.onsubmit = DBHelper.handleSubmit;

      return form;
    };


}
