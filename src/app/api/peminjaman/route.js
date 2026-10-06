import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? '';
  const userId = searchParams.get('userId') ?? '';

  const peminjaman = await prisma.peminjaman.findMany({
    where: {
      ...(status ? { StatusPeminjaman: status } : {}),
      ...(userId ? { IdUser: Number(userId) } : {}),
    },
    include: {
      User: { select: { Nama: true, Nim: true, Email: true } },
      Admin: { select: { Nama: true } },
      DetailPeminjaman: { include: { Barang: { include: { Kategori: true } } } },
    },
    orderBy: { TglPengajuan: 'desc' },
  });

  return Response.json(peminjaman);
}

export async function POST(request) {
  const body = await request.json();
  const { IdUser, TglPinjam, TglRencanaKembali, TujuanPinjam, Items } = body;

  if (!IdUser || !TglPinjam || !TglRencanaKembali || !TujuanPinjam || !Items?.length) {
    return Response.json({ Error: 'Semua field dan minimal 1 barang wajib diisi.' }, { status: 400 });
  }

  const unavailable = await prisma.barang.findMany({
    where: { IdBarang: { in: Items.map(Number) }, Status: { not: 'Tersedia' } },
  });
  if (unavailable.length > 0) {
    const names = unavailable.map(b => b.NamaBarang).join(', ');
    return Response.json({ Error: `Barang tidak tersedia: ${names}` }, { status: 409 });
  }

  const peminjaman = await prisma.peminjaman.create({
    data: {
      IdUser: Number(IdUser),
      TglPinjam: new Date(TglPinjam),
      TglRencanaKembali: new Date(TglRencanaKembali),
      TujuanPinjam,
      StatusPeminjaman: 'Pending',
      DetailPeminjaman: { createMany: { data: Items.map(id => ({ IdBarang: Number(id) })) } },
    },
    include: {
      User: { select: { Nama: true, Nim: true } },
      DetailPeminjaman: { include: { Barang: true } },
    },
  });

  return Response.json(peminjaman, { status: 201 });
}
