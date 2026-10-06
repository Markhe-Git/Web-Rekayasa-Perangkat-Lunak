import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = await params;

  const user = await prisma.users.findUnique({
    where: { IdUser: Number(id) },
    select: { IdUser: true, Nim: true, Nama: true, Email: true, Role: true, CreatedAt: true },
  });

  if (!user) return Response.json({ Error: 'User tidak ditemukan.' }, { status: 404 });
  return Response.json(user);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { Nim, Nama, Email, Password, Role } = body;

  const existing = await prisma.users.findFirst({
    where: { OR: [{ Nim }, { Email }], NOT: { IdUser: Number(id) } },
  });
  if (existing) return Response.json({ Error: 'NIM atau Email sudah digunakan.' }, { status: 409 });

  const updateData = { Nim, Nama, Email, Role };
  if (Password) updateData.Password = Password;

  const user = await prisma.users.update({ where: { IdUser: Number(id) }, data: updateData });
  return Response.json(user);
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  const hasPeminjaman = await prisma.peminjaman.findFirst({
    where: { OR: [{ IdUser: Number(id) }, { IdAdminApproval: Number(id) }] },
  });
  if (hasPeminjaman) return Response.json({ Error: 'User memiliki data peminjaman, tidak dapat dihapus.' }, { status: 400 });

  await prisma.users.delete({ where: { IdUser: Number(id) } });
  return Response.json({ Message: 'User berhasil dihapus.' });
}
