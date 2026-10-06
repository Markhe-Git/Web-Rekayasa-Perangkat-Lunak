import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const kategori = searchParams.get('kategori') ?? '';
  const status = searchParams.get('status') ?? '';

  const barang = await prisma.barang.findMany({
    where: {
      ...(search ? { OR: [{ NamaBarang: { contains: search } }, { KodeInventaris: { contains: search } }] } : {}),
      ...(kategori ? { IdKategori: Number(kategori) } : {}),
      ...(status ? { Status: status } : {}),
    },
    include: {
      Kategori: true,
      DetailPeminjaman: {
        where: {
          Peminjaman: { StatusPeminjaman: 'Approved' },
        },
        include: {
          Peminjaman: {
            include: {
              User: { select: { Nama: true, Nim: true } },
            },
          },
        },
      },
    },
    orderBy: { IdBarang: 'asc' },
  });

  return Response.json(barang);
}

export async function POST(request) {
  const body = await request.json();
  const { IdKategori, KodeInventaris, NamaBarang, Kondisi, Status } = body;

  if (!IdKategori || !KodeInventaris?.trim() || !NamaBarang?.trim()) {
    return Response.json({ Error: 'Kategori, kode inventaris, dan nama barang wajib diisi.' }, { status: 400 });
  }

  const existing = await prisma.barang.findUnique({ where: { KodeInventaris } });
  if (existing) return Response.json({ Error: 'Kode inventaris sudah digunakan.' }, { status: 409 });

  const barang = await prisma.barang.create({
    data: { IdKategori: Number(IdKategori), KodeInventaris: KodeInventaris.trim(), NamaBarang: NamaBarang.trim(), Kondisi: Kondisi ?? 'Baik', Status: Status ?? 'Tersedia' },
    include: { Kategori: true },
  });

  return Response.json(barang, { status: 201 });
}
