import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { NamaKategori } = body;
  if (!NamaKategori?.trim()) return Response.json({ Error: 'Nama kategori wajib diisi.' }, { status: 400 });

  const kategori = await prisma.kategoriBarang.update({
    where: { IdKategori: Number(id) },
    data: { NamaKategori: NamaKategori.trim() },
  });
  return Response.json(kategori);
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  const hasBarang = await prisma.barang.findFirst({ where: { IdKategori: Number(id) } });
  if (hasBarang) return Response.json({ Error: 'Kategori masih memiliki barang, tidak dapat dihapus.' }, { status: 400 });

  await prisma.kategoriBarang.delete({ where: { IdKategori: Number(id) } });
  return Response.json({ Message: 'Kategori berhasil dihapus.' });
}
