import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as peminjamanCollection from '@/app/api/peminjaman/route';
import * as peminjamanItem from '@/app/api/peminjaman/[id]/route';

const prismaMock = vi.hoisted(() => ({
  peminjaman: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  barang: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  detailPeminjaman: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
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

describe('Peminjaman API database operations', () => {
  it('lists peminjaman using status and user filters', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([{ IdPeminjaman: 5 }]);

    const response = await peminjamanCollection.GET(
      makeRequest('http://localhost/api/peminjaman?status=Pending&userId=4'),
    );

    expect(await responseBody(response)).toEqual([{ IdPeminjaman: 5 }]);
    expect(prismaMock.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { StatusPeminjaman: 'Pending', IdUser: 4 },
    }));
  });

  it('validates loan creation, refuses unavailable barang, and creates a pending loan', async () => {
    const invalid = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', { Items: [] }));
    expect(invalid.status).toBe(400);

    prismaMock.barang.findMany.mockResolvedValue([{ NamaBarang: 'Kamera' }]);
    const unavailable = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: '2', TglPinjam: '2025-01-01', TglRencanaKembali: '2025-01-02', TujuanPinjam: 'Acara', Items: ['8'],
    }));
    expect(unavailable.status).toBe(409);
    expect(prismaMock.peminjaman.create).not.toHaveBeenCalled();

    prismaMock.barang.findMany.mockResolvedValue([]);
    prismaMock.peminjaman.create.mockResolvedValue({ IdPeminjaman: 9, StatusPeminjaman: 'Pending' });
    const create = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: '2', TglPinjam: '2025-01-01', TglRencanaKembali: '2025-01-02', TujuanPinjam: 'Acara', Items: ['8'],
    }));
    expect(create.status).toBe(201);
    expect(prismaMock.peminjaman.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        IdUser: 2,
        StatusPeminjaman: 'Pending',
        DetailPeminjaman: { createMany: { data: [{ IdBarang: 8 }] } },
      }),
    }));
  });

  it('retrieves a loan and reports when it is missing', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValueOnce({ IdPeminjaman: 7 }).mockResolvedValueOnce(null);

    expect((await peminjamanItem.GET(makeRequest('http://localhost/api/peminjaman/7'), itemParams())).status).toBe(200);
    expect((await peminjamanItem.GET(makeRequest('http://localhost/api/peminjaman/7'), itemParams())).status).toBe(404);
  });

  it('approves pending loans transactionally and rejects pending loans', async () => {
    const pending = { StatusPeminjaman: 'Pending', DetailPeminjaman: [{ IdBarang: 8 }] };
    prismaMock.peminjaman.findUnique.mockResolvedValueOnce(pending).mockResolvedValueOnce({ IdPeminjaman: 7, StatusPeminjaman: 'Approved' });
    prismaMock.$transaction.mockImplementation(async operations => Promise.all(operations));
    const approve = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', {
      Action: 'Approve', IdAdminApproval: '3', CatatanAdmin: 'OK',
    }), itemParams());
    expect(approve.status).toBe(200);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.peminjaman.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { IdPeminjaman: 7 },
      data: { StatusPeminjaman: 'Approved', IdAdminApproval: 3, CatatanAdmin: 'OK' },
    }));
    expect(prismaMock.barang.update).toHaveBeenCalledWith({
      where: { IdBarang: 8 },
      data: { Status: 'Dipinjam' },
    });

    prismaMock.peminjaman.findUnique.mockResolvedValueOnce(pending).mockResolvedValueOnce({ IdPeminjaman: 7, StatusPeminjaman: 'Rejected' });
    const reject = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', {
      Action: 'Reject', IdAdminApproval: '3', CatatanAdmin: 'Tidak tersedia',
    }), itemParams());
    expect(reject.status).toBe(200);
    expect(prismaMock.peminjaman.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { StatusPeminjaman: 'Rejected', IdAdminApproval: 3, CatatanAdmin: 'Tidak tersedia' },
    }));
  });

  it('completes an approved loan and returns barang to available status', async () => {
    const approved = { StatusPeminjaman: 'Approved', DetailPeminjaman: [{ IdBarang: 8 }] };
    prismaMock.peminjaman.findUnique.mockResolvedValueOnce(approved).mockResolvedValueOnce({ IdPeminjaman: 7, StatusPeminjaman: 'Completed' });
    prismaMock.$transaction.mockImplementation(async operations => Promise.all(operations));
    prismaMock.detailPeminjaman.update.mockResolvedValue({});

    const response = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', {
      Action: 'Complete',
      CatatanKondisiKembali: { 12: 'Baik' },
    }), itemParams());

    expect(response.status).toBe(200);
    expect(prismaMock.barang.update).toHaveBeenCalledWith({
      where: { IdBarang: 8 },
      data: { Status: 'Tersedia' },
    });
    expect(prismaMock.detailPeminjaman.update).toHaveBeenCalledWith({
      where: { IdDetail: 12 },
      data: { CatatanKondisiKembali: 'Baik' },
    });
  });

  it('cancels a pending loan and rejects invalid loan actions', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValueOnce({
      StatusPeminjaman: 'Pending', DetailPeminjaman: [],
    }).mockResolvedValueOnce({ IdPeminjaman: 7, StatusPeminjaman: 'Cancelled' });
    const cancel = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', { Action: 'Cancel' }), itemParams());
    expect(cancel.status).toBe(200);
    expect(prismaMock.peminjaman.update).toHaveBeenCalledWith({
      where: { IdPeminjaman: 7 },
      data: { StatusPeminjaman: 'Cancelled' },
    });

    prismaMock.peminjaman.findUnique.mockResolvedValueOnce({ StatusPeminjaman: 'Pending', DetailPeminjaman: [] });
    const invalid = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', { Action: 'Archive' }), itemParams());
    expect(invalid.status).toBe(400);
  });

  it('deletes only pending loans', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValueOnce(null);
    expect((await peminjamanItem.DELETE(makeRequest('http://localhost/api/peminjaman/7'), itemParams())).status).toBe(404);

    prismaMock.peminjaman.findUnique.mockResolvedValueOnce({ StatusPeminjaman: 'Approved' });
    expect((await peminjamanItem.DELETE(makeRequest('http://localhost/api/peminjaman/7'), itemParams())).status).toBe(400);

    prismaMock.peminjaman.findUnique.mockResolvedValueOnce({ StatusPeminjaman: 'Pending' });
    prismaMock.peminjaman.delete.mockResolvedValue({});
    const deletion = await peminjamanItem.DELETE(makeRequest('http://localhost/api/peminjaman/7'), itemParams());
    expect(deletion.status).toBe(200);
    expect(prismaMock.peminjaman.delete).toHaveBeenCalledWith({ where: { IdPeminjaman: 7 } });
  });
});
