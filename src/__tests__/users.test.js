import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as usersCollection from '@/app/api/users/route';
import * as userItem from '@/app/api/users/[id]/route';

const prismaMock = vi.hoisted(() => ({
  users: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
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

const responseBody = (response) => response.json();
const itemParams = (id = '7') => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Users API database operations', () => {
  it('lists users with search and creates a user', async () => {
    prismaMock.users.findMany.mockResolvedValue([{ IdUser: 1 }]);
    const list = await usersCollection.GET(makeRequest('http://localhost/api/users?search=andi'));
    expect(await responseBody(list)).toEqual([{ IdUser: 1 }]);
    expect(prismaMock.users.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { OR: [{ Nama: { contains: 'andi' } }, { Nim: { contains: 'andi' } }, { Email: { contains: 'andi' } }] },
    }));

    const invalid = await usersCollection.POST(makeRequest('http://localhost/api/users', { Nim: '1' }));
    expect(invalid.status).toBe(400);

    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.create.mockResolvedValue({ IdUser: 2, Role: 'Anggota' });
    const create = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'secret',
    }));
    expect(create.status).toBe(201);
    expect(prismaMock.users.create).toHaveBeenCalledWith({
      data: { Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'secret', Role: 'Anggota' },
    });
  });

  it('rejects duplicate users and retrieves/updates a user without replacing an omitted password', async () => {
    prismaMock.users.findFirst.mockResolvedValue({ IdUser: 1 });
    const duplicate = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'secret',
    }));
    expect(duplicate.status).toBe(409);

    prismaMock.users.findUnique.mockResolvedValue({ IdUser: 7, Nama: 'Andi' });
    const get = await userItem.GET(makeRequest('http://localhost/api/users/7'), itemParams());
    expect(get.status).toBe(200);
    expect(prismaMock.users.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { IdUser: 7 } }));

    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 7, Nama: 'Andi Baru' });
    const update = await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi Baru', Email: 'andi@example.com', Role: 'Admin',
    }), itemParams());
    expect(update.status).toBe(200);
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { IdUser: 7 },
      data: { Nim: '123', Nama: 'Andi Baru', Email: 'andi@example.com', Role: 'Admin' },
    });
  });

  it('blocks deleting a user with loan data and deletes an unused user', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue({ IdPeminjaman: 1 });
    expect((await userItem.DELETE(makeRequest('http://localhost/api/users/7'), itemParams())).status).toBe(400);
    expect(prismaMock.users.delete).not.toHaveBeenCalled();

    prismaMock.peminjaman.findFirst.mockResolvedValue(null);
    prismaMock.users.delete.mockResolvedValue({});
    const response = await userItem.DELETE(makeRequest('http://localhost/api/users/7'), itemParams());
    expect(response.status).toBe(200);
    expect(prismaMock.users.delete).toHaveBeenCalledWith({ where: { IdUser: 7 } });
  });

  it('returns not found for a missing user', async () => {
    prismaMock.users.findUnique.mockResolvedValue(null);

    const response = await userItem.GET(makeRequest('http://localhost/api/users/7'), itemParams());

    expect(response.status).toBe(404);
  });
});
