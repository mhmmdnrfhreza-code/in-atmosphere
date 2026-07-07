<div align="center">

# In Atmosphere

### Sistem Pemantau Cuaca, Kualitas Udara, Indeks UV, dan Peringatan Dini BMKG

Pemantauan Lingkungan Hiper-Lokal Otomatis Berbasis Open-Meteo dan BMKG dengan Notifikasi Discord dan Dashboard Web serta Kustomisasi Lokasi

*Automated Hyper-Local Environmental Monitoring System*

![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933)
![Discord](https://img.shields.io/badge/Notifikasi-Discord%20Webhook-5865F2)
![Open-Meteo](https://img.shields.io/badge/Data-Open--Meteo-0A7E3E)
![BMKG](https://img.shields.io/badge/Peringatan-BMKG-E11D48)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF)
![License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)

</div>

## Daftar Isi

1. [Ringkasan](#ringkasan)
2. [Fitur Utama](#fitur-utama)
3. [Teknologi](#teknologi)
4. [Arsitektur](#arsitektur)
5. [Struktur Direktori](#struktur-direktori)
6. [Cara Kerja Sistem](#cara-kerja-sistem)
7. [Mode Laporan](#mode-laporan)
8. [Rule Engine](#rule-engine)
9. [Sumber Data](#sumber-data)
10. [Prasyarat](#prasyarat)
11. [Panduan Cepat: Dari Clone sampai Siap](#panduan-cepat-dari-clone-sampai-siap)
12. [Instalasi](#instalasi)
13. [Konfigurasi](#konfigurasi)
14. [Menjalankan Aplikasi](#menjalankan-aplikasi)
15. [Dashboard](#dashboard)
16. [Otomatisasi GitHub Actions](#otomatisasi-github-actions)
17. [Pengujian](#pengujian)
18. [Berkas Data dan State](#berkas-data-dan-state)
19. [Skrip NPM](#skrip-npm)
20. [Troubleshooting](#troubleshooting)
21. [Lisensi](#lisensi)

## Ringkasan

Singkatnya, In Atmosphere mengambil data lingkungan dari beberapa sumber publik, menilai kondisinya berdasarkan ambang batas yang sudah ditentukan, lalu meneruskan hasilnya ke dua tempat:

1. Notifikasi Discord dengan siklus pesan yang tertata, mulai dari status terkini, peringatan darurat, sampai pesan pemulihan.
2. Dashboard web statis yang cukup membaca satu berkas JSON ringkas (`public/data/latest.json`).

Lokasi yang dipantau bisa diganti lewat koordinat. Secara bawaan, sistem memantau area Bogor Tengah, Kota Bogor, Jawa Barat.

## Fitur Utama

* Pantauan cuaca terkini: suhu, kelembapan, curah hujan, kecepatan angin, dan hembusan angin.
* Pantauan kualitas udara: US AQI, PM2.5, PM10, karbon monoksida, nitrogen dioksida, sulfur dioksida, dan ozon.
* Indeks UV terkini sekaligus nilai maksimum hariannya.
* Peringatan dini cuaca dari BMKG lewat RSS nowcast, dengan pencocokan wilayah sampai tingkat kecamatan.
* Rule engine untuk menilai status dan mendeteksi kondisi darurat.
* Saran kesehatan otomatis, mulai dari saran umum, aktivitas luar ruangan, sampai catatan khusus untuk kelompok sensitif.
* Siklus notifikasi Discord yang anti-duplikat berkat penggunaan fingerprint.
* Dashboard responsif dengan mode terang dan gelap.
* Berjalan otomatis penuh lewat GitHub Actions dan publikasi ke GitHub Pages.

## Teknologi

Ringkasan teknologi yang dipakai proyek ini.

### Inti Aplikasi

|Teknologi|Peran|
|-|-|
|TypeScript|Bahasa utama untuk seluruh kode di `src/`.|
|Node.js 22|Runtime tempat aplikasi dijalankan.|
|tsx|Menjalankan sumber TypeScript langsung saat pengembangan.|
|cross-env|Menyetel variabel lingkungan lintas sistem operasi pada skrip npm.|

### Pustaka Utama

|Pustaka|Peran|
|-|-|
|axios|Klien HTTP untuk memanggil API Open-Meteo, BMKG, dan Nominatim.|
|fast-xml-parser|Mengurai RSS peringatan dini BMKG dari format XML.|
|dayjs|Pengolahan dan format tanggal serta waktu.|
|dotenv|Memuat variabel lingkungan dari berkas `.env`.|

### Pengujian dan Tooling

|Alat|Peran|
|-|-|
|Vitest|Kerangka pengujian unit.|
|serve|Menyajikan folder `public/` saat pratinjau dashboard lokal.|
|TypeScript Compiler (tsc)|Meng-compile sumber ke JavaScript pada folder `dist/`.|

### Frontend Dashboard

|Teknologi|Peran|
|-|-|
|HTML dan CSS|Struktur dan gaya halaman dashboard.|
|Vanilla JavaScript (ES Modules)|Logika dashboard tanpa framework, membaca `public/data/latest.json`.|

### Otomatisasi

|Layanan|Peran|
|-|-|
|GitHub Actions|Menjadwalkan eksekusi dan menjalankan pipeline CI/CD.|
|GitHub Pages|Mempublikasikan dashboard statis.|

## Arsitektur

|Lapisan|Tanggung jawab|Contoh isi|
|-|-|-|
|`domain`|Aturan bisnis murni, entitas, dan value object. Tidak bergantung pada pustaka luar.|Klasifikasi AQI dan UV, aturan risiko cuaca, ambang darurat, entitas `AtmosSnapshot` dan `EmergencyAlert`.|
|`application`|Mengatur alur use case dan service yang memadukan aturan domain dengan data.|`GetInAtmosphereSnapshot`, `EmergencyAnalyzer`, `ReportAdvisor`, `DiscordNotificationOrchestrator`.|
|`infrastructure`|Implementasi nyata untuk API, penyimpanan, konfigurasi, dan Discord.|Klien Open-Meteo, klien BMKG, geocoding Nominatim, penyimpanan JSON, klien webhook Discord.|
|`presentation`|Menyiapkan data untuk ditampilkan, baik sebagai embed Discord maupun komponen dashboard.|Embed status, embed darurat, embed pemulihan, dan format teks.|

Lapisan `shared` menampung konstanta dan utilitas yang dipakai lintas lapisan, seperti format tanggal dan angka.

## Struktur Direktori

```
in-atmosphere/
├── .github/
│   └── workflows/
│       └── in-atmosphere-monitor.yml # Definisi otomatisasi GitHub Actions
├── data/
│   ├── location.json                 # Koordinat lokasi yang dipantau
│   ├── location\_context.json        # Cache hasil geocoding (kota, kecamatan, wilayah sekitar)
│   └── state.json                    # State runtime untuk siklus notifikasi
├── public/
│   ├── data/latest.json              # Snapshot terbaru yang dibaca dashboard
│   ├── js/                           # Modul dashboard (dom, formatters, narratives, status)
│   ├── app.js                        # Logika utama dashboard
│   ├── index.html                    # Halaman dashboard
│   └── style.css                     # Gaya dashboard
├── src/
│   ├── application/
│   │   ├── services/                 # Service orkestrasi dan pemetaan data
│   │   └── use-cases/                # Use case pengambilan snapshot
│   ├── domain/
│   │   ├── entities/                 # Definisi entitas dan tipe
│   │   └── rules/                    # Rule engine (AQI, UV, risiko cuaca, saran, darurat)
│   ├── infrastructure/
│   │   ├── api/                      # Klien Open-Meteo, BMKG, dan geocoding
│   │   ├── config/                   # Validasi env, konfigurasi lokasi, resolusi mode
│   │   ├── discord/                  # Klien webhook Discord
│   │   └── storage/                  # Penyimpanan JSON untuk state dan dashboard
│   ├── presentation/
│   │   └── discord/                  # Pembentuk embed dan teks notifikasi
│   ├── shared/                       # Konstanta dan utilitas bersama
│   └── main.ts                       # Titik masuk aplikasi
├── tests/                            # Pengujian unit dengan Vitest
├── .env.example                      # Contoh variabel lingkungan
├── package.json
└── tsconfig.json
```

## Cara Kerja Sistem

Dalam sekali jalan, `main.ts` melakukan langkah-langkah berikut secara berurutan:

1. Mengecek variabel lingkungan. Kalau `DISCORD\_WEBHOOK\_URL` belum diisi, aplikasi berhenti.
2. Menentukan mode laporan, entah dari variabel lingkungan atau dari jadwal cron GitHub Actions.
3. Memuat state sebelumnya dari `data/state.json`.
4. Mengambil data lingkungan secara paralel: cuaca Open-Meteo, kualitas udara Open-Meteo, peringatan BMKG, dan konteks lokasi.
5. Menganalisis kondisi darurat dengan membandingkan nilai terkini terhadap ambang batas dan nilai AQI sebelumnya.
6. Menyusun saran kesehatan berdasarkan klasifikasi AQI, UV, dan peluang hujan.
7. Menyimpan snapshot dashboard ke `public/data/latest.json`.
8. Memproses siklus notifikasi Discord, baik status terkini, darurat, maupun pemulihan.
9. Menyimpan state terbaru kembali ke `data/state.json`.

Pengambilan peringatan BMKG dibuat tahan gagal. Jadi kalau sumbernya sedang tidak bisa diakses, aplikasi tetap jalan dengan daftar peringatan kosong.

### Penyaringan Hiper-Lokal

Peringatan BMKG umumnya berskala provinsi atau kabupaten, jadi tidak semuanya relevan dengan lokasi yang dipantau. Untuk menyaringnya, sistem menempuh dua tahap:

1. Saat awal berjalan, koordinat diubah menjadi nama wilayah lewat reverse geocoding OpenStreetMap Nominatim, lalu kecamatan target beserta kecamatan sekitarnya (dalam radius yang diatur) disimpan sebagai cache di `data/location\_context.json`.
2. Teks tiap peringatan BMKG dicocokkan dengan nama kecamatan tersebut menggunakan pola regex ber-batas kata (word boundary). Pemakaian batas kata ini penting supaya tidak terjadi kecocokan sebagian, misalnya "depok" keliru cocok dengan "depoksari".

Peringatan baru dianggap aktif kalau memang memuat nama kecamatan hasil pemetaan tadi.

## Mode Laporan

Mode laporan menentukan konteks tiap eksekusi. Nilainya diambil dari variabel `REPORT\_MODE`, atau dipetakan otomatis dari jadwal cron saat dijalankan oleh GitHub Actions.

|Mode|Pemicu|Jadwal (WIB)|Keterangan|
|-|-|-|-|
|`morning`|Cron `37 23 \* \* \*` (UTC)|06:37|Laporan pagi.|
|`rush-hour`|Cron `17 10 \* \* \*` (UTC)|17:17|Laporan jam sibuk sore.|
|`emergency-watch`|Cron `7,37 \* \* \* \*` (UTC)|Tiap 30 menit|Pemantauan darurat berkala.|
|`manual`|Dijalankan manual atau `workflow\_dispatch`|Sesuai kebutuhan|Mode bawaan kalau konteksnya tidak dikenali.|

## Rule Engine

Semua logika penilaian dan deteksi darurat ada di lapisan domain, supaya gampang diuji dan dirawat.

### Klasifikasi US AQI

|Rentang AQI|Level|Label|
|-|-|-|
|0 sampai 50|GOOD|Baik|
|51 sampai 100|MODERATE|Sedang|
|101 sampai 150|UNHEALTHY\_SENSITIVE|Tidak Sehat Untuk Kelompok Sensitif|
|151 sampai 200|UNHEALTHY|Tidak Sehat|
|201 sampai 300|VERY\_UNHEALTHY|Sangat Tidak Sehat|
|di atas 300|HAZARDOUS|Berbahaya|

### Klasifikasi Indeks UV

|Rentang UV|Level|Label|
|-|-|-|
|di bawah 3|LOW|Rendah|
|3 sampai di bawah 6|MODERATE|Sedang|
|6 sampai di bawah 8|HIGH|Tinggi|
|8 sampai di bawah 11|VERY\_HIGH|Sangat Tinggi|
|11 atau lebih|EXTREME|Ekstrem|

### Ambang Kondisi Darurat

|Kondisi|Ambang batas|
|-|-|
|AQI berbahaya|151 atau lebih (kategori Tidak Sehat ke atas)|
|Kenaikan AQI drastis|naik 50 atau lebih dibanding nilai sebelumnya|
|UV ekstrem|11 atau lebih|
|Hujan lebat|10 mm atau lebih|
|Hembusan angin kencang|45 km/jam atau lebih|
|Peluang hujan tinggi|85 persen atau lebih|
|Peringatan BMKG|aktif untuk kecamatan yang dipantau|

Untuk tingkat keparahannya: DANGER kalau AQI menyentuh 201 atau UV menyentuh 11, WARNING kalau AQI menyentuh 151 atau curah hujan mencapai 10 mm, dan WATCH untuk kondisi lain yang tetap memicu peringatan.

### Fingerprint Notifikasi

Setiap kondisi darurat diringkas jadi satu fingerprint yang memuat tipe, tingkat keparahan, alasan, status BMKG, serta klasifikasi AQI, UV, dan risiko cuaca. Fingerprint inilah yang mencegah notifikasi yang sama dikirim berulang kali. Pesan pemulihan baru dikirim begitu kondisi darurat sebelumnya sudah mereda.

## Sumber Data

|Sumber|Kegunaan|
|-|-|
|Open-Meteo Weather API|Cuaca terkini, prakiraan harian, dan peluang hujan per jam.|
|Open-Meteo Air Quality API|US AQI, partikulat, gas polutan, dan indeks UV.|
|BMKG Peringatan Dini Cuaca (RSS nowcast)|Peringatan dini cuaca yang dicocokkan dengan kecamatan sekitar.|
|OpenStreetMap Nominatim|Reverse geocoding untuk menentukan kota, kecamatan, dan wilayah sekitar.|

Semua sumber di atas bersifat publik dan tidak butuh API key.

## Prasyarat

* Node.js versi 22 atau yang lebih baru.
* NPM (sudah otomatis terpasang bersama Node.js).
* Git untuk meng-clone repositori.
* Sebuah webhook Discord yang aktif.
* Akun dan repositori GitHub, jika ingin memakai otomatisasi cron dan publikasi dashboard.

## Panduan

Bagian ini merangkum seluruh proses secara berurutan. Ada dua jalur: menjalankan di komputer sendiri, dan otomatisasi GitHub

### Jalur A: Menjalankan di Komputer Sendiri

Gunakan jalur ini untuk uji coba, pengembangan, atau sekadar memastikan semuanya berjalan sebelum diotomatiskan.

1. **Clone repositori dan masuk ke foldernya.**

```bash
   git clone https://github.com/mhmmdnrfhreza-code/in-atmosphere.git
   cd in-atmosphere
   ```

2. **Pasang dependensi.** Folder `node\_modules` tidak ikut di repositori, jadi perlu dibangun ulang di sini.

```bash
   npm install
   ```

3. **Siapkan variabel lingkungan.** Salin berkas contoh, lalu isi `DISCORD\_WEBHOOK\_URL` dengan URL webhook Discord Anda.

```bash
   cp .env.example .env
   ```

4. **Sesuaikan lokasi (opsional).** Ubah koordinat di `data/location.json` kalau ingin memantau wilayah selain bawaan.
5. **Jalankan uji coba.** Cara tercepat memastikan pipeline utuh adalah menjalankan mode manual.

```bash
   npm run dev
   ```

   Kalau berhasil, notifikasi masuk ke Discord dan berkas `public/data/latest.json` diperbarui.

6. **Pratinjau dashboard.** Buka dashboard di browser lewat server statis lokal.

```bash
   npm run preview
   ```

7. **Jalankan pengujian (opsional).** Untuk memastikan logika inti tetap sehat.

```bash
   npm test
   ```

Sistem dianggap siap di lokal kalau: `npm run dev` selesai tanpa error, notifikasi muncul di Discord, dan dashboard tampil dengan data terbaru.

### Jalur B: Otomatisasi GitHub

Gunakan jalur ini supaya sistem berjalan berkala sendiri tanpa perlu komputer yang menyala terus.

1. **Unggah kode ke repositori GitHub Anda.**

```bash
   git remote set-url origin https://github.com/USERNAME/NAMA-REPO.git
   git add .
   git commit -m "Setup In Atmosphere"
   git push -u origin main
   ```

   Pastikan `package-lock.json` ikut ter-commit supaya versi dependensi tetap terkunci.

2. **Tambahkan konfigurasi rahasia.** Masuk ke `Settings > Secrets and variables > Actions` pada repositori, lalu tambahkan Secret `DISCORD\_WEBHOOK\_URL`. Bila dashboard sudah punya URL publik, tambahkan juga Variable `DASHBOARD\_URL`.
3. **Aktifkan GitHub Pages.** Masuk ke `Settings > Pages`, lalu atur sumbernya ke GitHub Actions. Langkah ini membuat tahap deploy dashboard bisa berjalan.
4. **Uji jalankan workflow secara manual.** Buka tab `Actions`, pilih workflow In Atmosphere Monitor, lalu jalankan lewat `Run workflow` (`workflow\_dispatch`) dan pilih salah satu mode.
5. **Verifikasi hasilnya.** Cek bahwa workflow selesai hijau, notifikasi masuk ke Discord, `public/data/latest.json` ter-commit ulang oleh bot, dan dashboard publik menampilkan data terbaru.

Setelah itu, jadwal cron akan menjalankan sistem secara otomatis sesuai mode yang sudah ditentukan.

## Instalasi

```bash
git clone https://github.com/mhmmdnrfhreza-code/in-atmosphere.git
cd in-atmosphere
npm install
```

## Konfigurasi

### Variabel Lingkungan

Salin dulu berkas contohnya, lalu isi nilainya.

```bash
cp .env.example .env
```

Contoh isi berkas `.env`:

```env
DISCORD\_WEBHOOK\_URL="https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz"
DASHBOARD\_URL="https://username.github.io/in-atmosphere/"
```

|Variabel|Wajib|Keterangan|
|-|-|-|
|`DISCORD\_WEBHOOK\_URL`|Ya|URL webhook Discord tujuan notifikasi.|
|`DASHBOARD\_URL`|Tidak|URL dashboard publik yang ditautkan di notifikasi Discord.|
|`REPORT\_MODE`|Tidak|Menetapkan mode laporan secara manual: `manual`, `morning`, `rush-hour`, atau `emergency-watch`.|

### Lokasi Pemantauan

Koordinat lokasi diatur di `data/location.json`.

```json
{
  "latitude": -6.5963564,
  "longitude": 106.7973188,
  "timezone": "Asia/Jakarta",
  "kecamatanRadiusKm": 10
}
```

|Kolom|Keterangan|
|-|-|
|`latitude`|Garis lintang lokasi yang dipantau.|
|`longitude`|Garis bujur lokasi yang dipantau.|
|`timezone`|Zona waktu yang dipakai saat memanggil API cuaca.|
|`kecamatanRadiusKm`|Radius pengambilan kecamatan sekitar untuk mencocokkan peringatan BMKG.|

Hasil geocoding disimpan di `data/location\_context.json` sebagai cache, dan akan diperbarui otomatis kalau koordinat atau radiusnya berubah.

## Menjalankan Aplikasi

### Mode Pengembangan

Menjalankan sumber TypeScript secara langsung lewat tsx.

```bash
npm run dev              # mode manual
npm run dev:morning      # mode morning
npm run dev:rush         # mode rush-hour
npm run dev:watch        # mode emergency-watch
```

### Mode Produksi

Build dulu ke JavaScript, baru jalankan hasilnya.

```bash
npm run build
npm start                # mode manual
npm run start:morning    # mode morning
npm run start:rush       # mode rush-hour
npm run start:watch      # mode emergency-watch
```

## Dashboard

Dashboard berupa halaman statis di folder `public/` yang membaca `public/data/latest.json`. Halaman ini menampilkan status keseluruhan, metrik cuaca, kualitas udara, indeks UV, prakiraan hujan, peringatan BMKG, saran kesehatan, dan informasi sistem. Tersedia juga mode terang dan gelap serta navigasi antarbagian.

Untuk pratinjau di lokal:

```bash
npm run preview
```

Perintah itu menyajikan folder `public/` lewat server statis. Karena dashboard cuma bergantung pada satu berkas JSON, ia gampang dipublikasikan lewat GitHub Pages.

## Otomatisasi GitHub Actions

Workflow `.github/workflows/in-atmosphere-monitor.yml` mengatur jadwal eksekusi sekaligus publikasi dashboard. Garis besar tahapannya:

1. Checkout repositori.
2. Menyiapkan Node.js versi 22 lengkap dengan cache npm.
3. Memasang dependensi lewat `npm ci`.
4. Menjalankan build TypeScript.
5. Menentukan mode laporan dari jadwal cron atau input `workflow\_dispatch`.
6. Menjalankan aplikasi dengan `npm start`.
7. Meng-commit perubahan `data/state.json` dan `public/data/latest.json`.
8. Mempublikasikan folder `public/` ke GitHub Pages.

Workflow-nya juga bisa dipicu manual lewat `workflow\_dispatch` dengan pilihan mode: `manual`, `morning`, `rush-hour`, atau `emergency-watch`.

### Konfigurasi Rahasia dan Variabel Repositori

Supaya otomatisasi jalan, tambahkan konfigurasi berikut di pengaturan repositori GitHub.

|Nama|Jenis|Keterangan|
|-|-|-|
|`DISCORD\_WEBHOOK\_URL`|Secret|URL webhook Discord.|
|`DASHBOARD\_URL`|Variable|URL dashboard publik (opsional).|

Jangan lupa aktifkan GitHub Pages di repositori supaya tahap deploy bisa berjalan.

## Pengujian

Pengujian unit memakai Vitest dan ada di folder `tests/`.

```bash
npm test
```

Saat ini pengujiannya mencakup keputusan pengiriman peringatan, penyimpanan state, pemetaan data atmosfer, orkestrasi notifikasi Discord, dan pembentukan fingerprint darurat.

## Berkas Data dan State

|Berkas|Peran|
|-|-|
|`data/location.json`|Konfigurasi koordinat lokasi yang dipantau.|
|`data/location\_context.json`|Cache hasil geocoding, mencakup kota, kecamatan, dan wilayah sekitar.|
|`data/state.json`|State runtime untuk menjaga siklus notifikasi tetap konsisten antareksekusi.|
|`public/data/latest.json`|Snapshot terbaru yang dipakai dashboard.|

Berkas `data/state.json` dan `public/data/latest.json` diperbarui otomatis tiap kali aplikasi jalan, lalu di-commit ulang oleh workflow.

## Skrip NPM

|Skrip|Fungsi|
|-|-|
|`dev`|Menjalankan aplikasi dari sumber TypeScript (mode manual).|
|`dev:morning`|Menjalankan sumber dengan mode morning.|
|`dev:rush`|Menjalankan sumber dengan mode rush-hour.|
|`dev:watch`|Menjalankan sumber dengan mode emergency-watch.|
|`build`|Meng-compile TypeScript ke folder `dist`.|
|`start`|Menjalankan hasil build (mode manual).|
|`start:morning`|Menjalankan hasil build dengan mode morning.|
|`start:rush`|Menjalankan hasil build dengan mode rush-hour.|
|`start:watch`|Menjalankan hasil build dengan mode emergency-watch.|
|`test`|Menjalankan pengujian unit dengan Vitest.|
|`preview`|Menyajikan folder `public/` untuk pratinjau dashboard.|

## Troubleshooting

Beberapa kendala umum beserta penyebab dan solusinya.

|Masalah|Penyebab|Solusi|
|-|-|-|
|Aplikasi berhenti dengan pesan "DISCORD\_WEBHOOK\_URL belum diatur di file .env"|Variabel `DISCORD\_WEBHOOK\_URL` belum terisi.|Buat `.env` dari `.env.example` lalu isi URL webhook-nya. Di GitHub Actions, tambahkan Secret `DISCORD\_WEBHOOK\_URL` pada pengaturan repositori.|
|Notifikasi tidak masuk ke Discord|URL webhook tidak valid, sudah dihapus, atau tersalin tidak utuh.|Pastikan webhook masih ada dan URL tersalin penuh termasuk token setelah ID. Cek log job GitHub Actions untuk melihat error pengiriman.|
|Peringatan BMKG tidak muncul atau muncul log "Gagal mengambil warning BMKG"|Sumber RSS BMKG sedang tidak dapat diakses, atau peringatan tidak memuat nama kecamatan yang terdaftar.|Sistem tetap jalan dengan daftar kosong, jadi coba jalankan ulang nanti. Periksa `data/location\_context.json` untuk memastikan nama kecamatan yang dipantau sudah benar.|
|Lokasi terbaca "Kecamatan Tidak Diketahui" atau wilayahnya keliru|Koordinat salah, cache geocoding sudah lama, atau permintaan Nominatim kena batas.|Perbaiki `latitude` dan `longitude` di `data/location.json`. Hapus `data/location\_context.json` agar dipetakan ulang. Beri jeda lalu jalankan lagi bila kena batas permintaan.|
|Dashboard kosong atau datanya tidak terbarui|`public/data/latest.json` belum terisi, atau `index.html` dibuka langsung tanpa server.|Jalankan aplikasi minimal sekali (`npm run dev` atau `npm start`). Pakai `npm run preview` untuk pratinjau. Pada GitHub Pages, pastikan workflow sukses dan `latest.json` ter-commit ulang.|
|Gagal build atau error saat dijalankan|Versi Node.js tidak sesuai atau dependensi tidak konsisten.|Gunakan Node.js 22 atau lebih baru (`node -v`). Hapus `node\_modules` lalu `npm install` ulang. Di lingkungan CI, gunakan `npm ci`.|
|Workflow GitHub Actions gagal pada tahap commit atau push|Izin `contents: write` diubah, atau terjadi konflik saat push.|Pertahankan izin `contents: write` pada workflow. Workflow sudah menjalankan `git pull --rebase` sebelum push, jadi jalankan ulang bila kegagalannya bersifat sementara.|

## Lisensi

GNU Affero General Public License Version 3.0 or Later

