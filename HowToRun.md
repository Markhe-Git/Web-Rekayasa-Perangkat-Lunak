# 📘 Panduan Instalasi & Menjalankan Pintika (How To Run)

Dokumentasi lengkap ini memandu Anda dalam menyiapkan lingkungan pengembangan, mengonfigurasi database MySQL, menjalankan aplikasi secara lokal, hingga prosedur hosting/deployment ke server produksi.

---

## 📋 Daftar Isi
1. [Prasyarat Sistem (Prerequisites)](#1-prasyarat-sistem-prerequisites)
2. [Instalasi Dependensi](#2-instalasi-dependensi)
3. [Konfigurasi Database](#3-konfigurasi-database)
4. [Menjalankan Aplikasi di Lingkungan Lokal](#4-menjalankan-aplikasi-di-lingkungan-lokal)
5. [Menjalankan Pengujian Otomatis (Unit Testing)](#5-menjalankan-pengujian-otomatis-unit-testing)
6. [Daftar Akun Pengujian (Kredensial Default)](#6-daftar-akun-pengujian-kredensial-default)
7. [Panduan Build & Hosting Produksi](#7-panduan-build--hosting-produksi)
8. [Troubleshooting & Masalah Umum](#8-troubleshooting--masalah-umum)

---

## 1. Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan perangkat Anda telah terpasang perangkat lunak berikut:

* **Node.js**: Versi `>= 18.17.0` (direkomendasikan Node.js v20 LTS atau lebih baru).
* **Package Manager**: `npm` (bawaan Node.js) atau `yarn` / `pnpm`.
* **Database Server**: **MySQL** atau **MariaDB** (bisa menggunakan **XAMPP**, **Laragon**, Docker, atau MySQL Community Server lokal).
* **Git**: Untuk kloning repositori.

---

## 2. Instalasi Dependensi

1. **Buka Terminal / Command Prompt / PowerShell** di direktori proyek:
   ```bash
   cd Web-Rekayasa-Perangkat-Lunak
   ```

2. **Pasang seluruh paket pustaka (dependencies)**:
   ```bash
   npm install
   ```

---

## 3. Konfigurasi Database

### 3.1. Buat Database MySQL
Nyalakan service MySQL Anda (misalnya melalui Control Panel **XAMPP** dengan mengklik tombol **Start** pada modul MySQL).

Buka client MySQL (CLI, phpMyAdmin, DBeaver, atau TablePlus), lalu buat database baru bernama `pintika_db`:
```sql
CREATE DATABASE pintika_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3.2. Konfigurasi File Environment (`.env`)
Pastikan file `.env` di *root folder* proyek memiliki format string koneksi database yang sesuai:
```env
DATABASE_URL="mysql://<username>:<password>@localhost:3306/pintika_db"
```
> **Contoh standar XAMPP (default user `root` tanpa password):**
> ```env
> DATABASE_URL="mysql://root:@localhost:3306/pintika_db"
> ```

### 3.3. Sinkronisasi Skema Database & Data Awal (Pilih Salah Satu Metode)

#### **Metode A: Mengimpor File SQL Langsung (Direkomendasikan)**
File `dummydata.sql` telah disiapkan lengkap dengan struktur tabel dan data pengguna (Admin & Anggota):
* **Melalui Terminal (PowerShell):**
  ```powershell
  Get-Content dummydata.sql | mysql -u root pintika_db
  ```
* **Melalui Terminal (Bash / CMD):**
  ```bash
  mysql -u root -p pintika_db < dummydata.sql
  ```
* **Melalui phpMyAdmin:**
  1. Buka browser: `http://localhost/phpmyadmin`
  2. Pilih database `pintika_db`.
  3. Klik tab **Import** ➔ Pilih file `dummydata.sql` ➔ Klik **Go / Impor**.

#### **Metode B: Menggunakan Prisma CLI**
Jika ingin memanfaatkan sinkronisasi skema Prisma:
```bash
# Push skema ke database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Isi data seed bawaan Prisma
npm run db:seed
```

> 💡 **Tip:** Anda bisa melihat isi database melalui GUI interaktif Prisma dengan menjalankan:
> ```bash
> npm run db:studio
> ```
> Akses melalui browser di `http://localhost:5555`.

---

## 4. Menjalankan Aplikasi di Lingkungan Lokal

Setelah database terkonfigurasi, jalankan server pengembangan Next.js:

```bash
npm run dev
```

Buka browser dan akses aplikasi melalui:
```
http://localhost:3000
```

Aplikasi siap digunakan! Anda dapat langsung mencoba masuk dengan akun default atau membuat akun baru via form registrasi.

---

## 5. Menjalankan Pengujian Otomatis (Unit Testing)

Proyek ini telah dilengkapi dengan rangkaian unit test komprehensif menggunakan **Vitest** (menguji fungsionalitas auth, dashboard, inventaris, peminjaman, pengguna, dan profil).

Untuk menjalankan seluruh tes:
```bash
npm test
```

Untuk menjalankan tes dalam mode pantau (*watch mode*):
```bash
npx vitest --watch
```

---

## 6. Daftar Akun Pengujian (Kredensial Default)

Berdasarkan dataset `dummydata.sql`, Anda dapat menguji hak akses sistem menggunakan akun-akun berikut:

| Peran (Role) | Identitas (NIM) | Nama Akun | Password Default | Catatan Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `DSN001` | Dosen Pembina HIMTIKA | `D0s3n#H1mt1k@` | Akses penuh: Approve peminjaman, CRUD barang, CRUD kategori, ubah role pengguna. |
| **Anggota** (Mhs 24) | `2410101001` | Ahmad Rizal | `P@ssw0rd2024!` | Mengajukan pinjaman, melihat katalog barang, edit profil mandiri. |
| **Anggota** (Mhs 24) | `2410101002` | Siti Nurhaliza | `S!t1N3rh@l1z4` | Anggota aktif dengan riwayat peminjaman berjalan. |
| **Anggota** (Mhs 25) | `2510101001` | Fajar Ramadhan | `F@j@rR2025!` | Anggota baru angkatan 2025. |

---

## 7. Panduan Build & Hosting Produksi

### 7.1. Build Standar Node.js (Self-Hosted / VPS / Ubuntu Server)

1. **Jalankan proses optimasi build**:
   ```bash
   npm run build
   ```
2. **Jalankan server produksi**:
   ```bash
   npm run start
   ```
   Secara default aplikasi akan melayani request di port `3000`.

3. **Menggunakan Process Manager (PM2) di Server VPS**:
   Agar aplikasi tetap berjalan di latar belakang (*daemon*) dan otomatis hidup kembali jika server restart:
   ```bash
   # Install PM2 secara global
   npm install -g pm2

   # Jalankan aplikasi dengan nama "pintika-web"
   pm2 start npm --name "pintika-web" -- start

   # Simpan konfigurasi PM2
   pm2 save
   pm2 startup
   ```

4. **Konfigurasi Reverse Proxy Nginx (Opsional untuk VPS)**:
   Arahkan domain ke port lokal `3000`:
   ```nginx
   server {
       listen 80;
       server_name inventaris.himtika.or.id;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 7.2. Deployment ke Platform Cloud (Vercel / Railway / Render)

1. **Vercel (Frontend & Serverless API)**:
   * Hubungkan repositori GitHub ke dashboard [Vercel](https://vercel.com).
   * Pada tab **Environment Variables**, tambahkan variabel `DATABASE_URL` yang mengarah ke database cloud publik (misalnya dari **PlanetScale**, **Aiven**, atau **Supabase/Neon**).
   * Vercel akan otomatis mengeksekusi `prisma generate && next build`.

2. **Railway / Render (Database & App Bundle)**:
   * Buat service MySQL database di Railway/Render.
   * Sambungkan repositori, masukkan `DATABASE_URL` dari database yang baru dibuat.
   * Konfigurasi start command: `npx prisma db push && npm run start`.

---

## 8. Troubleshooting & Masalah Umum

### ❌ `Can't reach database server at localhost:3306`
* **Solusi**: Pastikan service MySQL sedang menyala di XAMPP / Laragon / Docker.
* Periksa apakah port MySQL Anda adalah `3306` atau port kustom seperti `3307`. Sesuaikan string di file `.env`.

### ❌ `Database pintika_db does not exist`
* **Solusi**: Buat database terlebih dahulu via SQL query `CREATE DATABASE pintika_db;` sebelum menjalankan perintah migrasi atau aplikasi.

### ❌ `PrismaClientInitializationError: Query engine library not found`
* **Solusi**: Jalankan perintah `npx prisma generate` untuk meregenerasi pustaka Prisma Client sesuai arsitektur sistem operasi Anda.

### ❌ Port 3000 sudah digunakan (`Port 3000 is in use`)
* **Solusi**: Next.js akan otomatis mencoba port alternatif (seperti port 3001), atau Anda dapat menentukan port secara manual:
  ```bash
  npx next dev -p 3005
  ```

---

<p align="center">
  Dibuat dengan ❤️ untuk <strong>Himpunan Mahasiswa Teknik Informatika (HIMTIKA)</strong>
</p>
