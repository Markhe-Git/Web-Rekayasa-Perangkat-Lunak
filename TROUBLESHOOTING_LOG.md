# 🛠️ Dokumentasi Troubleshooting & Log (Log & Error Handling)
**Sistem Informasi:** Pintika (Sistem Peminjaman & Inventaris HIMTIKA)  
**Terakhir Diperbarui:** November 2026  

---

## 📋 Daftar Isi
1. [Bukti Log Eksekusi Unit Test Sukses (Vitest)](#1-bukti-log-eksekusi-unit-test-sukses-vitest)
2. [Daftar Potensi Error Umum & Solusi Perbaikannya](#2-daftar-potensi-error-umum--solusi-perbaikannya)
   - [Error 1: Koneksi Database Gagal (Can't reach database server)](#error-1-koneksi-database-gagal-cant-reach-database-server)
   - [Error 2: Prisma Client Query Engine Tidak Ditemukan](#error-2-prisma-client-query-engine-tidak-ditemukan)
   - [Error 3: Prisma Mock Belum Di-hoist pada Unit Test](#error-3-prisma-mock-belum-di-hoist-pada-unit-test)
   - [Error 4: Pelanggaran Kunci Unik (NIM / Email / Kode Inventaris Duplikat)](#error-4-pelanggaran-kunci-unik-nim--email--kode-inventaris-duplikat)
   - [Error 5: Port 3000 Sedang Digunakan (Port Collision)](#error-5-port-3000-sedang-digunakan-port-collision)
   - [Error 6: Penghapusan Data Terikat Relasi (Foreign Key Restrict)](#error-6-penghapusan-data-terikat-relasi-foreign-key-restrict)

---

## 1. Bukti Log Eksekusi Unit Test Sukses (Vitest)

Pengujian otomatis backend API dieksekusi secara terisolasi menggunakan **Vitest v5.0.4** tanpa membocorkan kredensial atau string koneksi sensitif:

```text
 RUN  v5.0.4 C:/Users/markh/Documents/Rekayasa Perangkat Lunak/Web-Rekayasa-Perangkat-Lunak

 ✓ src/__tests__/profil.test.js       (3 tests)   24ms
 ✓ src/__tests__/users.test.js        (4 tests)   27ms
 ✓ src/__tests__/kategori.test.js     (3 tests)   25ms
 ✓ src/__tests__/dashboard.test.js    (2 tests)   28ms
 ✓ src/__tests__/barang.test.js       (5 tests)   34ms
 ✓ src/__tests__/auth.test.js         (8 tests)   35ms
 ✓ src/__tests__/peminjaman.test.js   (7 tests)   39ms

 Test Files  7 passed (7)
      Tests  32 passed (32)
   Duration  12.09s (environment 60%, setup 37%, worker 1%, transform 1%)
```

---

## 2. Daftar Potensi Error Umum & Solusi Perbaikannya

### Error 1: Koneksi Database Gagal (Can't reach database server)
* **Gejala / Log:**
  ```text
  PrismaClientInitializationError: Can't reach database server at `localhost:3306`
  Please make sure your database server is running at `localhost:3306`.
  ```
* **Penyebab:**
  1. Service MySQL (XAMPP / Laragon / Docker) belum dijalankan.
  2. MySQL berjalan pada port alternatif (misalnya `3307` atau `3308`).
* **Solusi Perbaikan:**
  1. Jalankan MySQL dari kontrol panel XAMPP dengan mengklik **Start**.
  2. Periksa port aktif MySQL. Jika menggunakan port `3307`, perbarui nilai di `.env`:
     ```env
     DATABASE_URL="mysql://root:@localhost:3307/pintika_db"
     ```

---

### Error 2: Prisma Client Query Engine Tidak Ditemukan
* **Gejala / Log:**
  ```text
  PrismaClientInitializationError: Query engine library not found or could not be loaded.
  ```
* **Penyebab:**
  Folder `node_modules/@prisma/client` belum terkompilasi ulang untuk arsitektur OS perangkat setelah perubahan skema atau instalasi dependensi.
* **Solusi Perbaikan:**
  Jalankan perintah generate Prisma Client:
  ```bash
  npx prisma generate
  ```

---

### Error 3: Prisma Mock Belum Di-hoist pada Unit Test
* **Gejala / Log:**
  ```text
  TypeError: Cannot read properties of undefined (reading 'findFirst')
  ```
* **Penyebab:**
  Mocking `@/lib/prisma` dideklarasikan setelah import modul rute API, atau fungsi objek mock belum terdaftar di `vi.hoisted`.
* **Solusi Perbaikan:**
  Gunakan `vi.hoisted` di bagian atas berkas pengujian:
  ```javascript
  import { vi } from 'vitest';

  const prismaMock = vi.hoisted(() => ({
    users: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  }));

  vi.mock('@/lib/prisma', () => ({ default: prismaMock }));
  ```

---

### Error 4: Pelanggaran Kunci Unik (NIM / Email / Kode Inventaris Duplikat)
* **Gejala / Log:**
  ```text
  PrismaClientKnownRequestError: Unique constraint failed on the constraint: `users_nim_key`
  Status HTTP: 409 Conflict
  ```
* **Penyebab:**
  Mencoba mendaftarkan akun baru dengan NIM atau Email yang sudah ada di database, atau menambah barang dengan Kode Inventaris yang sama.
* **Solusi Perbaikan:**
  * Pastikan input menggunakan identifier yang belum terdaftar.
  * Backend telah dilengkapi penanganan kode `P2002` untuk mengembalikan respons `409 Conflict` dengan pesan yang ramah pengguna.

---

### Error 5: Port 3000 Sedang Digunakan (Port Collision)
* **Gejala / Log:**
  ```text
  warn  - Port 3000 is in use, trying 3001 instead.
  ```
* **Penyebab:**
  Ada instance server Node.js / Next.js lain yang masih aktif berjalan di background.
* **Solusi Perbaikan:**
  * Jalankan dev server pada port kustom:
    ```bash
    npx next dev -p 3005
    ```
  * Atau matikan proses di port 3000 via PowerShell:
    ```powershell
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
    ```

---

### Error 6: Penghapusan Data Terikat Relasi (Foreign Key Restrict)
* **Gejala / Log:**
  ```text
  Status HTTP: 400 Bad Request
  Error: "Tidak dapat menghapus pengguna/barang karena memiliki data peminjaman aktif."
  ```
* **Penyebab:**
  Mencoba menghapus user atau barang yang memiliki referensi aktif pada tabel `peminjaman`.
* **Solusi Perbaikan:**
  * Batalkan atau selesaikan pengembalian pinjaman terkait terlebih dahulu.
  * Untuk barang yang rusak/tidak dipakai lagi, ubah statusnya menjadi `Maintenance` daripada menghapus baris datanya dari database.

