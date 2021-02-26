const mem = "weather";
const assets = [
  "./",
  "./index.html",
  "./index.css",
  "./index.js",
  "./manifest.json",
  "./resources/add.svg",
  "./resources/arrow-down.png",
  "./resources/arrow-up.png",
  "./resources/arrow.svg",
  "./resources/download.png",
  "./resources/generic-coin.svg",
  "./resources/wallet.png"
];



self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(mem).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.addAll(assets);
          return response;
        });
      });
    })
  );
});