import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [totalUsers, totalBarang, totalKategori, peminjamanStats, barangStats] = await Promise.all([
      prisma.users.count(),
      prisma.barang.count(),
      prisma.kategoriBarang.count(),
      prisma.peminjaman.groupBy({ by: ['StatusPeminjaman'], _count: { StatusPeminjaman: true } }),
      prisma.barang.groupBy({ by: ['Status'], _count: { Status: true } }),
    ]);

    const peminjamanMap = Object.fromEntries(
      peminjamanStats.map((s) => [s.StatusPeminjaman, s._count.StatusPeminjaman])
    );
    const barangMap = Object.fromEntries(
      barangStats.map((s) => [s.Status, s._count.Status])
    );

    const recentPeminjaman = await prisma.peminjaman.findMany({
      take: 5,
      orderBy: { TglPengajuan: 'desc' },
      include: { User: { select: { Nama: true, Nim: true } } },
    });

    return Response.json({
      Stats: {
        TotalUsers: totalUsers,
        TotalBarang: totalBarang,
        TotalKategori: totalKategori,
        PeminjamanPending: peminjamanMap['Pending'] ?? 0,
        PeminjamanApproved: peminjamanMap['Approved'] ?? 0,
        PeminjamanCompleted: peminjamanMap['Completed'] ?? 0,
        PeminjamanRejected: peminjamanMap['Rejected'] ?? 0,
        BarangTersedia: barangMap['Tersedia'] ?? 0,
        BarangDipinjam: barangMap['Dipinjam'] ?? 0,
        BarangMaintenance: barangMap['Maintenance'] ?? 0,
      },
      RecentPeminjaman: recentPeminjaman,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return Response.json(
      {
        Error: error.message || 'Gagal memuat data dashboard.',
        Stats: {
          TotalUsers: 0,
          TotalBarang: 0,
          TotalKategori: 0,
          PeminjamanPending: 0,
          PeminjamanApproved: 0,
          PeminjamanCompleted: 0,
          PeminjamanRejected: 0,
          BarangTersedia: 0,
          BarangDipinjam: 0,
          BarangMaintenance: 0,
        },
        RecentPeminjaman: [],
      },
      { status: 500 }
    );
  }
}
