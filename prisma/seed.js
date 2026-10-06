const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.commits.deleteMany();
  await prisma.repositories.deleteMany();
  await prisma.detailPeminjaman.deleteMany();
  await prisma.peminjaman.deleteMany();
  await prisma.barang.deleteMany();
  await prisma.kategoriBarang.deleteMany();
  await prisma.users.deleteMany();

  const admin = await prisma.users.create({
    data: {
      Nim: 'DSN001',
      Nama: 'Dosen Pembina HIMTIKA',
      Email: 'dosen@himtika.or.id',
      Password: 'password123',
      Role: 'Admin',
    },
  });

  const anggota1 = await prisma.users.create({ data: { Nim: '210001', Nama: 'Ahmad Rizal', Email: 'ahmad.rizal@himtika.or.id', Password: 'password123', Role: 'Anggota' } });
  const anggota2 = await prisma.users.create({ data: { Nim: '210002', Nama: 'Siti Nurhaliza', Email: 'siti.nurhaliza@himtika.or.id', Password: 'password123', Role: 'Anggota' } });
  const anggota3 = await prisma.users.create({ data: { Nim: '210003', Nama: 'Budi Santoso', Email: 'budi.santoso@himtika.or.id', Password: 'password123', Role: 'Anggota' } });
  const anggota4 = await prisma.users.create({ data: { Nim: '210004', Nama: 'Dewi Anggraini', Email: 'dewi.anggraini@himtika.or.id', Password: 'password123', Role: 'Anggota' } });
  const anggota5 = await prisma.users.create({ data: { Nim: '210005', Nama: 'Eko Prasetyo', Email: 'eko.prasetyo@himtika.or.id', Password: 'password123', Role: 'Anggota' } });

  const kat1 = await prisma.kategoriBarang.create({ data: { NamaKategori: 'Elektronik & Multimedia' } });
  const kat2 = await prisma.kategoriBarang.create({ data: { NamaKategori: 'Perlengkapan Ruangan' } });
  const kat3 = await prisma.kategoriBarang.create({ data: { NamaKategori: 'Kabel & Adaptor' } });
  const kat4 = await prisma.kategoriBarang.create({ data: { NamaKategori: 'Sound System' } });

  const prj1 = await prisma.barang.create({ data: { IdKategori: kat1.IdKategori, KodeInventaris: 'INV-PRJ-001', NamaBarang: 'Proyektor Epson EB-X400', Kondisi: 'Baik', Status: 'Dipinjam' } });
  const prj2 = await prisma.barang.create({ data: { IdKategori: kat1.IdKategori, KodeInventaris: 'INV-PRJ-002', NamaBarang: 'Proyektor BenQ MX550', Kondisi: 'Baik', Status: 'Tersedia' } });
  const mic1 = await prisma.barang.create({ data: { IdKategori: kat4.IdKategori, KodeInventaris: 'INV-MIC-001', NamaBarang: 'Microphone Wireless Shure', Kondisi: 'Baik', Status: 'Dipinjam' } });
  await prisma.barang.create({ data: { IdKategori: kat4.IdKategori, KodeInventaris: 'INV-SPK-001', NamaBarang: 'Speaker Portable Baretone 15 Inch', Kondisi: 'RusakRingan', Status: 'Maintenance' } });
  const kbl1 = await prisma.barang.create({ data: { IdKategori: kat3.IdKategori, KodeInventaris: 'INV-KBL-001', NamaBarang: 'Kabel HDMI 15 Meter', Kondisi: 'Baik', Status: 'Dipinjam' } });
  const wb1 = await prisma.barang.create({ data: { IdKategori: kat2.IdKategori, KodeInventaris: 'INV-PBD-001', NamaBarang: 'Whiteboard Portable 120x90', Kondisi: 'Baik', Status: 'Tersedia' } });
  await prisma.barang.create({ data: { IdKategori: kat2.IdKategori, KodeInventaris: 'INV-CRS-001', NamaBarang: 'Kursi Lipat Chitose (Set 10 Unit)', Kondisi: 'Baik', Status: 'Tersedia' } });

  const p1 = await prisma.peminjaman.create({
    data: {
      IdUser: anggota1.IdUser, IdAdminApproval: admin.IdUser,
      TglPengajuan: new Date('2026-09-20T08:00:00'),
      TglPinjam: new Date('2026-09-21T09:00:00'),
      TglRencanaKembali: new Date('2026-09-21T17:00:00'),
      TglRealisasiKembali: new Date('2026-09-21T16:30:00'),
      TujuanPinjam: 'Workshop Pemrograman Web HIMTIKA',
      StatusPeminjaman: 'Completed',
      CatatanAdmin: 'Disetujui. Barang dikembalikan tepat waktu dan kondisi baik.',
    },
  });

  const p2 = await prisma.peminjaman.create({
    data: {
      IdUser: anggota2.IdUser, IdAdminApproval: admin.IdUser,
      TglPengajuan: new Date('2026-09-28T10:00:00'),
      TglPinjam: new Date('2026-09-29T08:00:00'),
      TglRencanaKembali: new Date('2026-10-02T17:00:00'),
      TujuanPinjam: 'Kegiatan Makrab Anggota Baru HIMTIKA',
      StatusPeminjaman: 'Approved',
      CatatanAdmin: 'Disetujui. Harap menjaga kondisi unit speaker dan proyektor.',
    },
  });

  const p3 = await prisma.peminjaman.create({
    data: {
      IdUser: anggota3.IdUser,
      TglPengajuan: new Date('2026-09-30T09:15:00'),
      TglPinjam: new Date('2026-10-01T10:00:00'),
      TglRencanaKembali: new Date('2026-10-01T15:00:00'),
      TujuanPinjam: 'Rapat Koordinasi Divisi Riset',
      StatusPeminjaman: 'Pending',
    },
  });

  await prisma.peminjaman.create({
    data: {
      IdUser: anggota4.IdUser, IdAdminApproval: admin.IdUser,
      TglPengajuan: new Date('2026-09-25T14:00:00'),
      TglPinjam: new Date('2026-09-26T08:00:00'),
      TglRencanaKembali: new Date('2026-09-26T12:00:00'),
      TujuanPinjam: 'Acara Internal Kampus',
      StatusPeminjaman: 'Rejected',
      CatatanAdmin: 'Ditolak karena unit proyektor sudah dibooking untuk acara lain.',
    },
  });

  await prisma.detailPeminjaman.createMany({
    data: [
      { IdPeminjaman: p1.IdPeminjaman, IdBarang: prj2.IdBarang, CatatanKondisiKembali: 'Dikembalikan lengkap dengan tas dan remote.' },
      { IdPeminjaman: p1.IdPeminjaman, IdBarang: kbl1.IdBarang, CatatanKondisiKembali: 'Kabel berfungsi normal.' },
      { IdPeminjaman: p2.IdPeminjaman, IdBarang: prj1.IdBarang },
      { IdPeminjaman: p2.IdPeminjaman, IdBarang: mic1.IdBarang },
      { IdPeminjaman: p3.IdPeminjaman, IdBarang: wb1.IdBarang },
    ],
  });

  await prisma.repositories.create({
    data: {
      RepositoryId: 101,
      Name: 'himtika/pintika-web',
      Url: 'https://github.com/himtika/pintika-web',
      LastSyncedAt: new Date(),
    },
  });

  const existingCommits = await prisma.commits.findMany({ where: { RepositoryId: 101 } });
  const existingShas = new Set(existingCommits.map(c => c.Sha));

  const newCommits = [
    { RepositoryId: 101, Sha: 'a1b2c3d4e5f678901234567890abcdef12345678', Message: 'Initial commit project structure', Author: 'Dosen Pembina HIMTIKA', CommittedAt: new Date('2026-09-15T10:00:00') },
    { RepositoryId: 101, Sha: 'b2c3d4e5f678901234567890abcdef123456789a', Message: 'Add Database Schema and Prisma Migration', Author: 'Ahmad Rizal', CommittedAt: new Date('2026-09-18T14:30:00') },
    { RepositoryId: 101, Sha: 'c3d4e5f678901234567890abcdef123456789a0b', Message: 'Add Dummy Data SQL Script', Author: 'Siti Nurhaliza', CommittedAt: new Date('2026-09-30T16:00:00') },
  ].filter(c => !existingShas.has(c.Sha));

  if (newCommits.length > 0) {
    await prisma.commits.createMany({ data: newCommits });
  }

  await prisma.repositories.update({ where: { RepositoryId: 101 }, data: { LastSyncedAt: new Date() } });

  console.log('✅ Seed berhasil dijalankan.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
