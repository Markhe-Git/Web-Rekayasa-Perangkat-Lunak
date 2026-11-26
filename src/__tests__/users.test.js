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

describe('Users API Management Suite (25 Tests)', () => {
  it('1. GET lists all users when search param is omitted', async () => {
    prismaMock.users.findMany.mockResolvedValue([{ IdUser: 1, Nama: 'User 1' }, { IdUser: 2, Nama: 'User 2' }]);
    const res = await usersCollection.GET(makeRequest('http://localhost/api/users'));
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.length).toBe(2);
    expect(prismaMock.users.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: undefined }));
  });

  it('2. GET filters users by Nama search query', async () => {
    prismaMock.users.findMany.mockResolvedValue([{ IdUser: 1, Nama: 'Rizal' }]);
    await usersCollection.GET(makeRequest('http://localhost/api/users?search=Rizal'));
    expect(prismaMock.users.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { OR: [{ Nama: { contains: 'Rizal' } }, { Nim: { contains: 'Rizal' } }, { Email: { contains: 'Rizal' } }] },
    }));
  });

  it('3. GET filters users by NIM search query', async () => {
    prismaMock.users.findMany.mockResolvedValue([{ IdUser: 2, Nim: '2410101001' }]);
    await usersCollection.GET(makeRequest('http://localhost/api/users?search=2410101001'));
    expect(prismaMock.users.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ OR: expect.any(Array) }),
    }));
  });

  it('4. GET filters users by Email search query', async () => {
    prismaMock.users.findMany.mockResolvedValue([{ IdUser: 3, Email: 'dosen@himtika.or.id' }]);
    await usersCollection.GET(makeRequest('http://localhost/api/users?search=dosen@himtika.or.id'));
    expect(prismaMock.users.findMany).toHaveBeenCalled();
  });

  it('5. GET orders users by CreatedAt desc', async () => {
    prismaMock.users.findMany.mockResolvedValue([]);
    await usersCollection.GET(makeRequest('http://localhost/api/users'));
    expect(prismaMock.users.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { CreatedAt: 'desc' },
    }));
  });

  it('6. POST returns 400 when Nim is missing', async () => {
    const res = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nama: 'Andi', Email: 'andi@example.com', Password: 'pass',
    }));
    expect(res.status).toBe(400);
  });

  it('7. POST returns 400 when Nama is missing', async () => {
    const res = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Email: 'andi@example.com', Password: 'pass',
    }));
    expect(res.status).toBe(400);
  });

  it('8. POST returns 400 when Email is missing', async () => {
    const res = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Password: 'pass',
    }));
    expect(res.status).toBe(400);
  });

  it('9. POST returns 400 when Password is missing', async () => {
    const res = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com',
    }));
    expect(res.status).toBe(400);
  });

  it('10. POST returns 409 when user with same Nim already exists', async () => {
    prismaMock.users.findFirst.mockResolvedValue({ IdUser: 1, Nim: '123' });
    const res = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'pass',
    }));
    expect(res.status).toBe(409);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/sudah terdaftar/i);
  });

  it('11. POST returns 409 when user with same Email already exists', async () => {
    prismaMock.users.findFirst.mockResolvedValue({ IdUser: 1, Email: 'andi@example.com' });
    const res = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'pass',
    }));
    expect(res.status).toBe(409);
  });

  it('12. POST creates new user with default Anggota role when Role is omitted', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.create.mockResolvedValue({ IdUser: 5, Role: 'Anggota' });
    const res = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'pass',
    }));
    expect(res.status).toBe(201);
    expect(prismaMock.users.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Role: 'Anggota' }),
    }));
  });

  it('13. POST creates user with specified Admin role', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.create.mockResolvedValue({ IdUser: 6, Role: 'Admin' });
    const res = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: 'DSN999', Nama: 'Dosen Baru', Email: 'dosen.baru@himtika.or.id', Password: 'pass', Role: 'Admin',
    }));
    expect(res.status).toBe(201);
    expect(prismaMock.users.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Role: 'Admin' }),
    }));
  });

  it('14. GET [id] returns 200 with user data when user exists', async () => {
    prismaMock.users.findUnique.mockResolvedValue({ IdUser: 7, Nama: 'Andi' });
    const res = await userItem.GET(makeRequest('http://localhost/api/users/7'), itemParams('7'));
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.Nama).toBe('Andi');
  });

  it('15. GET [id] returns 404 when user is not found', async () => {
    prismaMock.users.findUnique.mockResolvedValue(null);
    const res = await userItem.GET(makeRequest('http://localhost/api/users/999'), itemParams('999'));
    expect(res.status).toBe(404);
  });

  it('16. PUT [id] updates user Nama and Email', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 7, Nama: 'Andi Edit', Email: 'andi.edit@example.com' });
    const res = await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi Edit', Email: 'andi.edit@example.com', Role: 'Anggota',
    }), itemParams('7'));
    expect(res.status).toBe(200);
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { IdUser: 7 },
      data: { Nim: '123', Nama: 'Andi Edit', Email: 'andi.edit@example.com', Role: 'Anggota' },
    });
  });

  it('17. PUT [id] updates user Role to Admin', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 7, Role: 'Admin' });
    const res = await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Role: 'Admin',
    }), itemParams('7'));
    expect(res.status).toBe(200);
    expect(prismaMock.users.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Role: 'Admin' }),
    }));
  });

  it('18. PUT [id] returns 409 when new Nim is already used by another user', async () => {
    prismaMock.users.findFirst.mockResolvedValue({ IdUser: 99, Nim: '123' });
    const res = await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Role: 'Anggota',
    }), itemParams('7'));
    expect(res.status).toBe(409);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/sudah digunakan/i);
  });

  it('19. PUT [id] returns 409 when new Email is already used by another user', async () => {
    prismaMock.users.findFirst.mockResolvedValue({ IdUser: 88, Email: 'existing@example.com' });
    const res = await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi', Email: 'existing@example.com', Role: 'Anggota',
    }), itemParams('7'));
    expect(res.status).toBe(409);
  });

  it('20. PUT [id] updates user without replacing omitted password', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 7 });
    await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Role: 'Anggota',
    }), itemParams('7'));
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { IdUser: 7 },
      data: { Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Role: 'Anggota' },
    });
  });

  it('21. PUT [id] updates user with new password when OldPassword matches', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.findUnique.mockResolvedValue({ Password: 'oldPassword123' });
    prismaMock.users.update.mockResolvedValue({ IdUser: 7 });
    const res = await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Role: 'Anggota',
      Password: 'newPassword123!', OldPassword: 'oldPassword123',
    }), itemParams('7'));
    expect(res.status).toBe(200);
    expect(prismaMock.users.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Password: 'newPassword123!' }),
    }));
  });

  it('22. PUT [id] returns 400 when OldPassword does not match current password', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.findUnique.mockResolvedValue({ Password: 'oldPassword123' });
    const res = await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Role: 'Anggota',
      Password: 'newPassword123!', OldPassword: 'wrongOldPassword',
    }), itemParams('7'));
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/password lama.*salah/i);
  });

  it('23. DELETE [id] blocks deletion when user is a borrower in peminjaman', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue({ IdPeminjaman: 1, IdUser: 7 });
    const res = await userItem.DELETE(makeRequest('http://localhost/api/users/7'), itemParams('7'));
    expect(res.status).toBe(400);
    expect(prismaMock.users.delete).not.toHaveBeenCalled();
  });

  it('24. DELETE [id] blocks deletion when user is an admin approval in peminjaman', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue({ IdPeminjaman: 2, IdAdminApproval: 7 });
    const res = await userItem.DELETE(makeRequest('http://localhost/api/users/7'), itemParams('7'));
    expect(res.status).toBe(400);
    expect(prismaMock.users.delete).not.toHaveBeenCalled();
  });

  it('25. DELETE [id] deletes user successfully when no loan records exist', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue(null);
    prismaMock.users.delete.mockResolvedValue({ IdUser: 7 });
    const res = await userItem.DELETE(makeRequest('http://localhost/api/users/7'), itemParams('7'));
    expect(res.status).toBe(200);
    expect(prismaMock.users.delete).toHaveBeenCalledWith({ where: { IdUser: 7 } });
  });
});
