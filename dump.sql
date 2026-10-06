-- -------------------------------------------------------------
-- SKEMA DATABASE WEBSITE PINTIKA (3NF)
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `pintika_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pintika_db`;

-- Drop tabel jika sudah ada (urut sesuai dependensi FK)
DROP TABLE IF EXISTS `commits`;
DROP TABLE IF EXISTS `repositories`;
DROP TABLE IF EXISTS `detail_peminjaman`;
DROP TABLE IF EXISTS `peminjaman`;
DROP TABLE IF EXISTS `barang`;
DROP TABLE IF EXISTS `kategori_barang`;
DROP TABLE IF EXISTS `users`;

-- 1. TABEL: users
CREATE TABLE `users` (
  `id_user` INT AUTO_INCREMENT PRIMARY KEY,
  `nim` VARCHAR(50) NOT NULL UNIQUE,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('Admin', 'Anggota') NOT NULL DEFAULT 'Anggota',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL: kategori_barang
CREATE TABLE `kategori_barang` (
  `id_kategori` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_kategori` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL: barang
CREATE TABLE `barang` (
  `id_barang` INT AUTO_INCREMENT PRIMARY KEY,
  `id_kategori` INT NOT NULL,
  `kode_inventaris` VARCHAR(50) NOT NULL UNIQUE,
  `nama_barang` VARCHAR(100) NOT NULL,
  `kondisi` ENUM('Baik', 'RusakRingan', 'RusakBerat') NOT NULL DEFAULT 'Baik',
  `status` ENUM('Tersedia', 'Dipinjam', 'Maintenance') NOT NULL DEFAULT 'Tersedia',
  CONSTRAINT `fk_barang_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori_barang` (`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL: peminjaman
CREATE TABLE `peminjaman` (
  `id_peminjaman` INT AUTO_INCREMENT PRIMARY KEY,
  `id_user` INT NOT NULL,
  `id_admin_approval` INT NULL,
  `tgl_pengajuan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `tgl_pinjam` DATETIME(3) NOT NULL,
  `tgl_rencana_kembali` DATETIME(3) NOT NULL,
  `tgl_realisasi_kembali` DATETIME(3) NULL,
  `tujuan_pinjam` TEXT NOT NULL,
  `status_peminjaman` ENUM('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `catatan_admin` TEXT NULL,
  CONSTRAINT `fk_peminjaman_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_peminjaman_admin` FOREIGN KEY (`id_admin_approval`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL: detail_peminjaman
CREATE TABLE `detail_peminjaman` (
  `id_detail` INT AUTO_INCREMENT PRIMARY KEY,
  `id_peminjaman` INT NOT NULL,
  `id_barang` INT NOT NULL,
  `catatan_kondisi_kembali` TEXT NULL,
  CONSTRAINT `fk_detail_peminjaman` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detail_barang` FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL: repositories
CREATE TABLE `repositories` (
  `repository_id` INT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `last_synced_at` DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL: commits
CREATE TABLE `commits` (
  `repository_id` INT NOT NULL,
  `sha` VARCHAR(40) NOT NULL,
  `message` TEXT NOT NULL,
  `author` VARCHAR(100) NOT NULL,
  `committed_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`repository_id`, `sha`),
  CONSTRAINT `fk_commits_repository` FOREIGN KEY (`repository_id`) REFERENCES `repositories` (`repository_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- DATA INITIAL / SEEDING DATA
-- -------------------------------------------------------------

-- Data Pengguna (1 Dosen Admin & 3 Mahasiswa Anggota)
INSERT INTO `users` (`id_user`, `nim`, `nama`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'DSN001', 'Dosen Pembina HIMTIKA', 'dosen@himtika.or.id', 'password123', 'Admin', NOW()),
(2, '210001', 'Mahasiswa Satu', 'mahasiswa1@himtika.or.id', 'password123', 'Anggota', NOW()),
(3, '210002', 'Mahasiswa Dua', 'mahasiswa2@himtika.or.id', 'password123', 'Anggota', NOW()),
(4, '210003', 'Mahasiswa Tiga', 'mahasiswa3@himtika.or.id', 'password123', 'Anggota', NOW());

-- Data Kategori Barang
INSERT INTO `kategori_barang` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Elektronik & Multimedia'),
(2, 'Perlengkapan Ruangan');

-- Data Barang Inventaris
INSERT INTO `barang` (`id_barang`, `id_kategori`, `kode_inventaris`, `nama_barang`, `kondisi`, `status`) VALUES
(1, 1, 'INV-PRJ-001', 'Proyektor Epson EB-X400', 'Baik', 'Tersedia'),
(2, 1, 'INV-MIC-001', 'Microphone Wireless Shure', 'Baik', 'Tersedia');

-- Data Repository GitHub
INSERT INTO `repositories` (`repository_id`, `name`, `url`, `last_synced_at`) VALUES
(101, 'himtika/pintika-web', 'https://github.com/himtika/pintika-web', NOW());

-- Data Commit Repository
INSERT INTO `commits` (`repository_id`, `sha`, `message`, `author`, `committed_at`) VALUES
(101, 'a1b2c3d4e5f678901234567890abcdef12345678', 'Initial commit project structure', 'Dosen Pembina HIMTIKA', NOW()),
(101, 'b2c3d4e5f678901234567890abcdef123456789a', 'Add Database Schema and MySQL Import File', 'Mahasiswa Satu', NOW());