# 🛡️ Laporan Keamanan & Perubahan (Security & Changelog)
**Sistem Informasi:** Pintika (Sistem Peminjaman & Inventaris HIMTIKA)  
**Terakhir Diperbarui:** November 2026  

---

## 📋 Daftar Isi
1. [Proteksi Keamanan Sistem](#1-proteksi-keamanan-sistem)
   - [Validasi Kompleksitas Password Kuat](#11-validasi-kompleksitas-password-kuat)
   - [Pemisahan Role Admin & Anggota (RBAC)](#12-pemisahan-role-admin--anggota-rbac)
   - [Keamanan Kredensial & Lingkungan (.env)](#13-keamanan-kredensial--lingkungan-env)
   - [Proteksi Integritas Data & Foreign Key Cascade](#14-proteksi-integritas-data--foreign-key-cascade)
2. [Catatan Pembaruan Kode Terbaru (Changelog)](#2-catatan-pembaruan-kode-terbaru-changelog)
   - [Sanitasi NIM & Input Identifier](#21-sanitasi-nim--input-identifier)
   - [Setup Mocking Vitest & Testing Isolation](#22-setup-mocking-vitest--testing-isolation)
   - [Pembaruan Dataset Dummy & Seeder](#23-pembaruan-dataset-dummy--seeder)
   - [Transaksi Atomik Approval Peminjaman](#24-transaksi-atomik-approval-peminjaman)

---

## 1. Proteksi Keamanan Sistem

### 1.1. Validasi Kompleksitas Password Kuat
Sistem menerapkan standar keamanan kata sandi untuk mencegah eksploitasi kata sandi lemah (*dictionary attacks* dan *brute-force*):
* **Aturan Kebijakan:**
  * Panjang minimal: **8 karakter**.
  * Wajib memuat minimal satu huruf besar / kapital (`[A-Z]`).
  * Wajib memuat minimal satu angka (`[0-9]`).
  * Wajib memuat minimal satu karakter spesial / simbol (`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).
* **Format Regex:**
  ```regex
  ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$
  ```
* **Kredensial Default Terstandarisasi:**
  Seluruh akun default pengujian pada `dummydata.sql` telah memenuhi standar kata sandi kuat ini:
  * Admin: `D0s3n#H1mt1k@`
  * Anggota 1: `P@ssw0rd2024!`
  * Anggota 2: `S!t1N3rh@l1z4`
  * Anggota 3: `F@j@rR2025!`

---

### 1.2. Pemisahan Role Admin & Anggota (RBAC)
Sistem menggunakan *Role-Based Access Control* (RBAC) untuk membatasi wewenang operasional pengguna secara ketat:

| Fitur / Modul | Role Admin | Role Anggota | Mekanisme Pengamanan |
| :--- | :---: | :---: | :--- |
| **Dashboard** | Akses Penuh | Akses Terbatas | Admin melihat rekap seluruh aset & transaksi; Anggota hanya melihat riwayat pinjaman pribadi. |
| **Katalog Inventaris** | Full CRUD | Read-Only | Komponen UI terpisah (`Barang.js` untuk Admin vs `BarangMember.js` untuk Anggota). Anggota tidak memiliki form tambah/edit/hapus. |
| **Kategori Barang** | Full CRUD | Tidak Ada Akses | Menu disembunyikan dari sidebar navigasi Anggota dan dibatasi di backend. |
| **Manajemen Users** | Full CRUD | Tidak Ada Akses | Menu kelola user eksklusif untuk Admin. |
| **Verifikasi Peminjaman** | Approve / Reject / Complete | Mengajukan & Batal (Draft) | Hanya Admin yang berhak menyetujui atau menolak pinjaman. Anggota hanya dapat membatalkan pinjamannya sendiri yang masih berstatus `Pending`. |
| **Manajemen Profil** | Edit Mandiri | Edit Mandiri & Proteksi Hapus | Anggota yang memiliki riwayat pinjaman aktif diblokir dari aksi penghapusan akun mandiri. |

---

### 1.3. Keamanan Kredensial & Lingkungan (`.env`)
* **Pengecualian Version Control:** File `.env` diproteksi agar tidak terunggah ke repositori Git publik melalui entri `.env*` pada file `.gitignore`.
* **Pemisahan String Koneksi:** Parameter sensitif seperti user, password, dan port database dipisahkan ke dalam variable `DATABASE_URL`.
* **Singleton Instance:** Instance database Prisma dibungkus dalam modul singleton (`src/lib/prisma.js`) untuk mencegah duplikasi koneksi (*connection exhaustion*).

---

### 1.4. Proteksi Integritas Data & Foreign Key Cascade
* **Pencegahan Data Yatim (*Orphaned Data*):** Relasi tabel `Peminjaman` ke `DetailPeminjaman` menggunakan opsi `onDelete: Cascade`, memastikan jika peminjaman draft dihapus, rincian barang pinjaman ikut terhapus secara bersih.
* **Blokir Penghapusan Data Terikat:**
  * User yang memiliki transaksi peminjaman dilarang dihapus (mengembalikan error `400`).
  * Kategori yang masih menampung barang inventaris dilarang dihapus.
  * Barang yang statusnya sedang `Dipinjam` tidak dapat dihapus sebelum status pengembalian diselesaikan.

---

## 2. Catatan Pembaruan Kode Terbaru (Changelog)

### 2.1. Sanitasi NIM & Input Identifier
* **Normalisasi Whitespace:** Menambahkan fungsi `.trim()` pada input identifier (NIM atau Email) pada endpoint `/api/auth/login`, `/api/auth/register`, `/api/users`, dan `/api/barang`.
* **Case-Insensitive Email:** Email dinormalisasi menjadi huruf kecil (`toLowerCase()`) sebelum proses pencarian dan penyimpanan untuk mencegah duplikasi akibat perbedaan kapitalisasi.

### 2.2. Setup Mocking Vitest & Testing Isolation
* **Testing Tanpa Akses Database Fisik:** Mengonfigurasi mocking `@/lib/prisma` menggunakan `vi.hoisted` dan `vi.mock()` di seluruh file pengujian unit.
* **Cakupan 100% Pass:**
  * `src/__tests__/auth.test.js` (8 tests)
  * `src/__tests__/dashboard.test.js` (2 tests)
  * `src/__tests__/users.test.js` (4 tests)
  * `src/__tests__/kategori.test.js` (3 tests)
  * `src/__tests__/barang.test.js` (5 tests)
  * `src/__tests__/peminjaman.test.js` (7 tests)
  * `src/__tests__/profil.test.js` (3 tests)
  * Total: **32 unit tests lulus (100% PASSED)** tanpa memerlukan database MySQL hidup.

### 2.3. Pembaruan Dataset Dummy & Seeder
* **Dataset Terverifikasi:** Memperbarui `dummydata.sql` dan `prisma/seed.js` agar menggunakan data dummy mahasiswa HIMTIKA yang realistis, kode inventaris teratur (`INV-ELK-001`, `INV-MUS-001`, dsb.), dan kata sandi yang memenuhi kriteria password kuat.

### 2.4. Transaksi Atomik Approval Peminjaman
* **Transisi Status Konsisten:** Saat Admin menyetujui peminjaman, status peminjaman diubah menjadi `Approved` dan status barang terkait otomatis beralih menjadi `Dipinjam` secara bersamaan, mencegah ketidaksinkronan data ketersediaan barang.

