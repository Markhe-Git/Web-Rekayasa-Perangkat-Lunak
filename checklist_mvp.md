# ✅ Checklist Fitur MVP — Pintika (Sistem Peminjaman & Inventaris HIMTIKA)

> **Tanggal Pengujian:** 29 Oktober 2026  
> **Framework Test:** Vitest v5.0.4  
> **Hasil Keseluruhan:** **7 Test Files — 32 Tests — ALL PASSED ✅**

---

## 1. Autentikasi & Registrasi (Auth)

**File Test:** `src/__tests__/auth.test.js` — **8 tests PASSED ✅**

### 1.1 Login (`POST /api/auth/login`)

| # | Fitur | Deskripsi | Unit Test | Status |
|---|-------|-----------|-----------|--------|
| 1 | Login dengan NIM/Email & Password | User dapat masuk menggunakan NIM atau Email sebagai identifier | ✅ `returns 200 and user info on valid credentials` | **PASSED** |
| 2 | Validasi field wajib login | Mengembalikan error 400 jika identifier atau password kosong | ✅ `returns 400 when identifier or password is missing` | **PASSED** |
| 3 | User tidak ditemukan | Mengembalikan error 401 jika NIM/Email tidak terdaftar | ✅ `returns 401 when user is not found` | **PASSED** |
| 4 | Password salah | Mengembalikan error 401 jika password tidak cocok | ✅ `returns 401 when password does not match` | **PASSED** |

### 1.2 Registrasi (`POST /api/auth/register`)

| # | Fitur | Deskripsi | Unit Test | Status |
|---|-------|-----------|-----------|--------|
| 5 | Registrasi akun baru | Membuat user baru dengan role default Anggota dan IdUser auto-increment | ✅ `creates user with auto-incremented IdUser and default Anggota role` | **PASSED** |
| 6 | Validasi field wajib registrasi | Mengembalikan error 400 jika field wajib tidak lengkap | ✅ `returns 400 when required fields are missing` | **PASSED** |
| 7 | Validasi format email registrasi | Mengembalikan error 400 jika format email tidak valid (harus mengandung '@') | ✅ `returns 400 when email format is invalid` | **PASSED** |
| 8 | NIM/Email duplikat | Mengembalikan error 409 jika NIM atau Email sudah terdaftar | ✅ `returns 409 when NIM or Email already exists` | **PASSED** |

---

## 2. Dashboard

**File Test:** `src/__tests__/dashboard.test.js` — **2 tests PASSED ✅**

| # | Fitur | Deskripsi | Unit Test | Status |
|---|-------|-----------|-----------|--------|
| 9 | Statistik ringkasan sistem | Mengagregasi total users, barang, kategori, status peminjaman, dan status barang | ✅ `aggregates database counts and recent loan records` | **PASSED** |
| 10 | Error handling dashboard | Mengembalikan error 500 dengan pesan jika query database gagal | ✅ `returns an error response when a dashboard query fails` | **PASSED** |

### Komponen Frontend Dashboard

| # | Fitur | Deskripsi | Status |
|---|-------|-----------|--------|
| 11 | Stat Cards | Menampilkan Total Barang, Peminjaman Pending, Sedang Dipinjam, Total Pengguna | ✅ Terimplementasi |
| 12 | Tabel peminjaman terbaru | Menampilkan daftar peminjaman terbaru (ID, Peminjam, Tujuan, Tanggal, Status) | ✅ Terimplementasi |
| 13 | Rekap status peminjaman | Menampilkan count Pending, Disetujui, Selesai, Ditolak | ✅ Terimplementasi |
| 14 | Rekap kondisi barang | Menampilkan count Tersedia, Dipinjam, Maintenance | ✅ Terimplementasi |
| 15 | Pesan selamat datang berdasarkan role | Greeting berbeda untuk Admin vs Anggota | ✅ Terimplementasi |

---

## 3. Manajemen Users (Khusus Admin)

**File Test:** `src/__tests__/users.test.js` — **4 tests PASSED ✅**

| # | Fitur | Deskripsi | Unit Test | Status |
|---|-------|-----------|-----------|--------|
| 16 | Daftar users dengan pencarian | Menampilkan list users dengan filter search (nama/NIM/email) | ✅ `lists users with search and creates a user` | **PASSED** |
| 17 | Tambah user baru | Membuat user baru dengan role default Anggota | ✅ `lists users with search and creates a user` | **PASSED** |
| 18 | Validasi field wajib user | Mengembalikan error 400 jika data tidak lengkap | ✅ `lists users with search and creates a user` | **PASSED** |
| 19 | Cegah duplikasi user | Mengembalikan error 409 jika NIM/Email sudah ada | ✅ `rejects duplicate users and retrieves/updates a user without replacing an omitted password` | **PASSED** |
| 20 | Detail user (GET by ID) | Mengambil data user berdasarkan ID | ✅ `rejects duplicate users and retrieves/updates a user without replacing an omitted password` | **PASSED** |
| 21 | Update user tanpa ganti password | Mengubah data user, password tidak terganti jika tidak dikirim | ✅ `rejects duplicate users and retrieves/updates a user without replacing an omitted password` | **PASSED** |
| 22 | Blokir hapus user dengan data peminjaman | Mengembalikan error 400 jika user memiliki riwayat peminjaman | ✅ `blocks deleting a user with loan data and deletes an unused user` | **PASSED** |
| 23 | Hapus user tanpa data peminjaman | Berhasil menghapus user yang tidak memiliki data loan | ✅ `blocks deleting a user with loan data and deletes an unused user` | **PASSED** |
| 24 | User tidak ditemukan (404) | Mengembalikan error 404 jika user tidak ditemukan | ✅ `returns not found for a missing user` | **PASSED** |

---

## 4. Manajemen Kategori Barang (Khusus Admin)

**File Test:** `src/__tests__/kategori.test.js` — **3 tests PASSED ✅**

| # | Fitur | Deskripsi | Unit Test | Status |
|---|-------|-----------|-----------|--------|
| 25 | Daftar kategori | Menampilkan list seluruh kategori barang | ✅ `lists and creates kategori` | **PASSED** |
| 26 | Tambah kategori baru | Membuat kategori baru dengan auto-trim nama | ✅ `lists and creates kategori` | **PASSED** |
| 27 | Validasi nama kategori kosong | Mengembalikan error 400 jika nama kategori kosong/spasi | ✅ `lists and creates kategori` | **PASSED** |
| 28 | Update nama kategori | Mengubah nama kategori dengan auto-trim | ✅ `updates kategori and prevents deleting a kategori that has barang` | **PASSED** |
| 29 | Validasi update kategori kosong | Mengembalikan error 400 jika nama kategori baru kosong | ✅ `updates kategori and prevents deleting a kategori that has barang` | **PASSED** |
| 30 | Blokir hapus kategori berisi barang | Mengembalikan error 400 jika kategori masih memiliki barang | ✅ `updates kategori and prevents deleting a kategori that has barang` | **PASSED** |
| 31 | Hapus kategori kosong | Berhasil menghapus kategori yang tidak memiliki barang | ✅ `deletes kategori when it has no barang` | **PASSED** |

---

## 5. Manajemen Barang / Inventaris

**File Test:** `src/__tests__/barang.test.js` — **5 tests PASSED ✅**

| # | Fitur | Deskripsi | Unit Test | Status |
|---|-------|-----------|-----------|--------|
| 32 | Daftar barang dengan filter | Pencarian berdasarkan nama/kode + filter kategori & status | ✅ `lists barang using supplied search filters` | **PASSED** |
| 33 | Tambah barang baru | Membuat barang dengan default Kondisi=Baik, Status=Tersedia, auto-trim input | ✅ `rejects invalid barang creation and creates valid barang` | **PASSED** |
| 34 | Validasi tambah barang (field kosong) | Mengembalikan error 400 jika nama barang kosong | ✅ `rejects invalid barang creation and creates valid barang` | **PASSED** |
| 35 | Cegah kode inventaris duplikat (create) | Mengembalikan error 409 jika kode inventaris sudah ada | ✅ `rejects duplicate inventory codes` | **PASSED** |
| 36 | Detail barang (GET by ID) | Mengambil data barang berdasarkan ID | ✅ `retrieves, updates and deletes a barang` | **PASSED** |
| 37 | Update barang | Mengubah data barang (nama, kode, kondisi, status) | ✅ `retrieves, updates and deletes a barang` | **PASSED** |
| 38 | Hapus barang | Menghapus barang berdasarkan ID | ✅ `retrieves, updates and deletes a barang` | **PASSED** |
| 39 | Blokir hapus barang sedang dipinjam | Mengembalikan error 400 jika barang sedang aktif dalam peminjaman | ✅ `blocks deleting barang with an active loan and duplicate-code updates` | **PASSED** |
| 40 | Cegah kode inventaris duplikat (update) | Mengembalikan error 409 jika update kode inventaris konflik dengan barang lain | ✅ `blocks deleting barang with an active loan and duplicate-code updates` | **PASSED** |

---

## 6. Transaksi Peminjaman & Pengembalian

**File Test:** `src/__tests__/peminjaman.test.js` — **7 tests PASSED ✅**

| # | Fitur | Deskripsi | Unit Test | Status |
|---|-------|-----------|-----------|--------|
| 41 | Daftar peminjaman dengan filter | Filter berdasarkan status dan userId | ✅ `lists peminjaman using status and user filters` | **PASSED** |
| 42 | Validasi pengajuan peminjaman | Mengembalikan error 400 jika daftar barang kosong | ✅ `validates loan creation, refuses unavailable barang, and creates a pending loan` | **PASSED** |
| 43 | Cegah pinjam barang tidak tersedia | Mengembalikan error 409 jika barang sudah dipinjam/maintenance | ✅ `validates loan creation, refuses unavailable barang, and creates a pending loan` | **PASSED** |
| 44 | Buat pengajuan peminjaman baru | Membuat peminjaman dengan status Pending + detail barang | ✅ `validates loan creation, refuses unavailable barang, and creates a pending loan` | **PASSED** |
| 45 | Detail peminjaman (GET by ID) | Mengambil data peminjaman lengkap berdasarkan ID | ✅ `retrieves a loan and reports when it is missing` | **PASSED** |
| 46 | Peminjaman tidak ditemukan (404) | Mengembalikan error 404 jika peminjaman tidak ditemukan | ✅ `retrieves a loan and reports when it is missing` | **PASSED** |
| 47 | Approve peminjaman (transaksional) | Admin menyetujui + update status barang → Dipinjam (atomic) | ✅ `approves pending loans transactionally and rejects pending loans` | **PASSED** |
| 48 | Reject peminjaman | Admin menolak peminjaman + catatan admin | ✅ `approves pending loans transactionally and rejects pending loans` | **PASSED** |
| 49 | Pengembalian barang (Complete) | Konfirmasi pengembalian + catatan kondisi + status barang → Tersedia | ✅ `completes an approved loan and returns barang to available status` | **PASSED** |
| 50 | Batalkan peminjaman (Cancel) | Anggota membatalkan pengajuan berstatus Pending | ✅ `cancels a pending loan and rejects invalid loan actions` | **PASSED** |
| 51 | Tolak action tidak valid | Mengembalikan error 400 untuk action yang tidak dikenali | ✅ `cancels a pending loan and rejects invalid loan actions` | **PASSED** |
| 52 | Hapus peminjaman Pending | Hanya peminjaman berstatus Pending yang bisa dihapus | ✅ `deletes only pending loans` | **PASSED** |
| 53 | Blokir hapus peminjaman non-Pending | Mengembalikan error 400 jika mencoba menghapus peminjaman Approved/lainnya | ✅ `deletes only pending loans` | **PASSED** |
| 54 | Peminjaman tidak ditemukan saat hapus | Mengembalikan error 404 jika ID peminjaman tidak ada | ✅ `deletes only pending loans` | **PASSED** |

---

## 7. Komponen Frontend (UI)

| # | Komponen | Deskripsi | File | Status |
|---|----------|-----------|------|--------|
| 55 | Login Page | Form login dengan NIM/Email + Password, toggle show password, demo accounts | `src/components/login.js` | ✅ Terimplementasi |
| 56 | Register Page | Form registrasi dengan auto-generate IdUser dari NIM | `src/components/register.js` | ✅ Terimplementasi |
| 57 | Sidebar Navigation | Navigasi berdasarkan role (Admin: 5 menu, Anggota: 3 menu) | `src/components/Sidebar.js` | ✅ Terimplementasi |
| 58 | Dashboard (Admin & Anggota) | Statistik, tabel peminjaman terbaru, rekap status | `src/components/Dashboard.js` | ✅ Terimplementasi |
| 59 | Barang — Admin View | CRUD barang lengkap (tambah/edit/hapus) + filter | `src/components/Barang.js` | ✅ Terimplementasi |
| 60 | Barang — Member View | Katalog barang mode baca (read-only) + filter | `src/components/BarangMember.js` | ✅ Terimplementasi |
| 61 | Kategori Barang (Admin) | CRUD kategori barang | `src/components/Kategori.js` | ✅ Terimplementasi |
| 62 | Peminjaman — Admin View | CRUD peminjaman + approve/reject/complete | `src/components/Peminjaman.js` | ✅ Terimplementasi |
| 63 | Peminjaman — Member View | Ajukan peminjaman + lihat riwayat sendiri + batal | `src/components/PeminjamanMember.js` | ✅ Terimplementasi |
| 64 | Users Management (Admin) | CRUD data pengguna | `src/components/Users.js` | ✅ Terimplementasi |
| 65 | Confirm Modal | Modal konfirmasi reusable untuk aksi hapus | `src/components/ConfirmModal.js` | ✅ Terimplementasi |
| 66 | Logout dengan konfirmasi | Modal konfirmasi sebelum keluar dari sistem | `src/components/Sidebar.js` | ✅ Terimplementasi |

---

## 8. Database & Infrastruktur

| # | Fitur | Deskripsi | File | Status |
|---|-------|-----------|------|--------|
| 67 | Skema database (5 tabel utama + 2 tabel sync) | Users, KategoriBarang, Barang, Peminjaman, DetailPeminjaman, Repositories, Commits | `prisma/schema.prisma` | ✅ Terimplementasi |
| 68 | Enum — Role | Admin, Anggota | `prisma/schema.prisma` | ✅ Terimplementasi |
| 69 | Enum — KondisiBarang | Baik, RusakRingan, RusakBerat | `prisma/schema.prisma` | ✅ Terimplementasi |
| 70 | Enum — StatusBarang | Tersedia, Dipinjam, Maintenance | `prisma/schema.prisma` | ✅ Terimplementasi |
| 71 | Enum — StatusPeminjaman | Pending, Approved, Rejected, Completed, Cancelled | `prisma/schema.prisma` | ✅ Terimplementasi |
| 72 | Relasi & Foreign Keys | User↔Peminjaman, Kategori↔Barang, Barang↔DetailPeminjaman, Peminjaman↔Detail | `prisma/schema.prisma` | ✅ Terimplementasi |
| 73 | Cascade delete (DetailPeminjaman) | Hapus peminjaman otomatis menghapus detail terkait | `prisma/schema.prisma` | ✅ Terimplementasi |
| 74 | Seed data | Data awal untuk development/testing | `prisma/seed.js` | ✅ Terimplementasi |
| 75 | Prisma Client singleton | Koneksi database singleton untuk Next.js | `src/lib/prisma.js` | ✅ Terimplementasi |

---

## 9. Hak Akses & Role-Based Access

| # | Fitur | Deskripsi | Status |
|---|-------|-----------|--------|
| 76 | Admin — Akses penuh | Dashboard, Inventaris (CRUD), Peminjaman (Approve/Reject/Complete), Kategori (CRUD), Users (CRUD) | ✅ Terimplementasi |
| 77 | Anggota — Akses terbatas | Dashboard, Inventaris (Read-Only), Peminjaman (Ajukan/Lihat Riwayat/Batal) | ✅ Terimplementasi |
| 78 | Sidebar navigasi berdasarkan role | Menu Kategori & Users hanya muncul untuk Admin | ✅ Terimplementasi |
| 79 | View berbeda per role (Barang) | Admin → `Barang.js` (CRUD), Anggota → `BarangMember.js` (Read-Only) | ✅ Terimplementasi |
| 80 | View berbeda per role (Peminjaman) | Admin → `Peminjaman.js` (Full), Anggota → `PeminjamanMember.js` (Limited) | ✅ Terimplementasi |

---

## 7. Profil Pengguna (`src/components/profil.js`)

**File Test:** `src/__tests__/profil.test.js` — **3 tests PASSED ✅**

| # | Fitur | Deskripsi | Unit Test / Status | Status |
|---|-------|-----------|--------------------|--------|
| 81 | Edit Profil (NIM, Nama, Email, Password) | User dapat mengedit data identitas dan kredensial akun | ✅ `updates profile attributes (NIM, Nama, Email) with a new Password` | **PASSED** |
| 82 | Modal Konfirmasi Perubahan Data | Menampilkan rincian atribut (Nama, NIM, Email, Password) sebelum disimpan | ✅ Terimplementasi | **PASSED** |
| 83 | Tombol Delete Account di Kiri & Save di Kanan | Tata letak aksi form sesuai spesifikasi | ✅ Terimplementasi | **PASSED** |
| 84 | Modal Konfirmasi Hapus Akun | Konfirmasi bahaya sebelum akun dihapus secara permanen | ✅ `deletes user account when confirmed and no active loans exist` | **PASSED** |
| 85 | Validasi proteksi hapus akun aktif | Menolak penghapusan akun jika user memiliki riwayat/peminjaman aktif | ✅ `rejects account deletion if user has active loan history` | **PASSED** |

---

## Ringkasan Hasil Pengujian

```
 ✓ src/__tests__/auth.test.js         (8 tests)   35ms    PASSED ✅
 ✓ src/__tests__/dashboard.test.js    (2 tests)   19ms    PASSED ✅
 ✓ src/__tests__/users.test.js        (4 tests)   27ms    PASSED ✅
 ✓ src/__tests__/kategori.test.js     (3 tests)   28ms    PASSED ✅
 ✓ src/__tests__/barang.test.js       (5 tests)   26ms    PASSED ✅
 ✓ src/__tests__/profil.test.js       (3 tests)   27ms    PASSED ✅
 ✓ src/__tests__/peminjaman.test.js   (7 tests)   36ms    PASSED ✅
─────────────────────────────────────────────────────────────────
 Test Files   7 passed (7)
 Tests       32 passed (32)
 Duration    3.84s
```

| Metrik | Nilai |
|--------|-------|
| **Total Fitur MVP** | 85 |
| **Total Test Suites** | 7 |
| **Total Unit Tests** | 32 |
| **Tests Passed** | 32 ✅ |
| **Tests Failed** | 0 |
| **Pass Rate** | **100%** |

