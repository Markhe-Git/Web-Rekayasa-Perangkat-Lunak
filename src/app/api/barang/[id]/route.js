import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = await params;

  const barang = await prisma.barang.findUnique({
    where: { IdBarang: Number(id) },
    include: { Kategori: true, DetailPeminjaman: { include: { Peminjaman: { include: { User: { select: { Nama: true, Nim: true } } } } } } },
  });

  if (!barang) return Response.json({ Error: 'Barang tidak ditemukan.' }, { status: 404 });
  return Response.json(barang);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { IdKategori, KodeInventaris, NamaBarang, Kondisi, Status } = body;

  const existing = await prisma.barang.findFirst({
    where: { KodeInventaris, NOT: { IdBarang: Number(id) } },
  });
  if (existing) return Response.json({ Error: 'Kode inventaris sudah digunakan.' }, { status: 409 });

  const barang = await prisma.barang.update({
    where: { IdBarang: Number(id) },
    data: {
      ...(IdKategori ? { IdKategori: Number(IdKategori) } : {}),
      ...(KodeInventaris ? { KodeInventaris } : {}),
      ...(NamaBarang ? { NamaBarang } : {}),
      ...(Kondisi ? { Kondisi } : {}),
      ...(Status ? { Status } : {}),
    },
    include: { Kategori: true },
  });

  return Response.json(barang);
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  const inUse = await prisma.detailPeminjaman.findFirst({
    where: { IdBarang: Number(id), Peminjaman: { StatusPeminjaman: { in: ['Pending', 'Approved'] } } },
  });
  if (inUse) return Response.json({ Error: 'Barang sedang dalam peminjaman aktif, tidak dapat dihapus.' }, { status: 400 });

  await prisma.barang.delete({ where: { IdBarang: Number(id) } });
  return Response.json({ Message: 'Barang berhasil dihapus.' });
}
