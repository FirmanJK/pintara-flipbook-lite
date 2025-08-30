# Pintara Flipbook Reader Lite (PWA)

## Deskripsi
Aplikasi web ini mereplikasi pengalaman membaca flipbook Pintara dalam versi sederhana. Dibuat sebagai Progressive Web App (PWA) yang dapat diinstal di perangkat mobile dan berfungsi secara offline untuk konten yang sudah diunduh.

## Fitur
* **Aplikasi PWA**    : Dapat diinstal di layar utama perangkat Android.
* **Offline First**   : Menggunakan Service Worker untuk precaching app shell dan runtime caching untuk gambar halaman buku.
* **Navigasi**        : Kontrol sederhana "Prev" dan "Next" untuk berpindah halaman.
* **Fallback**        : Menampilkan pesan ramah jika gambar halaman tidak tersedia secara offline.

---

## Arsitektur Cache

Aplikasi ini mengimplementasikan strategi caching hibrida untuk memastikan fungsionalitas offline yang optimal.

1.  **Precache**        : Saat Service Worker pertama kali diinstal, ia secara otomatis menyimpan `index.html` dan aset penting lainnya (app shell). Ini menjamin bahwa halaman utama aplikasi akan selalu dapat dimuat, bahkan tanpa koneksi internet.

2.  **Runtime Caching** : Gambar halaman buku di-cache secara dinamis. Ketika pengguna menavigasi ke sebuah halaman saat online, Service Worker akan mengunduh gambar tersebut dari internet dan menyimpannya di cache. Strategi ini memastikan halaman yang sudah dikunjungi dapat diakses kembali saat offline.

---

## Cara Uji Offline

User dapat mereplikasi pengujian offline dengan mengikuti langkah-langkah sederhana berikut :

1.  Buka aplikasi di browser Chrome Anda. Pastikan Anda **online**.
2.  Klik salah satu buku, dan navigasikan ke Halaman 1 dan Halaman 2.
3.  Tutup koneksi internet Anda (aktifkan mode pesawat atau putuskan Wi-Fi).
4.  Muat ulang halaman browser atau buka kembali aplikasi dari ikon di layar utama.
5.  Anda akan melihat bahwa Halaman 1 dan 2 masih dapat dimuat, dan badge "Offline Mode" akan muncul.

---

## Keterbatasan dan Ide Perbaikan

* **Pembaruan Cache** : Saat ini, cache tidak memiliki batas waktu (TTL). Di masa depan, mekanisme TTL dapat ditambahkan untuk membersihkan cache setelah jangka waktu tertentu (misalnya, 24 jam) untuk menghemat ruang penyimpanan perangkat.
* **Loading State**   : Tidak ada indikator loading saat gambar sedang diunduh. Ini dapat ditingkatkan untuk memberikan umpan balik visual kepada pengguna.
