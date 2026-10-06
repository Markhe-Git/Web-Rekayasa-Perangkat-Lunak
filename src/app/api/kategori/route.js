import prisma from '@/lib/prisma';

export async function GET() {
  const kategori = await prisma.kategoriBarang.findMany({
    orderBy: { IdKategori: 'asc' },
    include: { _count: { select: { Barang: true } } },
  });
  return Response.json(kategori);
}

export async function POST(request) {
  const body = await request.json();
  const { NamaKategori } = body;
  if (!NamaKategori?.trim()) return Response.json({ Error: 'Nama kategori wajib diisi.' }, { status: 400 });

  const kategori = await prisma.kategoriBarang.create({ data: { NamaKategori: NamaKategori.trim() } });
  return Response.json(kategori, { status: 201 });
}
