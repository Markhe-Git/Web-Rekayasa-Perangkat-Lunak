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

const responseBody = (response) => response.json();
const itemParams = (id = '10') => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Profil User API Operations Suite (20 Tests)', () => {
  it('1. updates profile attributes (NIM, Nama, Email) with a new Password', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({
      IdUser: 10, Nim: '220005', Nama: 'Budi Santoso', Email: 'budi@example.com', Role: 'Anggota',
    });

    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Budi Santoso', Email: 'budi@example.com', Password: 'newpassword123', Role: 'Anggota',
      }),
      itemParams('10')
    );

    expect(res.status).toBe(200);
    expect(prismaMock.users.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { IdUser: 10 },
      data: expect.objectContaining({ Password: 'newpassword123' }),
    }));
  });

  it('2. updates profile attributes without changing password when Password is omitted', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 10, Nama: 'Nama Baru' });

    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Nama Baru', Email: 'budi@example.com', Role: 'Anggota',
      }),
      itemParams('10')
    );

    expect(res.status).toBe(200);
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { IdUser: 10 },
      data: { Nim: '220005', Nama: 'Nama Baru', Email: 'budi@example.com', Role: 'Anggota' },
    });
  });

  it('3. updates profile when old and new NIM are identical', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 10, Nim: '220005' });
    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Budi S', Email: 'budi@example.com', Role: 'Anggota',
      }),
      itemParams('10')
    );
    expect(res.status).toBe(200);
  });

  it('4. updates profile when old and new Email are identical', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 10, Email: 'budi@example.com' });
    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Budi S', Email: 'budi@example.com', Role: 'Anggota',
      }),
      itemParams('10')
    );
    expect(res.status).toBe(200);
  });

  it('5. rejects profile update when new NIM is already taken by another user', async () => {
    prismaMock.users.findFirst.mockResolvedValue({ IdUser: 99, Nim: '220005' });
    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Budi', Email: 'budi@example.com', Role: 'Anggota',
      }),
      itemParams('10')
    );
    expect(res.status).toBe(409);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/sudah digunakan/i);
  });

  it('6. rejects profile update when new Email is already taken by another user', async () => {
    prismaMock.users.findFirst.mockResolvedValue({ IdUser: 88, Email: 'taken@example.com' });
    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Budi', Email: 'taken@example.com', Role: 'Anggota',
      }),
      itemParams('10')
    );
    expect(res.status).toBe(409);
  });

  it('7. validates OldPassword match when OldPassword is provided', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.findUnique.mockResolvedValue({ Password: 'currentPass#123' });
    prismaMock.users.update.mockResolvedValue({ IdUser: 10 });

    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Budi', Email: 'budi@example.com', Role: 'Anggota',
        Password: 'brandNewPassword#456', OldPassword: 'currentPass#123',
      }),
      itemParams('10')
    );
    expect(res.status).toBe(200);
    expect(prismaMock.users.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Password: 'brandNewPassword#456' }),
    }));
  });

  it('8. rejects password update when OldPassword does not match current password', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.findUnique.mockResolvedValue({ Password: 'currentPass#123' });

    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Budi', Email: 'budi@example.com', Role: 'Anggota',
        Password: 'brandNewPassword#456', OldPassword: 'wrongOldPassword',
      }),
      itemParams('10')
    );
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/password lama.*salah/i);
  });

  it('9. preserves user Role during profile update', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 10, Role: 'Anggota' });
    await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Budi', Email: 'budi@example.com', Role: 'Anggota',
      }),
      itemParams('10')
    );
    expect(prismaMock.users.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Role: 'Anggota' }),
    }));
  });

  it('10. targets the exact IdUser from route params on profile update', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 42 });
    await userItem.PUT(
      makeRequest('http://localhost/api/users/42', {
        Nim: '424242', Nama: 'User 42', Email: 'u42@example.com', Role: 'Anggota',
      }),
      itemParams('42')
    );
    expect(prismaMock.users.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { IdUser: 42 },
    }));
  });

  it('11. returns updated user record in response payload', async () => {
    prismaMock.users.findFirst.mockResolvedValue(null);
    prismaMock.users.update.mockResolvedValue({ IdUser: 10, Nama: 'Updated Name' });
    const res = await userItem.PUT(
      makeRequest('http://localhost/api/users/10', {
        Nim: '220005', Nama: 'Updated Name', Email: 'budi@example.com', Role: 'Anggota',
      }),
      itemParams('10')
    );
    const body = await responseBody(res);
    expect(body.Nama).toBe('Updated Name');
  });

  it('12. GET [id] fetches user profile data successfully', async () => {
    prismaMock.users.findUnique.mockResolvedValue({
      IdUser: 10, Nim: '220005', Nama: 'Budi Santoso', Email: 'budi@example.com', Role: 'Anggota',
    });
    const res = await userItem.GET(makeRequest('http://localhost/api/users/10'), itemParams('10'));
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.Nim).toBe('220005');
  });

  it('13. GET [id] returns 404 for nonexistent user profile', async () => {
    prismaMock.users.findUnique.mockResolvedValue(null);
    const res = await userItem.GET(makeRequest('http://localhost/api/users/999'), itemParams('999'));
    expect(res.status).toBe(404);
  });

  it('14. GET [id] verifies select clause excludes password hash', async () => {
    prismaMock.users.findUnique.mockResolvedValue({ IdUser: 10, Nama: 'Budi' });
    await userItem.GET(makeRequest('http://localhost/api/users/10'), itemParams('10'));
    expect(prismaMock.users.findUnique).toHaveBeenCalledWith({
      where: { IdUser: 10 },
      select: { IdUser: true, Nim: true, Nama: true, Email: true, Role: true, CreatedAt: true },
    });
  });

  it('15. deletes user account when confirmed and no active loans exist', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue(null);
    prismaMock.users.delete.mockResolvedValue({ IdUser: 10 });

    const res = await userItem.DELETE(makeRequest('http://localhost/api/users/10'), itemParams('10'));
    expect(res.status).toBe(200);
    expect(prismaMock.users.delete).toHaveBeenCalledWith({ where: { IdUser: 10 } });
  });

  it('16. rejects account deletion if user has active loan history as borrower', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue({ IdPeminjaman: 5, IdUser: 10 });
    const res = await userItem.DELETE(makeRequest('http://localhost/api/users/10'), itemParams('10'));
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toContain('memiliki data peminjaman');
    expect(prismaMock.users.delete).not.toHaveBeenCalled();
  });

  it('17. rejects account deletion if user has active approval history as admin', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue({ IdPeminjaman: 6, IdAdminApproval: 10 });
    const res = await userItem.DELETE(makeRequest('http://localhost/api/users/10'), itemParams('10'));
    expect(res.status).toBe(400);
    expect(prismaMock.users.delete).not.toHaveBeenCalled();
  });

  it('18. returns 400 error message explaining loan constraint on account deletion', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue({ IdPeminjaman: 7 });
    const res = await userItem.DELETE(makeRequest('http://localhost/api/users/10'), itemParams('10'));
    const body = await responseBody(res);
    expect(body.Error).toMatch(/tidak dapat dihapus/i);
  });

  it('19. DELETE [id] returns success message upon account deletion', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue(null);
    prismaMock.users.delete.mockResolvedValue({ IdUser: 10 });
    const res = await userItem.DELETE(makeRequest('http://localhost/api/users/10'), itemParams('10'));
    const body = await responseBody(res);
    expect(body.Message).toMatch(/berhasil dihapus/i);
  });

  it('20. DELETE [id] targets the exact IdUser from route params', async () => {
    prismaMock.peminjaman.findFirst.mockResolvedValue(null);
    prismaMock.users.delete.mockResolvedValue({ IdUser: 55 });
    await userItem.DELETE(makeRequest('http://localhost/api/users/55'), itemParams('55'));
    expect(prismaMock.users.delete).toHaveBeenCalledWith({ where: { IdUser: 55 } });
  });
});
