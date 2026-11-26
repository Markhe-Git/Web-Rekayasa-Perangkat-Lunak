import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as barangCollection from '@/app/api/barang/route';
import * as barangItem from '@/app/api/barang/[id]/route';

const prismaMock = vi.hoisted(() => ({
  barang: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  detailPeminjaman: {
    findFirst: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const makeRequest = (url, body) => ({
  url,
  json: vi.fn().mockResolvedValue(body),
});

const responseBody = (response) => response.json();
const itemParams = (id = '4') => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Barang API Management Suite (30 Tests)', () => {
  it('1. GET lists all barang when filter params are empty', async () => {
    prismaMock.barang.findMany.mockResolvedValue([{ IdBarang: 1, NamaBarang: 'Proyektor' }]);
    const res = await barangCollection.GET(makeRequest('http://localhost/api/barang'));
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.length).toBe(1);
  });

  it('2. GET filters barang by search query (NamaBarang or KodeInventaris)', async () => {
    prismaMock.barang.findMany.mockResolvedValue([]);
    await barangCollection.GET(makeRequest('http://localhost/api/barang?search=Epson'));
    expect(prismaMock.barang.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: [{ NamaBarang: { contains: 'Epson' } }, { KodeInventaris: { contains: 'Epson' } }],
      }),
    }));
  });

  it('3. GET filters barang by kategori', async () => {
    prismaMock.barang.findMany.mockResolvedValue([]);
    await barangCollection.GET(makeRequest('http://localhost/api/barang?kategori=2'));
    expect(prismaMock.barang.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ IdKategori: 2 }),
    }));
  });

  it('4. GET filters barang by status', async () => {
    prismaMock.barang.findMany.mockResolvedValue([]);
    await barangCollection.GET(makeRequest('http://localhost/api/barang?status=Tersedia'));
    expect(prismaMock.barang.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ Status: 'Tersedia' }),
    }));
  });

  it('5. GET combines search, kategori, and status filters simultaneously', async () => {
    prismaMock.barang.findMany.mockResolvedValue([]);
    await barangCollection.GET(makeRequest('http://localhost/api/barang?search=Mic&kategori=4&status=Dipinjam'));
    expect(prismaMock.barang.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        OR: [{ NamaBarang: { contains: 'Mic' } }, { KodeInventaris: { contains: 'Mic' } }],
        IdKategori: 4,
        Status: 'Dipinjam',
      }),
    }));
  });

  it('6. GET includes active borrower details for Approved loans', async () => {
    prismaMock.barang.findMany.mockResolvedValue([
      { IdBarang: 1, DetailPeminjaman: [{ Peminjaman: { User: { Nama: 'Ahmad' } } }] },
    ]);
    const res = await barangCollection.GET(makeRequest('http://localhost/api/barang'));
    const body = await responseBody(res);
    expect(body[0].DetailPeminjaman[0].Peminjaman.User.Nama).toBe('Ahmad');
  });

  it('7. GET orders results by IdBarang asc', async () => {
    prismaMock.barang.findMany.mockResolvedValue([]);
    await barangCollection.GET(makeRequest('http://localhost/api/barang'));
    expect(prismaMock.barang.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { IdBarang: 'asc' },
    }));
  });

  it('8. POST returns 400 when IdKategori is missing', async () => {
    const res = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      KodeInventaris: 'INV-01', NamaBarang: 'Kabel',
    }));
    expect(res.status).toBe(400);
  });

  it('9. POST returns 400 when KodeInventaris is missing', async () => {
    const res = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, NamaBarang: 'Kabel',
    }));
    expect(res.status).toBe(400);
  });

  it('10. POST returns 400 when NamaBarang is missing', async () => {
    const res = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: 'INV-01',
    }));
    expect(res.status).toBe(400);
  });

  it('11. POST returns 400 when KodeInventaris is empty spaces', async () => {
    const res = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: '   ', NamaBarang: 'Kabel',
    }));
    expect(res.status).toBe(400);
  });

  it('12. POST returns 400 when NamaBarang is empty spaces', async () => {
    const res = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: 'INV-01', NamaBarang: '   ',
    }));
    expect(res.status).toBe(400);
  });

  it('13. POST returns 409 when KodeInventaris already exists', async () => {
    prismaMock.barang.findUnique.mockResolvedValue({ IdBarang: 9, KodeInventaris: 'INV-DUPLICATE' });
    const res = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: 'INV-DUPLICATE', NamaBarang: 'Proyektor',
    }));
    expect(res.status).toBe(409);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/sudah digunakan/i);
  });

  it('14. POST creates barang with default Kondisi=Baik when omitted', async () => {
    prismaMock.barang.findUnique.mockResolvedValue(null);
    prismaMock.barang.create.mockResolvedValue({ IdBarang: 1, Kondisi: 'Baik' });
    await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: 'INV-01', NamaBarang: 'Item',
    }));
    expect(prismaMock.barang.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Kondisi: 'Baik' }),
    }));
  });

  it('15. POST creates barang with default Status=Tersedia when omitted', async () => {
    prismaMock.barang.findUnique.mockResolvedValue(null);
    prismaMock.barang.create.mockResolvedValue({ IdBarang: 1, Status: 'Tersedia' });
    await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: 'INV-01', NamaBarang: 'Item',
    }));
    expect(prismaMock.barang.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Status: 'Tersedia' }),
    }));
  });

  it('16. POST creates barang with custom Kondisi (RusakRingan)', async () => {
    prismaMock.barang.findUnique.mockResolvedValue(null);
    prismaMock.barang.create.mockResolvedValue({ IdBarang: 2, Kondisi: 'RusakRingan' });
    await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: 'INV-02', NamaBarang: 'Speaker', Kondisi: 'RusakRingan',
    }));
    expect(prismaMock.barang.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Kondisi: 'RusakRingan' }),
    }));
  });

  it('17. POST creates barang with custom Status (Maintenance)', async () => {
    prismaMock.barang.findUnique.mockResolvedValue(null);
    prismaMock.barang.create.mockResolvedValue({ IdBarang: 3, Status: 'Maintenance' });
    await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: 'INV-03', NamaBarang: 'Mic', Status: 'Maintenance',
    }));
    expect(prismaMock.barang.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Status: 'Maintenance' }),
    }));
  });

  it('18. POST trims KodeInventaris and NamaBarang before saving', async () => {
    prismaMock.barang.findUnique.mockResolvedValue(null);
    prismaMock.barang.create.mockResolvedValue({ IdBarang: 4 });
    await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: '  INV-TRIM  ', NamaBarang: '  Whiteboard  ',
    }));
    expect(prismaMock.barang.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ KodeInventaris: 'INV-TRIM', NamaBarang: 'Whiteboard' }),
    }));
  });

  it('19. POST returns 201 on success with included Kategori data', async () => {
    prismaMock.barang.findUnique.mockResolvedValue(null);
    prismaMock.barang.create.mockResolvedValue({ IdBarang: 5, Kategori: { NamaKategori: 'Elektronik' } });
    const res = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 1, KodeInventaris: 'INV-05', NamaBarang: 'Monitor',
    }));
    expect(res.status).toBe(201);
  });

  it('20. GET [id] returns 200 with barang details when found', async () => {
    prismaMock.barang.findUnique.mockResolvedValue({ IdBarang: 4, NamaBarang: 'Proyektor' });
    const res = await barangItem.GET(makeRequest('http://localhost/api/barang/4'), itemParams('4'));
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.NamaBarang).toBe('Proyektor');
  });

  it('21. GET [id] returns 404 when barang does not exist', async () => {
    prismaMock.barang.findUnique.mockResolvedValue(null);
    const res = await barangItem.GET(makeRequest('http://localhost/api/barang/999'), itemParams('999'));
    expect(res.status).toBe(404);
  });

  it('22. PUT [id] updates barang attributes successfully', async () => {
    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.barang.update.mockResolvedValue({ IdBarang: 4, NamaBarang: 'Nama Baru' });
    const res = await barangItem.PUT(makeRequest('http://localhost/api/barang/4', {
      NamaBarang: 'Nama Baru', IdKategori: 2,
    }), itemParams('4'));
    expect(res.status).toBe(200);
    expect(prismaMock.barang.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { IdBarang: 4 },
      data: expect.objectContaining({ NamaBarang: 'Nama Baru', IdKategori: 2 }),
    }));
  });

  it('23. PUT [id] updates only status to Dipinjam', async () => {
    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.barang.update.mockResolvedValue({ IdBarang: 4, Status: 'Dipinjam' });
    await barangItem.PUT(makeRequest('http://localhost/api/barang/4', { Status: 'Dipinjam' }), itemParams('4'));
    expect(prismaMock.barang.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Status: 'Dipinjam' }),
    }));
  });

  it('24. PUT [id] updates only kondisi to RusakBerat', async () => {
    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.barang.update.mockResolvedValue({ IdBarang: 4, Kondisi: 'RusakBerat' });
    await barangItem.PUT(makeRequest('http://localhost/api/barang/4', { Kondisi: 'RusakBerat' }), itemParams('4'));
    expect(prismaMock.barang.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ Kondisi: 'RusakBerat' }),
    }));
  });

  it('25. PUT [id] returns 409 when updated KodeInventaris conflicts with another barang', async () => {
    prismaMock.barang.findFirst.mockResolvedValue({ IdBarang: 8, KodeInventaris: 'INV-TAKEN' });
    const res = await barangItem.PUT(makeRequest('http://localhost/api/barang/4', {
      KodeInventaris: 'INV-TAKEN',
    }), itemParams('4'));
    expect(res.status).toBe(409);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/sudah digunakan/i);
  });

  it('26. PUT [id] allows keeping the same KodeInventaris for the current barang', async () => {
    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.barang.update.mockResolvedValue({ IdBarang: 4, KodeInventaris: 'INV-SAME' });
    const res = await barangItem.PUT(makeRequest('http://localhost/api/barang/4', {
      KodeInventaris: 'INV-SAME',
    }), itemParams('4'));
    expect(res.status).toBe(200);
  });

  it('27. DELETE [id] blocks deletion when barang is in an active Pending loan', async () => {
    prismaMock.detailPeminjaman.findFirst.mockResolvedValue({
      IdDetail: 1,
      Peminjaman: { StatusPeminjaman: 'Pending' },
    });
    const res = await barangItem.DELETE(makeRequest('http://localhost/api/barang/4'), itemParams('4'));
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/peminjaman aktif/i);
  });

  it('28. DELETE [id] blocks deletion when barang is in an active Approved loan', async () => {
    prismaMock.detailPeminjaman.findFirst.mockResolvedValue({
      IdDetail: 2,
      Peminjaman: { StatusPeminjaman: 'Approved' },
    });
    const res = await barangItem.DELETE(makeRequest('http://localhost/api/barang/4'), itemParams('4'));
    expect(res.status).toBe(400);
  });

  it('29. DELETE [id] does not delete barang when active loan is detected', async () => {
    prismaMock.detailPeminjaman.findFirst.mockResolvedValue({ IdDetail: 3 });
    await barangItem.DELETE(makeRequest('http://localhost/api/barang/4'), itemParams('4'));
    expect(prismaMock.barang.delete).not.toHaveBeenCalled();
  });

  it('30. DELETE [id] deletes barang successfully when no active loan exists', async () => {
    prismaMock.detailPeminjaman.findFirst.mockResolvedValue(null);
    prismaMock.barang.delete.mockResolvedValue({ IdBarang: 4 });
    const res = await barangItem.DELETE(makeRequest('http://localhost/api/barang/4'), itemParams('4'));
    expect(res.status).toBe(200);
    expect(prismaMock.barang.delete).toHaveBeenCalledWith({ where: { IdBarang: 4 } });
  });
});
