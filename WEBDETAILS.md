Rekayasa Perangkat Lunak
Nama Website: Pintika

TUJUAN WEBSITE: Sebagai alat pencatatan dan mengelola izin untuk peminjaman barang organisasi HIMTIKA

TECH STACK
1. Frontend: React.js
2. Styling: Tailwind CSS
3. Backend: Node.js
4. Database: MySQL
5. ORM: Prisma

-----------------------------------------------------------------------------------------------------------------------------|
RANCANGAN DATABASE WEBSITE PINTIKA (3NF)

1. TABEL: users
- id_user (Primary Key)
- nim
- nama
- email
- password
- role
- created_at

2. TABEL: kategori_barang
- id_kategori (Primary Key)
- nama_kategori

3. TABEL: barang
- id_barang (Primary Key)
- id_kategori (Foreign Key -> kategori_barang.id_kategori)
- kode_inventaris
- nama_barang
- kondisi
- status

4. TABEL: peminjaman
- id_peminjaman (Primary Key)
- id_user (Foreign Key -> users.id_user)
- id_admin_approval (Foreign Key -> users.id_user)
- tgl_pengajuan
- tgl_pinjam
- tgl_rencana_kembali
- tgl_realisasi_kembali
- tujuan_pinjam
- status_peminjaman
- catatan_admin

5. TABEL: detail_peminjaman
- id_detail (Primary Key)
- id_peminjaman (Foreign Key -> peminjaman.id_peminjaman)
- id_barang (Foreign Key -> barang.id_barang)
- catatan_kondisi_kembali

-----------------------------------------------------------------------------------------------------------------------------|
FUNGSI CRUD DAN PEMETAAN FITUR WEBSITE PINTIKA

1. ENTITAS: Users (Fitur Manajemen Akun & Autentikasi)
- Create: Registrasi akun baru (Anggota & Admin).
- Read: Menampilkan profil pengguna dan daftar seluruh anggota untuk Admin.
- Update: Mengubah data profil (nama, email, password).
- Delete: Menghapus akun pengguna yang sudah tidak aktif (Khusus Admin).

2. ENTITAS: Kategori Barang (Fitur Kelola Kategori Inventaris)
- Create: Menambah kategori barang baru (Khusus Admin).
- Read: Menampilkan daftar kategori pada filter pencarian & form input barang.
- Update: Mengubah nama kategori barang (Khusus Admin).
- Delete: Menghapus kategori barang yang tidak digunakan lagi (Khusus Admin).

3. ENTITAS: Barang (Fitur Katalog & Inventaris Ruangan)
- Create: Menambah data unit barang inventaris baru (Khusus Admin).
- Read: Menampilkan katalog barang, status ketersediaan, dan detail peminjam saat ini.
- Update: Mengubah status barang (tersedia/dipinjam/maintenance) dan kondisi barang (Khusus Admin).
- Delete: Menghapus data barang yang rusak total atau hilang (Khusus Admin).

4. ENTITAS: Peminjaman & Detail Peminjaman (Fitur Transaksi & Verifikasi)
- Create: Anggota mengajukan peminjaman barang (isi form & pilih barang).
- Read: Menampilkan riwayat peminjaman Anggota dan daftar antrean persetujuan pada Dashboard Admin.
- Update: Admin mengubah status pengajuan (Approve/Reject) serta mengonfirmasi pengembalian barang.
- Delete: Anggota membatalkan pengajuan peminjaman yang masih berstatus pending.
