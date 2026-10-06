USE `pintika_db`;

-- Bersihkan data lama jika ada (menjaga integritas FK)
DELETE FROM `commits`;
DELETE FROM `repositories`;
DELETE FROM `detail_peminjaman`;
DELETE FROM `peminjaman`;
DELETE FROM `barang`;
DELETE FROM `kategori_barang`;
DELETE FROM `users`;

-- 1. DATA TABEL: users (1 Admin/Dosen, 5 Mahasiswa/Anggota)
INSERT INTO `users` (`id_user`, `nim`, `nama`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'DSN001', 'Dosen Pembina HIMTIKA', 'dosen@himtika.or.id', 'password123', 'Admin', NOW()),
(2, '210001', 'Ahmad Rizal', 'ahmad.rizal@himtika.or.id', 'password123', 'Anggota', NOW()),
(3, '210002', 'Siti Nurhaliza', 'siti.nurhaliza@himtika.or.id', 'password123', 'Anggota', NOW()),
(4, '210003', 'Budi Santoso', 'budi.santoso@himtika.or.id', 'password123', 'Anggota', NOW()),
(5, '210004', 'Dewi Anggraini', 'dewi.anggraini@himtika.or.id', 'password123', 'Anggota', NOW()),
(6, '210005', 'Eko Prasetyo', 'eko.prasetyo@himtika.or.id', 'password123', 'Anggota', NOW());

-- 2. DATA TABEL: kategori_barang
INSERT INTO `kategori_barang` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Elektronik & Multimedia'),
(2, 'Perlengkapan Ruangan'),
(3, 'Kabel & Adaptor'),
(4, 'Sound System');

-- 3. DATA TABEL: barang
INSERT INTO `barang` (`id_barang`, `id_kategori`, `kode_inventaris`, `nama_barang`, `kondisi`, `status`) VALUES
(1, 1, 'INV-PRJ-001', 'Proyektor Epson EB-X400', 'Baik', 'Dipinjam'),
(2, 1, 'INV-PRJ-002', 'Proyektor BenQ MX550', 'Baik', 'Tersedia'),
(3, 4, 'INV-MIC-001', 'Microphone Wireless Shure', 'Baik', 'Dipinjam'),
(4, 4, 'INV-SPK-001', 'Speaker Portable Baretone 15 Inch', 'RusakRingan', 'Maintenance'),
(5, 3, 'INV-KBL-001', 'Kabel HDMI 15 Meter', 'Baik', 'Dipinjam'),
(6, 2, 'INV-PBD-001', 'Whiteboard Portable 120x90', 'Baik', 'Tersedia'),
(7, 2, 'INV-CRS-001', 'Kursi Lipat Chitose (Set 10 Unit)', 'Baik', 'Tersedia');

-- 4. DATA TABEL: peminjaman
INSERT INTO `peminjaman` (`id_peminjaman`, `id_user`, `id_admin_approval`, `tgl_pengajuan`, `tgl_pinjam`, `tgl_rencana_kembali`, `tgl_realisasi_kembali`, `tujuan_pinjam`, `status_peminjaman`, `catatan_admin`) VALUES
(1, 2, 1, '2026-09-20 08:00:00', '2026-09-21 09:00:00', '2026-09-21 17:00:00', '2026-09-21 16:30:00', 'Workshop Pemrograman Web HIMTIKA', 'Completed', 'Disetujui. Barang dikembalikan tepat waktu dan kondisi baik.'),
(2, 3, 1, '2026-09-28 10:00:00', '2026-09-29 08:00:00', '2026-10-02 17:00:00', NULL, 'Kegiatan Makrab Anggota Baru HIMTIKA', 'Approved', 'Disetujui. Harap menjaga kondisi unit speaker dan proyektor.'),
(3, 4, NULL, '2026-09-30 09:15:00', '2026-10-01 10:00:00', '2026-10-01 15:00:00', NULL, 'Rapat Koordinasi Divisi Riset', 'Pending', NULL),
(4, 5, 1, '2026-09-25 14:00:00', '2026-09-26 08:00:00', '2026-09-26 12:00:00', NULL, 'Acara Internal Kampus', 'Rejected', 'Ditolak karena unit proyektor sudah dibooking untuk acara lain.');

-- 5. DATA TABEL: detail_peminjaman
INSERT INTO `detail_peminjaman` (`id_detail`, `id_peminjaman`, `id_barang`, `catatan_kondisi_kembali`) VALUES
(1, 1, 2, 'Dikembalikan lengkap dengan tas dan remote.'),
(2, 1, 5, 'Kabel berfungsi normal.'),
(3, 2, 1, NULL),
(4, 2, 3, NULL),
(5, 3, 6, NULL),
(6, 4, 1, NULL);

-- 6. DATA TABEL: repositories
INSERT INTO `repositories` (`repository_id`, `name`, `url`, `last_synced_at`) VALUES
(101, 'himtika/pintika-web', 'https://github.com/himtika/pintika-web', NOW());

-- 7. DATA TABEL: commits
INSERT INTO `commits` (`repository_id`, `sha`, `message`, `author`, `committed_at`) VALUES
(101, 'a1b2c3d4e5f678901234567890abcdef12345678', 'Initial commit project structure', 'Dosen Pembina HIMTIKA', '2026-09-15 10:00:00'),
(101, 'b2c3d4e5f678901234567890abcdef123456789a', 'Add Database Schema and Prisma Migration', 'Ahmad Rizal', '2026-09-18 14:30:00'),
(101, 'c3d4e5f678901234567890abcdef123456789a0b', 'Add Dummy Data SQL Script', 'Siti Nurhaliza', '2026-09-30 16:00:00');