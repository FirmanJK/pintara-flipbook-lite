const CACHE_NAME = 'pintara-flipbook-v1';
// URL yang akan di-precache (app shell)
const urlsToPrecache = [
    '/',
    '/index.html',
    // Placeholder images untuk thumbnail dan halaman default
    'https://placehold.co/300x400/007bff/ffffff?text=Kiko+Thumb',
    'https://placehold.co/300x400/28a745/ffffff?text=Hutan+Thumb',
    'https://placehold.co/600x800/dc3545/ffffff?text=Buku+Tidak+Ada', // Fallback image jika buku tidak ditemukan
    'https://placehold.co/600x800/cccccc/333333?text=Gambar+Tidak+Tersedia', // Fallback image generic
    'https://placehold.co/600x800/ff0000/ffffff?text=Kiko+Hlm+1', // Gambar halaman yang sering dibuka
    'https://placehold.co/600x800/00ff00/ffffff?text=Kiko+Hlm+2',
    'https://placehold.co/600x800/800080/ffffff?text=Hutan+Hlm+1',
    'https://placehold.co/600x800/ffa500/ffffff?text=Hutan+Hlm+2'
];

// URLs untuk gambar halaman buku yang akan di-cache saat runtime
const bookPageImages = [
    "https://placehold.co/600x800/ff0000/ffffff?text=Kiko+Hlm+1",
    "https://placehold.co/600x800/00ff00/ffffff?text=Kiko+Hlm+2",
    "https://placehold.co/600x800/0000ff/ffffff?text=Kiko+Hlm+3",
    "https://placehold.co/600x800/ffff00/000000?text=Kiko+Hlm+4",
    "https://placehold.co/600x800/800080/ffffff?text=Hutan+Hlm+1",
    "https://placehold.co/600x800/ffa500/ffffff?text=Hutan+Hlm+2",
    "https://placehold.co/600x800/00ffff/000000?text=Hutan+Hlm+3",
    "https://placehold.co/600x800/ffc0cb/000000?text=Hutan+Hlm+4"
];

// Gabungkan semua URL yang mungkin di-cache
const allUrlsToCache = [...urlsToPrecache, ...bookPageImages];

// Event: install (menginstal Service Worker dan melakukan precaching)
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Menginstal Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching app shell dan gambar buku...');
                // Tambahkan semua URL ke cache
                return cache.addAll(allUrlsToCache.map(url => new Request(url, { cache: 'no-cache' })));
            })
            .catch(error => {
                console.error('[Service Worker] Gagal precaching:', error);
            })
    );
});

// Event: activate (mengaktifkan Service Worker dan membersihkan cache lama)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Mengaktifkan Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Mengambil kendali semua klien yang ada
        })
    );
});

// Event: fetch (menyadap permintaan jaringan)
self.addEventListener('fetch', (event) => {
    // Abaikan permintaan yang bukan http/https
    if (!(event.request.url.startsWith('http:') || event.request.url.startsWith('https:'))) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((networkResponse) => {
                        // Jika respons jaringan valid, tambahkan ke cache dan kembalikan
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Jika jaringan juga gagal (offline) dan itu adalah permintaan navigasi,
                        // kembalikan index.html dari cache.
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        // Untuk aset lain (gambar, dll.), biarkan browser menampilkan error jika tidak ada di cache.
                        return new Response('Halaman tidak tersedia secara offline.', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});