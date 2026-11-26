import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authRoute from '@/app/api/auth/login/route';
import * as registerRoute from '@/app/api/auth/register/route';

const prismaMock = vi.hoisted(() => ({
  users: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const makeRequest = (body) => ({
  json: vi.fn().mockResolvedValue(body),
});

const responseBody = (response) => response.json();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Auth Login API Suite (12 Tests)', () => {
  it('1. returns 400 when identifier is missing', async () => {
    const response = await authRoute.POST(makeRequest({ password: 'secretpassword' }));
    expect(response.status).toBe(400);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/wajib diisi/i);
  });

  it('2. returns 400 when password is missing', async () => {
    const response = await authRoute.POST(makeRequest({ identifier: 'dosen@himtika.or.id' }));
    expect(response.status).toBe(400);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/wajib diisi/i);
  });

  it('3. returns 400 when both identifier and password are empty strings', async () => {
    const response = await authRoute.POST(makeRequest({ identifier: '', password: '' }));
    expect(response.status).toBe(400);
  });

  it('4. returns 400 when request body is empty object', async () => {
    const response = await authRoute.POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it('5. returns 401 when user is not found by NIM', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    const response = await authRoute.POST(makeRequest({ identifier: '99999999', password: 'secret' }));
    expect(response.status).toBe(401);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/tidak ditemukan/i);
  });

  it('6. returns 401 when user is not found by Email', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    const response = await authRoute.POST(makeRequest({ identifier: 'nonexistent@himtika.or.id', password: 'secret' }));
    expect(response.status).toBe(401);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/tidak ditemukan/i);
  });

  it('7. returns 401 when password does not match', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 1,
      Nim: 'DSN001',
      Nama: 'Dosen Pembina',
      Email: 'dosen@himtika.or.id',
      Password: 'correctPassword#123',
      Role: 'Admin',
    });
    const response = await authRoute.POST(makeRequest({ identifier: 'DSN001', password: 'wrongPassword#123' }));
    expect(response.status).toBe(401);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/password/i);
  });

  it('8. returns 200 and user info on valid credentials with NIM', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 1,
      Nim: 'DSN001',
      Nama: 'Dosen Pembina',
      Email: 'dosen@himtika.or.id',
      Password: 'D0s3n#H1mt1k@',
      Role: 'Admin',
    });
    const response = await authRoute.POST(makeRequest({ identifier: 'DSN001', password: 'D0s3n#H1mt1k@' }));
    expect(response.status).toBe(200);
    const body = await responseBody(response);
    expect(body.user).toEqual({
      IdUser: 1,
      Nim: 'DSN001',
      Nama: 'Dosen Pembina',
      Email: 'dosen@himtika.or.id',
      Role: 'Admin',
    });
  });

  it('9. returns 200 and user info on valid credentials with Email', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 2,
      Nim: '2410101001',
      Nama: 'Ahmad Rizal',
      Email: 'ahmad.rizal@himtika.or.id',
      Password: 'P@ssw0rd2024!',
      Role: 'Anggota',
    });
    const response = await authRoute.POST(makeRequest({ identifier: 'ahmad.rizal@himtika.or.id', password: 'P@ssw0rd2024!' }));
    expect(response.status).toBe(200);
    const body = await responseBody(response);
    expect(body.user.Role).toBe('Anggota');
  });

  it('10. trims whitespace from identifier before searching', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 1,
      Nim: 'DSN001',
      Nama: 'Dosen Pembina',
      Email: 'dosen@himtika.or.id',
      Password: 'pass',
      Role: 'Admin',
    });
    await authRoute.POST(makeRequest({ identifier: '  DSN001   ', password: 'pass' }));
    expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { Email: 'DSN001' },
          { Nim: 'DSN001' },
        ],
      },
    });
  });

  it('11. logs in successfully for Anggota role user', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 5,
      Nim: '2510101001',
      Nama: 'Fajar Ramadhan',
      Email: 'fajar@himtika.or.id',
      Password: 'pass',
      Role: 'Anggota',
    });
    const response = await authRoute.POST(makeRequest({ identifier: '2510101001', password: 'pass' }));
    expect(response.status).toBe(200);
    const body = await responseBody(response);
    expect(body.user.Nim).toBe('2510101001');
  });

  it('12. returns 500 when database throws an unexpected error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    prismaMock.users.findFirst.mockRejectedValue(new Error('DB Connection Timeout'));
    const response = await authRoute.POST(makeRequest({ identifier: 'DSN001', password: 'pass' }));
    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe('Auth Register API Suite (13 Tests)', () => {
  it('13. returns 400 when Nim is missing', async () => {
    const response = await registerRoute.POST(makeRequest({
      Nama: 'Budi',
      Email: 'budi@himtika.or.id',
      Password: 'password123',
    }));
    expect(response.status).toBe(400);
  });

  it('14. returns 400 when Nama is missing', async () => {
    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Email: 'budi@himtika.or.id',
      Password: 'password123',
    }));
    expect(response.status).toBe(400);
  });

  it('15. returns 400 when Email is missing', async () => {
    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Nama: 'Budi',
      Password: 'password123',
    }));
    expect(response.status).toBe(400);
  });

  it('16. returns 400 when Password is missing', async () => {
    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Nama: 'Budi',
      Email: 'budi@himtika.or.id',
    }));
    expect(response.status).toBe(400);
  });

  it('17. returns 400 when email format is invalid (no @ symbol)', async () => {
    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Nama: 'Calon Anggota',
      Email: 'calonhimtika.or.id',
      Password: 'password123',
    }));
    expect(response.status).toBe(400);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/format email tidak valid/i);
  });

  it('18. returns 400 when email is plain text with no domain', async () => {
    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Nama: 'Calon Anggota',
      Email: 'invalidemail',
      Password: 'password123',
    }));
    expect(response.status).toBe(400);
  });

  it('19. returns 409 when NIM already exists in database', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 2,
      Nim: '210045',
      Email: 'other@himtika.or.id',
    });
    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Nama: 'Calon Anggota',
      Email: 'calon@himtika.or.id',
      Password: 'password123',
    }));
    expect(response.status).toBe(409);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/nim 210045 sudah terdaftar/i);
  });

  it('20. returns 409 when Email already exists in database', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 2,
      Nim: '999999',
      Email: 'calon@himtika.or.id',
    });
    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Nama: 'Calon Anggota',
      Email: 'calon@himtika.or.id',
      Password: 'password123',
    }));
    expect(response.status).toBe(409);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/email calon@himtika.or.id sudah digunakan/i);
  });

  it('21. creates user with auto-incremented IdUser and default Anggota role', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.create.mockResolvedValue({
      IdUser: 45,
      Nim: '210045',
      Nama: 'Budi Pratama',
      Email: 'budi@himtika.or.id',
      Role: 'Anggota',
      CreatedAt: new Date(),
    });

    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Nama: 'Budi Pratama',
      Email: 'budi@himtika.or.id',
      Password: 'Password#2024!',
    }));

    expect(response.status).toBe(201);
    expect(prismaMock.users.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        Nim: '210045',
        Nama: 'Budi Pratama',
        Email: 'budi@himtika.or.id',
        Role: 'Anggota',
      }),
    }));
  });

  it('22. trims whitespace from Nim, Nama, and Email on register', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.create.mockResolvedValue({
      IdUser: 46,
      Nim: '210046',
      Nama: 'Siti Aminah',
      Email: 'siti@himtika.or.id',
      Role: 'Anggota',
      CreatedAt: new Date(),
    });

    await registerRoute.POST(makeRequest({
      Nim: '  210046  ',
      Nama: '  Siti Aminah  ',
      Email: '  siti@himtika.or.id  ',
      Password: 'Password#2024!',
    }));

    expect(prismaMock.users.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        Nim: '210046',
        Nama: 'Siti Aminah',
        Email: 'siti@himtika.or.id',
      }),
    }));
  });

  it('23. converts registered Email to lowercase', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.create.mockResolvedValue({
      IdUser: 47,
      Nim: '210047',
      Nama: 'User Test',
      Email: 'test.case@himtika.or.id',
      Role: 'Anggota',
      CreatedAt: new Date(),
    });

    await registerRoute.POST(makeRequest({
      Nim: '210047',
      Nama: 'User Test',
      Email: 'TEST.CASE@HIMTIKA.OR.ID',
      Password: 'Password#2024!',
    }));

    expect(prismaMock.users.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        Email: 'test.case@himtika.or.id',
      }),
    }));
  });

  it('24. returns 409 on Prisma P2002 unique constraint failure', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    const p2002Error = new Error('Unique constraint failed');
    p2002Error.code = 'P2002';
    prismaMock.users.create.mockRejectedValue(p2002Error);

    const response = await registerRoute.POST(makeRequest({
      Nim: '210048',
      Nama: 'Crash Test',
      Email: 'crash@himtika.or.id',
      Password: 'Password#2024!',
    }));

    expect(response.status).toBe(409);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/sudah terdaftar/i);
  });

  it('25. returns 500 when database throws an unexpected error on registration', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    prismaMock.users.findFirst.mockRejectedValue(new Error('Database Connection Lost'));
    const response = await registerRoute.POST(makeRequest({
      Nim: '210049',
      Nama: 'Error Test',
      Email: 'error@himtika.or.id',
      Password: 'Password#2024!',
    }));

    expect(response.status).toBe(500);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/kesalahan pada server/i);
    consoleSpy.mockRestore();
  });
});
