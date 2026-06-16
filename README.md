# SEAPEDIA

Platform e-commerce multi-role berbasis web yang memungkinkan Buyer berbelanja, Seller berjualan, dan Driver mengantarkan pesanan — semuanya dalam satu ekosistem.

## Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Project](#struktur-project)
- [Cara Menjalankan](#cara-menjalankan)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Demo Accounts](#demo-accounts)
- [Role & Akses](#role--akses)
- [Alur Penggunaan](#alur-penggunaan)
- [Aturan Bisnis](#aturan-bisnis)
- [Security](#security)
- [Testing Guide](#testing-guide)
- [API Overview](#api-overview)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Demo Accounts](#demo-accounts)
- [Role & Akses](#role--akses)
- [Alur Penggunaan](#alur-penggunaan)
- [Aturan Bisnis](#aturan-bisnis)
- [Security](#security)
- [Testing Guide](#testing-guide)
- [API Overview](#api-overview)

---

## Fitur

### Buyer
- Registrasi & login multi-role
- Jelajahi & cari produk (search, filter kategori, sort harga)
- Keranjang belanja (single-store rule)
- Checkout dengan pilihan metode pengiriman (Instant / Next Day / Regular)
- Voucher & kode promo
- Dompet digital (top up & riwayat transaksi)
- Manajemen alamat pengiriman
- Tracking pesanan real-time
- Laporan pengeluaran

### Seller
- Buat & kelola toko
- Manajemen produk (tambah, edit, hapus)
- Proses pesanan masuk
- Laporan pendapatan

### Driver
- Lihat job pengiriman yang tersedia
- Ambil & selesaikan job
- Riwayat job & total penghasilan (80% dari delivery fee)

### Admin
- Dashboard statistik (user, toko, produk, pesanan, pengiriman)
- Manajemen voucher & promo
- Monitoring overdue order dengan sistem refund & reversal otomatis

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12, PHP 8.3 |
| Auth | JWT (tymon/jwt-auth) |
| Database | SQLite (dev) |
| Frontend | Vue 3, Vite, Pinia |
| UI | Tailwind CSS v4, shadcn-vue, Lucide Icons |
| HTTP Client | Axios |

---

## Struktur Project

```
seapedia/
├── backend/          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ProductController.php
│   │   │   ├── SellerProductController.php
│   │   │   ├── StoreController.php
│   │   │   ├── CartController.php
│   │   │   ├── OrderController.php
│   │   │   ├── DeliveryController.php
│   │   │   ├── WalletController.php
│   │   │   ├── AddressController.php
│   │   │   ├── VoucherController.php
│   │   │   ├── PromoController.php
│   │   │   ├── ReviewController.php
│   │   │   ├── AdminController.php
│   │   │   └── OverdueController.php
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
└── frontend/         # Vue 3 SPA
    └── src/
        ├── views/
        │   ├── auth/
        │   ├── buyer/
        │   ├── seller/
        │   ├── driver/
        │   ├── admin/
        │   └── public/
        ├── stores/       # Pinia stores
        ├── services/     # API services (axios)
        └── router/
```

---

## Cara Menjalankan

### Prasyarat
- PHP 8.3+
- Composer
- Node.js 18+
- npm

### Backend

```bash
cd backend

# Install dependencies
composer install

# Salin file environment
cp .env.example .env

# Generate app key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Jalankan migrasi & seeder
php artisan migrate --seed

# Jalankan server
php artisan serve
```

API akan berjalan di `http://localhost:8000`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

---

## Konfigurasi Environment

Salin `backend/.env.example` ke `backend/.env` dan sesuaikan:

```env
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# Untuk MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=seapedia
# DB_USERNAME=root
# DB_PASSWORD=

JWT_SECRET=       # diisi otomatis oleh php artisan jwt:secret
JWT_TTL=1440      # token lifetime dalam menit (default 24 jam)
```

---

## Demo Accounts

Semua akun sudah tersedia setelah menjalankan `php artisan migrate --seed`.

| Role | Username | Email | Password |
|---|---|---|---|
| Admin | `admin` | admin@seapedia.com | `admin123` |
| Seller | `seller1` | seller1@seapedia.com | `seller123` |
| Seller | `seller2` | seller2@seapedia.com | `seller123` |
| Buyer | `buyer1` | buyer1@seapedia.com | `buyer123` |
| Buyer | `buyer2` | buyer2@seapedia.com | `buyer123` |
| Driver | `driver1` | driver1@seapedia.com | `driver123` |
| Driver | `driver2` | driver2@seapedia.com | `driver123` |
| Multi-role (Buyer+Seller+Driver) | `multiuser` | multi@seapedia.com | `multi123` |

> `buyer1` memiliki saldo awal Rp 5.000.000 dan sudah memiliki alamat pengiriman.

---

## Role & Akses

Satu user dapat memiliki lebih dari satu role. Role aktif ditentukan saat login dan tersimpan di JWT payload.

| Role | Deskripsi |
|---|---|
| `buyer` | Berbelanja, mengelola alamat, dompet, dan pesanan |
| `seller` | Mengelola toko, produk, dan memproses pesanan |
| `driver` | Mengambil dan menyelesaikan job pengiriman |
| `admin` | Monitoring platform, manajemen voucher/promo, penanganan overdue |

---

## Alur Penggunaan

### Alur Checkout (Buyer)
1. Tambah produk ke keranjang
2. Pilih metode pengiriman & opsional voucher/promo
3. Preview total biaya (subtotal + ongkir − diskon + PPN 12%)
4. Pilih alamat pengiriman
5. Checkout — saldo wallet dipotong otomatis

### Alur Pengiriman
1. **Seller** menerima pesanan → klik "Proses" → status: `menunggu_pengirim`
2. **Driver** melihat job tersedia → ambil job → status: `sedang_dikirim`
3. **Driver** konfirmasi selesai → status: `pesanan_selesai`

### Alur Overdue
Jika pesanan melewati batas waktu SLA:

| Metode | SLA |
|---|---|
| Instant | 1 hari |
| Next Day | 2 hari |
| Regular | 5 hari |

Admin menjalankan `POST /api/admin/overdue/process`:
- Status pesanan berubah ke `dikembalikan`
- Buyer mendapat refund penuh ke wallet
- Pendapatan seller di-reversal

---

## Aturan Bisnis

### Single-Store Checkout
Keranjang hanya bisa berisi produk dari **satu toko**. Jika buyer mencoba menambah produk dari toko lain, sistem akan menolak dan menampilkan pesan error. Buyer harus mengosongkan keranjang terlebih dahulu sebelum bisa berbelanja dari toko yang berbeda. Aturan ini diterapkan di backend (CartController) dan dijelaskan di UI.

### Perhitungan Checkout

```
Subtotal        = Σ (harga × jumlah) per item
Discount        = voucher_discount + promo_discount
Tax Base        = subtotal + delivery_fee - discount
PPN 12%         = tax_base × 0.12
Total           = tax_base + ppn
```

PPN dihitung **setelah** diskon dan ongkir. Ini berarti diskon mengurangi dasar pengenaan pajak.

### Delivery Fee

| Metode | Biaya | SLA |
|---|---|---|
| Instant | Rp 25.000 | 1 hari |
| Next Day | Rp 15.000 | 2 hari |
| Regular | Rp 10.000 | 5 hari |

### Aturan Diskon (Voucher & Promo)
- Voucher dan Promo **bisa dikombinasikan** dalam satu checkout.
- Voucher memiliki batas penggunaan (`usage_limit`) dan tanggal kadaluarsa.
- Promo hanya memiliki tanggal kadaluarsa (tanpa batas penggunaan).
- Kedua tipe diskon mendukung `percentage` (%) dan `fixed` (nominal Rp).
- Jika tipe `percentage`, nilai diskon maksimal 100%.
- Discount type `percentage` dapat dibatasi dengan `max_discount`.

### Driver Earning
Driver mendapatkan **80%** dari delivery fee pesanan yang berhasil dikirim.

| Metode | Delivery Fee | Earning Driver |
|---|---|---|
| Instant | Rp 25.000 | Rp 20.000 |
| Next Day | Rp 15.000 | Rp 12.000 |
| Regular | Rp 10.000 | Rp 8.000 |

Earning dicatat di tabel `deliveries.earning` setelah driver menyelesaikan job.

### Overdue & Simulasi Waktu
Pesanan dianggap overdue jika melewati SLA berdasarkan metode pengiriman. Admin dapat memproses overdue melalui:

1. **Lihat overdue**: `GET /api/admin/overdue`
2. **Proses refund**: `POST /api/admin/overdue/process`
3. **Simulasi hari berikutnya**: `POST /api/admin/simulate-next-day` — memundurkan `created_at` semua pesanan aktif 1 hari (untuk demo)

Saat overdue diproses:
- Status pesanan → `dikembalikan`
- Saldo buyer dikembalikan penuh
- Pendapatan seller di-reversal
- Stok produk dikembalikan
- Semua tercatat di status history & wallet transactions

Sistem mencegah double refund, double reversal, dan double stock restoration.

---

## Security

### SQL Injection
Semua query database menggunakan **Laravel Eloquent ORM** dengan parameterized binding. Tidak ada raw query yang menerima input user langsung. Input yang digunakan di `LIKE` query (search produk) di-escape melalui mekanisme binding Laravel.

### XSS (Cross-Site Scripting)
- **Frontend**: Vue 3 secara default melakukan escaping pada semua data yang di-render via template (`{{ }}`). Data user tidak pernah di-render dengan `v-html`.
- **Backend**: Semua input divalidasi dan dibatasi panjangnya sebelum disimpan. Output API berupa JSON yang di-parse browser, bukan HTML mentah.
- Review comments dirender sebagai teks biasa — script tag tidak akan dieksekusi.

### Input Validation
Validasi dilakukan di dua lapisan:
- **Frontend**: cek sebelum submit (password match, min/max nilai, field wajib)
- **Backend**: Laravel `$request->validate()` di setiap controller dengan aturan tipe data, panjang, format, dan keunikan

### Session & Token
- Autentikasi menggunakan **JWT (JSON Web Token)** via `tymon/jwt-auth`
- Token lifetime: **1440 menit (24 jam)**, dapat dikonfigurasi via `JWT_TTL` di `.env`
- Active role disimpan dalam JWT payload (`active_role` claim)
- Logout menginvalidasi token di server (blacklist)
- Setelah logout, token yang sama tidak dapat digunakan kembali

### Role-Based Access Control (RBAC)
- Setiap endpoint terproteksi memverifikasi `active_role` dari JWT payload — bukan dari request body atau query string
- Seller hanya bisa mengakses/memodifikasi produk dan pesanan milik tokonya sendiri
- Buyer hanya bisa mengakses alamat, pesanan, dan cart miliknya sendiri
- Driver hanya bisa menyelesaikan job yang dia ambil sendiri
- Admin-only endpoints menolak semua role lain dengan HTTP 403

---

## Testing Guide

### End-to-End Demo Flow

#### 1. Buyer Checkout
```
Login sebagai buyer1 (role: buyer)
→ Jelajahi produk di /products
→ Tambah produk ke keranjang
→ Buka /buyer/cart → pilih metode pengiriman
→ Masukkan kode voucher (jika ada) → Preview total
→ Pilih alamat → Checkout
→ Cek /buyer/orders untuk melihat pesanan
```

#### 2. Seller Proses Pesanan
```
Login sebagai seller1 (role: seller)
→ Buka /seller/orders → lihat pesanan masuk (status: Sedang Dikemas)
→ Klik "Proses" → status berubah ke Menunggu Pengirim
```

#### 3. Driver Antar Pesanan
```
Login sebagai driver1 (role: driver)
→ Buka /driver → lihat job tersedia
→ Klik "Ambil Job" → status berubah ke Sedang Dikirim
→ Klik "Selesai" → status berubah ke Pesanan Selesai
```

#### 4. Admin - Overdue Simulation
```
Login sebagai admin (role: admin)
→ Buka /admin/dashboard → lihat statistik
→ POST /api/admin/simulate-next-day beberapa kali (lewati SLA)
→ GET /api/admin/overdue → lihat pesanan overdue
→ POST /api/admin/overdue/process → proses refund otomatis
```

#### 5. Security Test
```
XSS: Input <script>alert('xss')</script> di form review
→ Teks tampil aman sebagai literal, tidak dieksekusi

SQL Injection: Input ' OR '1'='1 di form login/search
→ Login gagal dengan pesan error biasa, tidak bypass auth
```

### Membuat Voucher untuk Demo
```bash
# via API (login sebagai admin terlebih dahulu)
POST /api/admin/vouchers
{
  "code": "DEMO20",
  "discount_type": "percentage",
  "discount_value": 20,
  "usage_limit": 100,
  "expires_at": "2027-12-31T23:59:59"
}
```

---

## API Overview

Base URL: `http://localhost:8000/api`

### Autentikasi

Semua endpoint terproteksi membutuhkan header:
```
Authorization: Bearer <token>
```

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/auth/register` | Registrasi user baru |
| POST | `/auth/login` | Login & dapatkan token JWT |
| GET | `/auth/me` | Info user yang sedang login |
| POST | `/auth/logout` | Logout & invalidate token |
| POST | `/auth/switch-role` | Ganti role aktif |

### Produk (Public)

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/products` | Daftar produk |
| GET | `/products/{id}` | Detail produk |
| GET | `/stores/{store}` | Profil toko publik |

Query params `/products`: `search`, `category`, `sort` (`terbaru`/`harga_asc`/`harga_desc`), `store_id`, `per_page`, `page`

### Buyer

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/buyer/wallet` | Info saldo |
| POST | `/buyer/wallet/topup` | Top up saldo (min: 10.000, max: 10.000.000) |
| GET | `/buyer/wallet/transactions` | Riwayat transaksi |
| GET | `/buyer/addresses` | Daftar alamat |
| POST | `/buyer/addresses` | Tambah alamat |
| PUT | `/buyer/addresses/{id}` | Edit alamat |
| DELETE | `/buyer/addresses/{id}` | Hapus alamat |
| PATCH | `/buyer/addresses/{id}/default` | Set alamat utama |
| GET | `/buyer/cart` | Isi keranjang |
| POST | `/buyer/cart/items` | Tambah item ke keranjang |
| PUT | `/buyer/cart/items/{id}` | Update jumlah item |
| DELETE | `/buyer/cart/items/{id}` | Hapus item |
| DELETE | `/buyer/cart` | Kosongkan keranjang |
| POST | `/buyer/checkout/preview` | Preview total biaya |
| POST | `/buyer/checkout` | Proses checkout |
| GET | `/buyer/orders` | Daftar pesanan |
| GET | `/buyer/orders/{id}` | Detail pesanan |
| GET | `/buyer/orders/{id}/tracking` | Tracking pengiriman |
| GET | `/buyer/report` | Laporan pengeluaran |

### Seller

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/seller/store` | Info toko |
| POST | `/seller/store` | Buat toko |
| PUT | `/seller/store` | Update toko |
| GET | `/seller/products` | Daftar produk toko |
| POST | `/seller/products` | Tambah produk |
| PUT | `/seller/products/{id}` | Edit produk |
| DELETE | `/seller/products/{id}` | Hapus produk |
| GET | `/seller/orders` | Daftar pesanan masuk |
| PATCH | `/seller/orders/{id}/process` | Proses pesanan |
| GET | `/seller/orders/{id}/tracking` | Tracking pesanan |
| GET | `/seller/report` | Laporan pendapatan |

### Driver

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/driver/jobs` | Job tersedia |
| GET | `/driver/jobs/{id}` | Detail job |
| PATCH | `/driver/jobs/{id}/take` | Ambil job |
| PATCH | `/driver/jobs/{id}/complete` | Selesaikan job |
| GET | `/driver/active-job` | Job aktif saat ini |
| GET | `/driver/my-jobs` | Riwayat job & total penghasilan |

### Admin

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/admin/dashboard` | Statistik platform |
| GET | `/admin/users` | Daftar user |
| GET | `/admin/stores` | Daftar toko |
| GET | `/admin/products` | Daftar produk |
| GET | `/admin/orders` | Daftar pesanan |
| GET | `/admin/deliveries` | Daftar pengiriman |
| GET | `/admin/overdue` | Daftar pesanan overdue |
| POST | `/admin/overdue/process` | Proses semua pesanan overdue |
| POST | `/admin/simulate-next-day` | Simulasi hari berikutnya (testing) |
| GET | `/admin/vouchers` | Daftar voucher |
| POST | `/admin/vouchers` | Buat voucher |
| DELETE | `/admin/vouchers/{id}` | Hapus voucher |
| GET | `/admin/promos` | Daftar promo |
| POST | `/admin/promos` | Buat promo |
| DELETE | `/admin/promos/{id}` | Hapus promo |

### Ulasan & Diskon

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/reviews` | Daftar ulasan |
| POST | `/reviews` | Tulis ulasan |
| PUT | `/reviews/{id}` | Edit ulasan (pemilik saja) |
| POST | `/vouchers/validate` | Validasi kode voucher |
| POST | `/promos/validate` | Validasi kode promo |
