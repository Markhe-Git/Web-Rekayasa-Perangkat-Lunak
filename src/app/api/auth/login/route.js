import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return Response.json(
        { Error: 'NIM / Email dan Password wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { Email: trimmedIdentifier },
          { Nim: trimmedIdentifier },
        ],
      },
    });

    if (!user) {
      return Response.json(
        { Error: 'Akun dengan NIM atau Email tersebut tidak ditemukan.' },
        { status: 401 }
      );
    }

    if (user.Password !== password) {
      return Response.json(
        { Error: 'Password yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    return Response.json({
      message: 'Login berhasil',
      user: {
        IdUser: user.IdUser,
        Nim: user.Nim,
        Nama: user.Nama,
        Email: user.Email,
        Role: user.Role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { Error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
