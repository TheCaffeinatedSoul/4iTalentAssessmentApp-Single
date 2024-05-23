self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("4i-test-app").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/App.js",
        // Add more files or assets to cache as needed
      ]);
    })
  );
});
