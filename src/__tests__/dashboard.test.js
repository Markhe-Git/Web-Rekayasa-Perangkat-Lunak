import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as dashboardRoute from '@/app/api/dashboard/route';

const prismaMock = vi.hoisted(() => ({
  users: {
    count: vi.fn(),
  },
  barang: {
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  kategoriBarang: {
    count: vi.fn(),
  },
  peminjaman: {
    groupBy: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const responseBody = (response) => response.json();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Dashboard Database Operations Suite (15 Tests)', () => {
  it('1. aggregates database counts and recent loan records with standard dataset', async () => {
    prismaMock.users.count.mockResolvedValue(4);
    prismaMock.barang.count.mockResolvedValue(8);
    prismaMock.kategoriBarang.count.mockResolvedValue(2);
    prismaMock.peminjaman.groupBy.mockResolvedValue([{ StatusPeminjaman: 'Pending', _count: { StatusPeminjaman: 3 } }]);
    prismaMock.barang.groupBy.mockResolvedValue([{ Status: 'Tersedia', _count: { Status: 5 } }]);
    prismaMock.peminjaman.findMany.mockResolvedValue([{ IdPeminjaman: 1 }]);

    const response = await dashboardRoute.GET();
    expect(response.status).toBe(200);
    const body = await responseBody(response);
    expect(body.Stats.TotalUsers).toBe(4);
    expect(body.Stats.PeminjamanPending).toBe(3);
    expect(body.Stats.BarangTersedia).toBe(5);
  });

  it('2. aggregates counts with multiple loan statuses (Pending, Approved, Completed, Rejected)', async () => {
    prismaMock.users.count.mockResolvedValue(10);
    prismaMock.barang.count.mockResolvedValue(20);
    prismaMock.kategoriBarang.count.mockResolvedValue(4);
    prismaMock.peminjaman.groupBy.mockResolvedValue([
      { StatusPeminjaman: 'Pending', _count: { StatusPeminjaman: 2 } },
      { StatusPeminjaman: 'Approved', _count: { StatusPeminjaman: 4 } },
      { StatusPeminjaman: 'Completed', _count: { StatusPeminjaman: 6 } },
      { StatusPeminjaman: 'Rejected', _count: { StatusPeminjaman: 1 } },
    ]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body.Stats.PeminjamanPending).toBe(2);
    expect(body.Stats.PeminjamanApproved).toBe(4);
    expect(body.Stats.PeminjamanCompleted).toBe(6);
    expect(body.Stats.PeminjamanRejected).toBe(1);
  });

  it('3. aggregates counts with multiple barang statuses (Tersedia, Dipinjam, Maintenance)', async () => {
    prismaMock.users.count.mockResolvedValue(5);
    prismaMock.barang.count.mockResolvedValue(15);
    prismaMock.kategoriBarang.count.mockResolvedValue(3);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([
      { Status: 'Tersedia', _count: { Status: 10 } },
      { Status: 'Dipinjam', _count: { Status: 3 } },
      { Status: 'Maintenance', _count: { Status: 2 } },
    ]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body.Stats.BarangTersedia).toBe(10);
    expect(body.Stats.BarangDipinjam).toBe(3);
    expect(body.Stats.BarangMaintenance).toBe(2);
  });

  it('4. returns empty array for RecentPeminjaman when no loans exist', async () => {
    prismaMock.users.count.mockResolvedValue(1);
    prismaMock.barang.count.mockResolvedValue(0);
    prismaMock.kategoriBarang.count.mockResolvedValue(0);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body.RecentPeminjaman).toEqual([]);
  });

  it('5. returns recent loans ordered by tgl_pengajuan with user info', async () => {
    prismaMock.users.count.mockResolvedValue(2);
    prismaMock.barang.count.mockResolvedValue(2);
    prismaMock.kategoriBarang.count.mockResolvedValue(1);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([
      { IdPeminjaman: 10, User: { Nama: 'Ahmad' }, TujuanPinjam: 'Acara' },
    ]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body.RecentPeminjaman.length).toBe(1);
    expect(body.RecentPeminjaman[0].User.Nama).toBe('Ahmad');
  });

  it('6. handles zero counts gracefully when database is fresh', async () => {
    prismaMock.users.count.mockResolvedValue(0);
    prismaMock.barang.count.mockResolvedValue(0);
    prismaMock.kategoriBarang.count.mockResolvedValue(0);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body.Stats.TotalUsers).toBe(0);
    expect(body.Stats.TotalBarang).toBe(0);
    expect(body.Stats.TotalKategori).toBe(0);
  });

  it('7. correctly queries TotalUsers via Prisma count', async () => {
    prismaMock.users.count.mockResolvedValue(99);
    prismaMock.barang.count.mockResolvedValue(0);
    prismaMock.kategoriBarang.count.mockResolvedValue(0);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body.Stats.TotalUsers).toBe(99);
    expect(prismaMock.users.count).toHaveBeenCalled();
  });

  it('8. correctly queries TotalBarang via Prisma count', async () => {
    prismaMock.users.count.mockResolvedValue(1);
    prismaMock.barang.count.mockResolvedValue(123);
    prismaMock.kategoriBarang.count.mockResolvedValue(0);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body.Stats.TotalBarang).toBe(123);
  });

  it('9. correctly queries TotalKategori via Prisma count', async () => {
    prismaMock.users.count.mockResolvedValue(1);
    prismaMock.barang.count.mockResolvedValue(0);
    prismaMock.kategoriBarang.count.mockResolvedValue(15);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body.Stats.TotalKategori).toBe(15);
  });

  it('10. verifies Prisma groupBy is called for StatusPeminjaman', async () => {
    prismaMock.users.count.mockResolvedValue(1);
    prismaMock.barang.count.mockResolvedValue(1);
    prismaMock.kategoriBarang.count.mockResolvedValue(1);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    await dashboardRoute.GET();
    expect(prismaMock.peminjaman.groupBy).toHaveBeenCalledWith({
      by: ['StatusPeminjaman'],
      _count: { StatusPeminjaman: true },
    });
  });

  it('11. verifies Prisma groupBy is called for StatusBarang', async () => {
    prismaMock.users.count.mockResolvedValue(1);
    prismaMock.barang.count.mockResolvedValue(1);
    prismaMock.kategoriBarang.count.mockResolvedValue(1);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    await dashboardRoute.GET();
    expect(prismaMock.barang.groupBy).toHaveBeenCalledWith({
      by: ['Status'],
      _count: { Status: true },
    });
  });

  it('12. returns 500 when users.count fails with database error', async () => {
    prismaMock.users.count.mockRejectedValue(new Error('Users count connection error'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await dashboardRoute.GET();
    expect(response.status).toBe(500);
    const body = await responseBody(response);
    expect(body.Error).toBe('Users count connection error');
    consoleError.mockRestore();
  });

  it('13. returns 500 when barang.count fails', async () => {
    prismaMock.users.count.mockResolvedValue(1);
    prismaMock.barang.count.mockRejectedValue(new Error('Barang count error'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await dashboardRoute.GET();
    expect(response.status).toBe(500);
    consoleError.mockRestore();
  });

  it('14. returns 500 when peminjaman.findMany fails', async () => {
    prismaMock.users.count.mockResolvedValue(1);
    prismaMock.barang.count.mockResolvedValue(1);
    prismaMock.kategoriBarang.count.mockResolvedValue(1);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockRejectedValue(new Error('FindMany recent loans error'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await dashboardRoute.GET();
    expect(response.status).toBe(500);
    consoleError.mockRestore();
  });

  it('15. returns structured JSON with both Stats and RecentPeminjaman root keys', async () => {
    prismaMock.users.count.mockResolvedValue(1);
    prismaMock.barang.count.mockResolvedValue(1);
    prismaMock.kategoriBarang.count.mockResolvedValue(1);
    prismaMock.peminjaman.groupBy.mockResolvedValue([]);
    prismaMock.barang.groupBy.mockResolvedValue([]);
    prismaMock.peminjaman.findMany.mockResolvedValue([]);

    const response = await dashboardRoute.GET();
    const body = await responseBody(response);
    expect(body).toHaveProperty('Stats');
    expect(body).toHaveProperty('RecentPeminjaman');
  });
});
