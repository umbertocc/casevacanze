# Service Worker per cache ottimizzata

Questo Service Worker cachera le risorse statiche (immagini, CSS, JS) 
per velocizzare le visite successive al sito.

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('torre-pali-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/img/casa-bella-vista/prospetto.jpg',
        '/img/casa-giorgio/prospetto.jpg',
        '/img/casa-giorgio2/balcone.jpg'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first strategy per immagini
  if (event.request.url.includes('/img/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open('torre-pali-v1').then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
