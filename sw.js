console.log('sw.js');

self.addEventListener('fetch', function(event) {
  console.log(event.request);
});
