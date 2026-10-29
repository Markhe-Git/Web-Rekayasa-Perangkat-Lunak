import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as userItem from '@/app/api/users/[id]/route';

const prismaMock = vi.hoisted(() => ({
  users: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  peminjaman: {
    findFirst: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const makeRequest = (url, body) => ({
  url,
  json: vi.fn().mockResolvedValue(body),
});

const itemParams = (id = '10') => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Profil User API Operations', () => {
  it('updates profile attributes (NIM, Nama, Email) with a new Password', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({
      IdUser: 10,
      Nim: '220005',
      Nama: 'Budi Santoso',
      Email: 'budi@example.com',
      Role: 'Anggota',
    });

    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005',
        Nama: 'Budi Santoso',
        Email: 'budi@example.com',
        Password: 'newpassword123',
        Role: 'Anggota',
      }),
      itemParams('10')
    );

    expect(res.status).toBe(200);
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { IdUser: 10 },
      data: {
        Nim: '220005',
        Nama: 'Budi Santoso',
        Email: 'budi@example.com',
        Password: 'newpassword123',
        Role: 'Anggota',
      },
    });
  });

  it('deletes user account when confirmed and no active loans exist', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue(null);
    prismaMock.users.delete.mockResolvedValue({ IdUser: 10 });

    const res = await userItem.DELETE(
      makeRequest('http://localhost/api/users/10'),
      itemParams('10')
    );

    expect(res.status).toBe(200);
    expect(prismaMock.users.delete).toHaveBeenCalledWith({ where: { IdUser: 10 } });
  });

  it('rejects account deletion if user has active loan history', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue({ IdPeminjaman: 5 });

    const res = await userItem.DELETE(
      makeRequest('http://localhost/api/users/10'),
      itemParams('10')
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.Error).toContain('memiliki data peminjaman');
    expect(prismaMock.users.delete).not.toHaveBeenCalled();
  });
});
