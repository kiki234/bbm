const CACHE_NAME = 'fuel-log-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html', // Asumsi file HTML utama adalah index.html
    '/manifest.json',
    // Tambahkan aset lain yang ingin Anda cache di sini
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// Event: Install - Cache aset aplikasi
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// Event: Activate - Membersihkan cache lama
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Menghapus cache lama', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Event: Fetch - Melayani aset dari cache atau jaringan
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Jika tidak ada di cache, ambil dari jaringan
                return fetch(event.request).then(
                    response => {
                        // Periksa apakah kita menerima respons yang valid
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Klon respons karena stream hanya bisa dikonsumsi sekali
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
