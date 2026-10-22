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

describe('Dashboard database operations', () => {
  it('aggregates database counts and recent loan records', async () => {
    prismaMock.users.count.mockResolvedValue(4);
    prismaMock.barang.count.mockResolvedValue(8);
    prismaMock.kategoriBarang.count.mockResolvedValue(2);
    prismaMock.peminjaman.groupBy.mockResolvedValue([{ StatusPeminjaman: 'Pending', _count: { StatusPeminjaman: 3 } }]);
    prismaMock.barang.groupBy.mockResolvedValue([{ Status: 'Tersedia', _count: { Status: 5 } }]);
    prismaMock.peminjaman.findMany.mockResolvedValue([{ IdPeminjaman: 1 }]);

    const response = await dashboardRoute.GET();

    expect(response.status).toBe(200);
    expect(await responseBody(response)).toEqual({
      Stats: {
        TotalUsers: 4,
        TotalBarang: 8,
        TotalKategori: 2,
        PeminjamanPending: 3,
        PeminjamanApproved: 0,
        PeminjamanCompleted: 0,
        PeminjamanRejected: 0,
        BarangTersedia: 5,
        BarangDipinjam: 0,
        BarangMaintenance: 0,
      },
      RecentPeminjaman: [{ IdPeminjaman: 1 }],
    });
  });

  it('returns an error response when a dashboard query fails', async () => {
    const error = new Error('Database tidak tersedia');
    prismaMock.users.count.mockRejectedValue(error);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await dashboardRoute.GET();

    expect(response.status).toBe(500);
    expect(await responseBody(response)).toMatchObject({ Error: 'Database tidak tersedia' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
