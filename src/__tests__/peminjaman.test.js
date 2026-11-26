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
  $transaction: vi.fn((promises) => Promise.all(promises)),
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const makeRequest = (url, body) => ({
  url,
  json: vi.fn().mockResolvedValue(body),
});

const responseBody = (response) => response.json();
const itemParams = (id = '5') => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Peminjaman API Operations Suite (35 Tests)', () => {
  it('1. GET lists all loans when no filters provided', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([{ IdPeminjaman: 1 }]);
    const res = await peminjamanCollection.GET(makeRequest('http://localhost/api/peminjaman'));
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.length).toBe(1);
  });

  it('2. GET filters loans by status=Pending', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([]);
    await peminjamanCollection.GET(makeRequest('http://localhost/api/peminjaman?status=Pending'));
    expect(prismaMock.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ StatusPeminjaman: 'Pending' }),
    }));
  });

  it('3. GET filters loans by status=Approved', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([]);
    await peminjamanCollection.GET(makeRequest('http://localhost/api/peminjaman?status=Approved'));
    expect(prismaMock.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ StatusPeminjaman: 'Approved' }),
    }));
  });

  it('4. GET filters loans by status=Completed', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([]);
    await peminjamanCollection.GET(makeRequest('http://localhost/api/peminjaman?status=Completed'));
    expect(prismaMock.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ StatusPeminjaman: 'Completed' }),
    }));
  });

  it('5. GET filters loans by status=Rejected', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([]);
    await peminjamanCollection.GET(makeRequest('http://localhost/api/peminjaman?status=Rejected'));
    expect(prismaMock.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ StatusPeminjaman: 'Rejected' }),
    }));
  });

  it('6. GET filters loans by userId', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([]);
    await peminjamanCollection.GET(makeRequest('http://localhost/api/peminjaman?userId=2'));
    expect(prismaMock.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ IdUser: 2 }),
    }));
  });

  it('7. GET combines status and userId filters', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([]);
    await peminjamanCollection.GET(makeRequest('http://localhost/api/peminjaman?status=Pending&userId=3'));
    expect(prismaMock.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ StatusPeminjaman: 'Pending', IdUser: 3 }),
    }));
  });

  it('8. GET orders loans by TglPengajuan desc', async () => {
    prismaMock.peminjaman.findMany.mockResolvedValue([]);
    await peminjamanCollection.GET(makeRequest('http://localhost/api/peminjaman'));
    expect(prismaMock.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { TglPengajuan: 'desc' },
    }));
  });

  it('9. POST returns 400 when IdUser is missing', async () => {
    const res = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      TglPinjam: '2026-11-01', TglRencanaKembali: '2026-11-03', TujuanPinjam: 'Acara', Items: [1],
    }));
    expect(res.status).toBe(400);
  });

  it('10. POST returns 400 when TglPinjam is missing', async () => {
    const res = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: 2, TglRencanaKembali: '2026-11-03', TujuanPinjam: 'Acara', Items: [1],
    }));
    expect(res.status).toBe(400);
  });

  it('11. POST returns 400 when TglRencanaKembali is missing', async () => {
    const res = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: 2, TglPinjam: '2026-11-01', TujuanPinjam: 'Acara', Items: [1],
    }));
    expect(res.status).toBe(400);
  });

  it('12. POST returns 400 when TujuanPinjam is missing', async () => {
    const res = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: 2, TglPinjam: '2026-11-01', TglRencanaKembali: '2026-11-03', Items: [1],
    }));
    expect(res.status).toBe(400);
  });

  it('13. POST returns 400 when Items array is missing or empty', async () => {
    const res = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: 2, TglPinjam: '2026-11-01', TglRencanaKembali: '2026-11-03', TujuanPinjam: 'Acara', Items: [],
    }));
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/minimal 1 barang/i);
  });

  it('14. POST returns 409 when any requested item is currently Dipinjam', async () => {
    prismaMock.barang.findMany.mockResolvedValue([{ IdBarang: 1, NamaBarang: 'Proyektor', Status: 'Dipinjam' }]);
    const res = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: 2, TglPinjam: '2026-11-01', TglRencanaKembali: '2026-11-03', TujuanPinjam: 'Acara', Items: [1],
    }));
    expect(res.status).toBe(409);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/tidak tersedia: Proyektor/i);
  });

  it('15. POST returns 409 when any requested item is under Maintenance', async () => {
    prismaMock.barang.findMany.mockResolvedValue([{ IdBarang: 2, NamaBarang: 'Speaker', Status: 'Maintenance' }]);
    const res = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: 2, TglPinjam: '2026-11-01', TglRencanaKembali: '2026-11-03', TujuanPinjam: 'Acara', Items: [2],
    }));
    expect(res.status).toBe(409);
  });

  it('16. POST creates loan with Pending status and returns 201', async () => {
    prismaMock.barang.findMany.mockResolvedValue([]);
    prismaMock.peminjaman.create.mockResolvedValue({ IdPeminjaman: 10, StatusPeminjaman: 'Pending' });
    const res = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: 2, TglPinjam: '2026-11-01', TglRencanaKembali: '2026-11-03', TujuanPinjam: 'Workshop', Items: [3, 4],
    }));
    expect(res.status).toBe(201);
    expect(prismaMock.peminjaman.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ StatusPeminjaman: 'Pending', IdUser: 2 }),
    }));
  });

  it('17. POST creates DetailPeminjaman entries for all requested items', async () => {
    prismaMock.barang.findMany.mockResolvedValue([]);
    prismaMock.peminjaman.create.mockResolvedValue({ IdPeminjaman: 11 });
    await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: 2, TglPinjam: '2026-11-01', TglRencanaKembali: '2026-11-03', TujuanPinjam: 'Workshop', Items: [7, 8],
    }));
    expect(prismaMock.peminjaman.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        DetailPeminjaman: { createMany: { data: [{ IdBarang: 7 }, { IdBarang: 8 }] } },
      }),
    }));
  });

  it('18. GET [id] returns loan details when loan exists', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, TujuanPinjam: 'Rapat' });
    const res = await peminjamanItem.GET(makeRequest('http://localhost/api/peminjaman/5'), itemParams('5'));
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.TujuanPinjam).toBe('Rapat');
  });

  it('19. GET [id] returns 404 when loan does not exist', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue(null);
    const res = await peminjamanItem.GET(makeRequest('http://localhost/api/peminjaman/999'), itemParams('999'));
    expect(res.status).toBe(404);
  });

  it('20. PUT [id] returns 404 when loan to update is not found', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue(null);
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/999', { Action: 'Approve' }), itemParams('999'));
    expect(res.status).toBe(404);
  });

  it('21. PUT [id] returns 400 for an unrecognized Action', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Pending' });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'InvalidAction' }), itemParams('5'));
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/action tidak valid/i);
  });

  it('22. PUT [id] Action=Approve transitions status to Approved', async () => {
    prismaMock.peminjaman.findUnique
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Pending', DetailPeminjaman: [{ IdBarang: 1 }] })
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Approved' });
    prismaMock.peminjaman.update.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Approved' });

    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', {
      Action: 'Approve', IdAdminApproval: 1, CatatanAdmin: 'ACC',
    }), itemParams('5'));
    expect(res.status).toBe(200);
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('23. PUT [id] Action=Approve updates all loan items to Dipinjam in transaction', async () => {
    prismaMock.peminjaman.findUnique
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Pending', DetailPeminjaman: [{ IdBarang: 1 }, { IdBarang: 2 }] })
      .mockResolvedValueOnce({ IdPeminjaman: 5 });
    await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Approve', IdAdminApproval: 1 }), itemParams('5'));
    expect(prismaMock.barang.update).toHaveBeenCalledWith({ where: { IdBarang: 1 }, data: { Status: 'Dipinjam' } });
    expect(prismaMock.barang.update).toHaveBeenCalledWith({ where: { IdBarang: 2 }, data: { Status: 'Dipinjam' } });
  });

  it('24. PUT [id] Action=Approve returns 400 if loan status is not Pending', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Approved', DetailPeminjaman: [] });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Approve' }), itemParams('5'));
    expect(res.status).toBe(400);
  });

  it('25. PUT [id] Action=Reject transitions status to Rejected', async () => {
    prismaMock.peminjaman.findUnique
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Pending', DetailPeminjaman: [] })
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Rejected' });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', {
      Action: 'Reject', IdAdminApproval: 1, CatatanAdmin: 'Barang bentrok',
    }), itemParams('5'));
    expect(res.status).toBe(200);
    expect(prismaMock.peminjaman.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ StatusPeminjaman: 'Rejected', CatatanAdmin: 'Barang bentrok' }),
    }));
  });

  it('26. PUT [id] Action=Reject returns 400 if loan status is not Pending', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Completed', DetailPeminjaman: [] });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Reject' }), itemParams('5'));
    expect(res.status).toBe(400);
  });

  it('27. PUT [id] Action=Reject records admin notes', async () => {
    prismaMock.peminjaman.findUnique
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Pending', DetailPeminjaman: [] })
      .mockResolvedValueOnce({ IdPeminjaman: 5 });
    await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', {
      Action: 'Reject', IdAdminApproval: 1, CatatanAdmin: 'Ruangan penuh',
    }), itemParams('5'));
    expect(prismaMock.peminjaman.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ CatatanAdmin: 'Ruangan penuh' }),
    }));
  });

  it('28. PUT [id] Action=Complete transitions status to Completed', async () => {
    prismaMock.peminjaman.findUnique
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Approved', DetailPeminjaman: [{ IdBarang: 1 }] })
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Completed' });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Complete' }), itemParams('5'));
    expect(res.status).toBe(200);
  });

  it('29. PUT [id] Action=Complete updates all loan items back to Tersedia in transaction', async () => {
    prismaMock.peminjaman.findUnique
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Approved', DetailPeminjaman: [{ IdBarang: 1 }] })
      .mockResolvedValueOnce({ IdPeminjaman: 5 });
    await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Complete' }), itemParams('5'));
    expect(prismaMock.barang.update).toHaveBeenCalledWith({ where: { IdBarang: 1 }, data: { Status: 'Tersedia' } });
  });

  it('30. PUT [id] Action=Complete returns 400 if loan status is not Approved', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Pending', DetailPeminjaman: [] });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Complete' }), itemParams('5'));
    expect(res.status).toBe(400);
  });

  it('31. PUT [id] Action=Cancel transitions status to Cancelled for loan owner', async () => {
    prismaMock.peminjaman.findUnique
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Pending', IdUser: 2, DetailPeminjaman: [] })
      .mockResolvedValueOnce({ IdPeminjaman: 5, StatusPeminjaman: 'Cancelled' });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Cancel', IdUser: 2 }), itemParams('5'));
    expect(res.status).toBe(200);
    expect(prismaMock.peminjaman.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { StatusPeminjaman: 'Cancelled' },
    }));
  });

  it('32. PUT [id] Action=Cancel returns 403 when user attempts to cancel another users loan', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Pending', IdUser: 2, DetailPeminjaman: [] });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Cancel', IdUser: 99 }), itemParams('5'));
    expect(res.status).toBe(403);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/pengguna lain/i);
  });

  it('33. PUT [id] Action=Cancel returns 400 if loan status is not Pending', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Approved', IdUser: 2, DetailPeminjaman: [] });
    const res = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/5', { Action: 'Cancel', IdUser: 2 }), itemParams('5'));
    expect(res.status).toBe(400);
  });

  it('34. DELETE [id] blocks deletion with 400 when loan is Approved', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Approved' });
    const res = await peminjamanItem.DELETE(makeRequest('http://localhost/api/peminjaman/5'), itemParams('5'));
    expect(res.status).toBe(400);
    expect(prismaMock.peminjaman.delete).not.toHaveBeenCalled();
  });

  it('35. DELETE [id] successfully deletes loan when status is Pending/Rejected/Completed', async () => {
    prismaMock.peminjaman.findUnique.mockResolvedValue({ IdPeminjaman: 5, StatusPeminjaman: 'Pending' });
    prismaMock.peminjaman.delete.mockResolvedValue({ IdPeminjaman: 5 });
    const res = await peminjamanItem.DELETE(makeRequest('http://localhost/api/peminjaman/5'), itemParams('5'));
    expect(res.status).toBe(200);
    expect(prismaMock.peminjaman.delete).toHaveBeenCalledWith({ where: { IdPeminjaman: 5 } });
  });
});
