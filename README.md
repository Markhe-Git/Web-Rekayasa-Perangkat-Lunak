# Website-Rekayasa-Perangkat-Lunak
Membuat proyek website untuk mata kuliah Rekayasa Perangkat Lunak.

Nama Website: Pintika (Pinjam HIMTIKA)
1. Tema Website
- website yang menampung data peminjaman barang agar bisa terlacak.

2. Deskripsi Masalah
- Kondisi saat ini: Peminjaman barang masih dilakukan secara lisan tanpa adanya perekaman tertulis.
- Masalah utama: Seringkali barang-barang lupa atau lama dikembalikan, dan terkadang tidak diketahui siapa yang meminjamnya.
- Dampak negatif: Bila ada barang pinjaman hilang, maka akan sulit untuk melacak siapa yang bertanggung jawab.

3. Target Pengguna
- Pengguna utama: anggota HIMTIKA.
- Pengelola/Admin: Divisi Perlengkapan.

4. Manfaat website
- Bagi anggota HIMTIKA: Mampu booking barang yang ingin dipinjam sejak dini.
- Bagi pengelola: Mampu memantau riwayat peminjaman barang.
- Bagi organisasi: Adanya dokumentasi dan proses untuk meminjam barang.

5. Daftar fitur inti
- Autentikasi Pengguna: Login dan registrasi akun terpisah untuk Anggota dan Admin/Pengurus HIMTIKA.
- Katalog & Status Barang: Menampilkan daftar barang inventaris beserta status ketersediaannya (Tersedia / Dipinjam).
- Informasi Peminjam: Menampilkan nama peminjam dan tenggat waktu pengembalian pada barang yang sedang status Dipinjam.
- Form Pengajuan Peminjaman: Fitur pengajuan tanggal pinjam dan tanggal rencana pengembalian oleh anggota.
- Panel Verifikasi Admin: Fitur bagi pengurus untuk menyetujui (approve), menolak (reject), dan mengonfirmasi pengembalian barang.

6. Fitur yang tidak dikerjakan
- Sistem denda otomatis berupa pembayaran uang tunai/transfer.
- Pelacakan lokasi barang berbasis GPS atau IoT.

7. Kriteria website dinyatakan berhasil
- Pengujian fungsional: Semua operasi CRUD (Create Read Update Delete) dan approval bekerja dengan sempurna.
- Penyimpanan data: Semua data disimpan dalam database yang memenuhi normalisasi 3NF agar integritas data terjaga.
- Pengujian pengguna: User Interface mudah dan nyaman digunakan pengguna dan program bebas dari bug.
