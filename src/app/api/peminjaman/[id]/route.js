import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = await params;

  const peminjaman = await prisma.peminjaman.findUnique({
    where: { IdPeminjaman: Number(id) },
    include: {
      User: { select: { Nama: true, Nim: true, Email: true } },
      Admin: { select: { Nama: true } },
      DetailPeminjaman: { include: { Barang: { include: { Kategori: true } } } },
    },
  });

  if (!peminjaman) return Response.json({ Error: 'Peminjaman tidak ditemukan.' }, { status: 404 });
  return Response.json(peminjaman);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { Action, IdAdminApproval, CatatanAdmin, CatatanKondisiKembali } = body;

  const current = await prisma.peminjaman.findUnique({
    where: { IdPeminjaman: Number(id) },
    include: { DetailPeminjaman: true },
  });
  if (!current) return Response.json({ Error: 'Peminjaman tidak ditemukan.' }, { status: 404 });

  if (Action === 'Approve') {
    if (current.StatusPeminjaman !== 'Pending') return Response.json({ Error: 'Hanya peminjaman Pending yang bisa disetujui.' }, { status: 400 });

    await prisma.$transaction([
      prisma.peminjaman.update({
        where: { IdPeminjaman: Number(id) },
        data: { StatusPeminjaman: 'Approved', IdAdminApproval: Number(IdAdminApproval), CatatanAdmin },
      }),
      ...current.DetailPeminjaman.map(d =>
        prisma.barang.update({ where: { IdBarang: d.IdBarang }, data: { Status: 'Dipinjam' } })
      ),
    ]);
  } else if (Action === 'Reject') {
    if (current.StatusPeminjaman !== 'Pending') return Response.json({ Error: 'Hanya peminjaman Pending yang bisa ditolak.' }, { status: 400 });

    await prisma.peminjaman.update({
      where: { IdPeminjaman: Number(id) },
      data: { StatusPeminjaman: 'Rejected', IdAdminApproval: Number(IdAdminApproval), CatatanAdmin },
    });
  } else if (Action === 'Complete') {
    if (current.StatusPeminjaman !== 'Approved') return Response.json({ Error: 'Hanya peminjaman Approved yang bisa diselesaikan.' }, { status: 400 });

    const detailUpdates = CatatanKondisiKembali
      ? Object.entries(CatatanKondisiKembali).map(([idDetail, catatan]) =>
          prisma.detailPeminjaman.update({ where: { IdDetail: Number(idDetail) }, data: { CatatanKondisiKembali: catatan } })
        )
      : [];

    await prisma.$transaction([
      prisma.peminjaman.update({
        where: { IdPeminjaman: Number(id) },
        data: { StatusPeminjaman: 'Completed', TglRealisasiKembali: new Date() },
      }),
      ...current.DetailPeminjaman.map(d =>
        prisma.barang.update({ where: { IdBarang: d.IdBarang }, data: { Status: 'Tersedia' } })
      ),
      ...detailUpdates,
    ]);
  } else if (Action === 'Cancel') {
    if (current.StatusPeminjaman !== 'Pending') return Response.json({ Error: 'Hanya peminjaman Pending yang bisa dibatalkan.' }, { status: 400 });
    await prisma.peminjaman.update({ where: { IdPeminjaman: Number(id) }, data: { StatusPeminjaman: 'Cancelled' } });
  } else {
    return Response.json({ Error: 'Action tidak valid.' }, { status: 400 });
  }

  const updated = await prisma.peminjaman.findUnique({
    where: { IdPeminjaman: Number(id) },
    include: { User: { select: { Nama: true, Nim: true } }, Admin: { select: { Nama: true } }, DetailPeminjaman: { include: { Barang: true } } },
  });
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  const peminjaman = await prisma.peminjaman.findUnique({ where: { IdPeminjaman: Number(id) } });
  if (!peminjaman) return Response.json({ Error: 'Peminjaman tidak ditemukan.' }, { status: 404 });
  if (peminjaman.StatusPeminjaman !== 'Pending') return Response.json({ Error: 'Hanya peminjaman Pending yang bisa dibatalkan/dihapus.' }, { status: 400 });

  await prisma.peminjaman.delete({ where: { IdPeminjaman: Number(id) } });
  return Response.json({ Message: 'Peminjaman berhasil dihapus.' });
}
