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

describe('Auth Login API', () => {
  it('returns 400 when identifier or password is missing', async () => {
    const response = await authRoute.POST(makeRequest({ identifier: 'dosen@himtika.or.id' }));
    expect(response.status).toBe(400);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/wajib diisi/i);
  });

  it('returns 401 when user is not found', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    const response = await authRoute.POST(makeRequest({ identifier: 'unknown', password: 'secret' }));
    expect(response.status).toBe(401);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/tidak ditemukan/i);
  });

  it('returns 401 when password does not match', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 1,
      Nim: 'DSN001',
      Nama: 'Dosen Pembina',
      Email: 'dosen@himtika.or.id',
      Password: 'password123',
      Role: 'Admin',
    });
    const response = await authRoute.POST(makeRequest({ identifier: 'DSN001', password: 'wrongpassword' }));
    expect(response.status).toBe(401);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/password/i);
  });

  it('returns 200 and user info on valid credentials', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 1,
      Nim: 'DSN001',
      Nama: 'Dosen Pembina',
      Email: 'dosen@himtika.or.id',
      Password: 'password123',
      Role: 'Admin',
    });
    const response = await authRoute.POST(makeRequest({ identifier: 'DSN001', password: 'password123' }));
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
});

describe('Auth Register API', () => {
  it('returns 400 when required fields are missing', async () => {
    const response = await registerRoute.POST(makeRequest({ Nim: '210045' }));
    expect(response.status).toBe(400);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/wajib diisi/i);
  });

  it('returns 400 when email format is invalid', async () => {
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

  it('returns 409 when NIM or Email already exists', async () => {
    prismaMock.users.findFirst.mockResolvedValue({
      IdUser: 2,
      Nim: '210045',
      Email: 'existing@himtika.or.id',
    });
    const response = await registerRoute.POST(makeRequest({
      Nim: '210045',
      Nama: 'Calon Anggota',
      Email: 'calon@himtika.or.id',
      Password: 'password123',
    }));
    expect(response.status).toBe(409);
    const body = await responseBody(response);
    expect(body.Error).toMatch(/sudah terdaftar/i);
  });

  it('creates user with auto-incremented IdUser and default Anggota role', async () => {
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
      Password: 'password123',
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
});
