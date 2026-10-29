import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { Nim, Nama, Email, Password } = body;

    if (!Nim || !Nama || !Email || !Password) {
      return Response.json(
        { Error: 'NIM, Nama, Email, dan Password wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedNim = String(Nim).trim();
    const trimmedNama = String(Nama).trim();
    const trimmedEmail = String(Email).trim().toLowerCase();

    // Validasi format email
    if (!trimmedEmail.includes('@')) {
      return Response.json(
        { Error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    // 1. CEK DUPLIKASI NIM dan Email
    const existingAccount = await prisma.users.findFirst({
      where: {
        OR: [
          { Nim: trimmedNim },
          { Email: trimmedEmail },
        ],
      },
    });

    if (existingAccount) {
      if (existingAccount.Nim === trimmedNim) {
        return Response.json(
          { Error: `NIM ${trimmedNim} sudah terdaftar dalam sistem.` },
          { status: 409 }
        );
      }
      return Response.json(
        { Error: `Email ${trimmedEmail} sudah digunakan akun lain.` },
        { status: 409 }
      );
    }

    // 2. Buat akun baru dengan IdUser auto increment dari database dan default role Anggota
    const createdUser = await prisma.users.create({
      data: {
        Nim: trimmedNim,
        Nama: trimmedNama,
        Email: trimmedEmail,
        Password: Password,
        Role: 'Anggota', // Default role = Anggota
        CreatedAt: new Date(),
      },
      select: {
        IdUser: true,
        Nim: true,
        Nama: true,
        Email: true,
        Role: true,
        CreatedAt: true,
      },
    });

    return Response.json(
      {
        message: 'Registrasi berhasil! Akun anggota Anda telah dibuat.',
        user: createdUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === 'P2002') {
      return Response.json(
        { Error: 'NIM atau Email sudah terdaftar dan tidak boleh duplikat.' },
        { status: 409 }
      );
    }
    console.error('Registration error:', error);
    return Response.json(
      { Error: 'Terjadi kesalahan pada server saat registrasi.' },
      { status: 500 }
    );
  }
}
