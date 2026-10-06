import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';

  const users = await prisma.users.findMany({
    where: search ? {
      OR: [
        { Nama: { contains: search } },
        { Nim: { contains: search } },
        { Email: { contains: search } },
      ],
    } : undefined,
    orderBy: { CreatedAt: 'desc' },
    select: { IdUser: true, Nim: true, Nama: true, Email: true, Role: true, CreatedAt: true },
  });

  return Response.json(users);
}

export async function POST(request) {
  const body = await request.json();
  const { Nim, Nama, Email, Password, Role } = body;

  if (!Nim || !Nama || !Email || !Password) {
    return Response.json({ Error: 'Semua field wajib diisi.' }, { status: 400 });
  }

  const existing = await prisma.users.findFirst({ where: { OR: [{ Nim }, { Email }] } });
  if (existing) {
    return Response.json({ Error: 'NIM atau Email sudah terdaftar.' }, { status: 409 });
  }

  const user = await prisma.users.create({ data: { Nim, Nama, Email, Password, Role: Role ?? 'Anggota' } });
  return Response.json(user, { status: 201 });
}
