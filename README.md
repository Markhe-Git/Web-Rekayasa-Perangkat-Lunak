# 📌 Pintika (Sistem Peminjaman & Inventaris HIMTIKA)

Pintika adalah aplikasi web manajemen inventaris dan sirkulasi peminjaman barang untuk **Himpunan Mahasiswa Teknik Informatika (HIMTIKA)**. Sistem ini dirancang untuk mendigitalkan proses peminjaman inventaris yang sebelumnya dilakukan secara manual/lisan, memastikan akuntabilitas barang, pelacakan status ketersediaan secara real-time, serta verifikasi peminjaman berbasis peran (*Role-Based Access Control*).

---

## 🌟 Fitur Utama

- **🛡️ Autentikasi & Otorisasi RBAC**: Pemisahan hak akses antara **Admin** (Pengurus Perlengkapan HIMTIKA) dan **Anggota** (Mahasiswa).
- **📦 Katalog & Status Inventaris**: Pemantauan status barang (*Tersedia*, *Dipinjam*, *Maintenance*) dan kondisi fisik (*Baik*, *Rusak Ringan*, *Rusak Berat*).
- **📝 Sirkulasi Peminjaman Mandiri**: Anggota dapat mengajukan peminjaman secara terstruktur dengan jadwal tanggal pinjam & rencana pengembalian.
- **⚡ Approval Panel Admin**: Verifikasi persetujuan (*Approve*), penolakan (*Reject*), dan penyelesaian pengembalian barang (*Complete*) secara transaksional.
- **👤 Manajemen Profil & Pengguna**: Pembaharuan data profil mandiri dan administrasi data pengguna oleh Admin.
- **🧪 Unit Testing Komprehensif**: Pengujian unit otomatis menggunakan Vitest dengan 100% *pass rate* pada seluruh controller API.

---

## 🛠️ Tech Stack & Prasyarat Sistem

### Teknologi yang Digunakan
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Database & ORM**: MySQL / MariaDB dengan [Prisma ORM](https://www.prisma.io/)
- **Unit Testing**: [Vitest](https://vitest.dev/) & [@testing-library/react](https://testing-library.com/)
- **Styling**: Modern Responsive CSS3 (Custom Design System)

### Prasyarat Minimum
- **Node.js**: Versi `>= 18.17.0` (disarankan Node.js v20 LTS)
- **NPM**: Versi `>= 9.x` (atau Yarn / PNPM)
- **Database Server**: MySQL 5.7+ / MariaDB 10.3+ (melalui XAMPP, Laragon, Docker, atau MySQL Community Server)
- **Git CLI**

---

## 🚀 Panduan Instalasi Langkah-demi-Langkah (Dari Nol)

### 1. Kloning Repositori
Buka terminal / PowerShell dan clone repositori proyek:
```bash
git clone https://github.com/markh/Web-Rekayasa-Perangkat-Lunak.git
cd Web-Rekayasa-Perangkat-Lunak
```

### 2. Instalasi Dependensi Proyek
Pasang seluruh paket pustaka yang didefinisikan pada `package.json`:
```bash
npm install
```

### 3. Konfigurasi Environment Variable (`.env`)
Salin atau buat file `.env` di direktori utama (*root directory*) proyek:
```env
# Format Connection String Prisma MySQL:
# mysql://<username>:<password>@<host>:<port>/<nama_database>

DATABASE_URL="mysql://root:@localhost:3306/pintika_db"
```
> **Catatan:**
> - Jika menggunakan **XAMPP default**: user adalah `root` dan tanpa password (`root:@localhost:3306/pintika_db`).
> - Jika MySQL Anda memiliki password (misal `admin123`), ubah menjadi:
>   `DATABASE_URL="mysql://root:admin123@localhost:3306/pintika_db"`

### 4. Setup & Inisialisasi Database

#### Langkah 4.1: Buat Database di MySQL
Pastikan service MySQL Anda sudah berjalan (misal: klik **Start** pada MySQL di control panel XAMPP). Buat database baru bernama `pintika_db`:
```sql
CREATE DATABASE pintika_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Langkah 4.2: Impor Skema & Data Awal (Pilih Salah Satu Metode)

* **Opsi A (Paling Cepat - Impor File SQL):**
  Impor dataset siap pakai `dummydata.sql` yang sudah mencakup struktur tabel, data kategori, barang, akun Admin, dan Anggota:
  - **PowerShell (Windows):**
    ```powershell
    Get-Content dummydata.sql | mysql -u root pintika_db
    ```
  - **Command Prompt (CMD) / Bash:**
    ```bash
    mysql -u root pintika_db < dummydata.sql
    ```
  - **phpMyAdmin:**
    Buka `http://localhost/phpmyadmin` -> Pilih `pintika_db` -> Tab **Import** -> Pilih file `dummydata.sql` -> Klik **Go**.

* **Opsi B (Melalui Prisma CLI):**
  ```bash
  # Sinkronkan skema prisma ke database
  npx prisma db push

  # Generate Prisma Client library
  npx prisma generate

  # Jalankan seeder bawaan
  npm run db:seed
  ```

---

## 💻 Menjalankan Aplikasi di Lingkungan Lokal

### Mode Pengembangan (Development)
Jalankan dev server dengan fitur hot reload:
```bash
npm run dev
```
Buka browser favorit Anda dan akses:
```
http://localhost:3000
```

### Mode Produksi (Production Build & Run)
Untuk menguji performa optimal dan memastikan tidak ada error kompilasi:
```bash
# 1. Kompilasi dan optimasi bundle Next.js
npm run build

# 2. Jalankan server produksi
npm run start
```

---

## 🧪 Menjalankan Pengujian Otomatis (Unit Testing)

Proyek ini telah dilengkapi dengan unit test suite untuk menguji seluruh rute API backend (Auth, Users, Barang, Kategori, Peminjaman, Dashboard, Profil):

```bash
# Menjalankan seluruh pengujian sekali jalan
npx vitest run

# Menjalankan pengujian dalam mode interaktif/watch
npm test
```

---

## 🔑 Kredensial Akun Uji Coba (Demo Accounts)

Dataset awal telah dilengkapi dengan beberapa akun untuk pengujian fungsionalitas sistem:

| Role | NIM / Identifier | Nama Pengguna | Password Default | Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `DSN001` | Dosen Pembina HIMTIKA | `D0s3n#H1mt1k@` | **Akses Penuh:** Kelola barang, kategori, verifikasi peminjaman (approve/reject), rekap dashboard, dan kelola akun pengguna. |
| **Anggota** | `2410101001` | Ahmad Rizal | `P@ssw0rd2024!` | **Akses Terbatas:** Melihat katalog barang, mengajukan peminjaman barang, membatalkan pengajuan, dan mengedit profil. |
| **Anggota** | `2410101002` | Siti Nurhaliza | `S!t1N3rh@l1z4` | Akun anggota dengan riwayat peminjaman berjalan. |
| **Anggota** | `2510101001` | Fajar Ramadhan | `F@j@rR2025!` | Akun anggota angkatan baru. |

---

## 🌐 Panduan Deployment ke Server Produksi

### 1. Deployment ke Cloud Platform (Vercel)
1. Hubungkan repositori GitHub Anda ke dashboard [Vercel](https://vercel.com).
2. Di pengaturan proyek, buka bagian **Settings > Environment Variables**:
   - Tambahkan `DATABASE_URL` yang mengarah ke database cloud publik (misalnya PlanetScale, Aiven, Supabase, atau RDS).
3. Vercel akan secara otomatis menjalankan proses `npm run build` yang mencakup generate Prisma Client.

### 2. Deployment ke VPS (Ubuntu / Linux Server dengan PM2)
1. Clone repositori dan instal dependensi pada server VPS.
2. Siapkan file `.env` produksi dengan kredensial database server.
3. Jalankan migrasi dan build:
   ```bash
   npx prisma generate
   npm run build
   ```
4. Jalankan aplikasi menggunakan Process Manager (**PM2**) agar aplikasi tetap aktif di background:
   ```bash
   npm install -g pm2
   pm2 start npm --name "pintika-app" -- start
   pm2 save
   pm2 startup
   ```
5. Konfigurasikan **Nginx** sebagai reverse proxy ke port `3000` dengan sertifikat SSL (Let's Encrypt / Certbot).

---

## 📂 Struktur Direktori Proyek

```
Web-Rekayasa-Perangkat-Lunak/
├── prisma/
│   ├── schema.prisma         # Definisi skema database, relasi, & enum
│   └── seed.js               # Script seeder data awal
├── src/
│   ├── app/
│   │   ├── api/              # Route Handlers Next.js (REST API backend)
│   │   │   ├── auth/         # Login & Register handler
│   │   │   ├── barang/       # CRUD barang handler
│   │   │   ├── dashboard/    # Metrik & statistik handler
│   │   │   ├── kategori/     # CRUD kategori handler
│   │   │   ├── peminjaman/   # Sirkulasi & transaksi peminjaman
│   │   │   └── users/        # Manajemen akun pengguna
│   │   ├── globals.css       # Style global & tokens tema
│   │   ├── layout.js         # Root layout aplikasi
│   │   └── page.js           # Entry point utama antarmuka SPA
│   ├── components/           # Komponen UI (Login, Dashboard, Barang, dll.)
│   ├── lib/
│   │   └── prisma.js         # Singleton instance Prisma Client
│   └── __tests__/            # Suite pengujian unit Vitest
├── dummydata.sql             # SQL dump struktur dan data awal
├── package.json              # Dependensi dan skrip proyek
└── README.md                 # Dokumentasi utama proyek
```

---

<p align="center">
  Dikembangkan oleh Tim Pengembang <strong>Rekayasa Perangkat Lunak - HIMTIKA</strong>
</p>
