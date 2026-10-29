import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as barangCollection from '@/app/api/barang/route';
import * as barangItem from '@/app/api/barang/[id]/route';

const prismaMock = vi.hoisted(() => ({
  barang: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
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
const itemParams = (id = '7') => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Barang API database operations', () => {
  it('lists barang using supplied search filters', async () => {
    prismaMock.barang.findMany.mockResolvedValue([{ IdBarang: 2 }]);

    const response = await barangCollection.GET(
      makeRequest('http://localhost/api/barang?search=proyektor&kategori=3&status=Tersedia'),
    );

    expect(response.status).toBe(200);
    expect(await responseBody(response)).toEqual([{ IdBarang: 2 }]);
    expect(prismaMock.barang.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        OR: [{ NamaBarang: { contains: 'proyektor' } }, { KodeInventaris: { contains: 'proyektor' } }],
        IdKategori: 3,
        Status: 'Tersedia',
      },
    }));
  });

  it('rejects invalid barang creation and creates valid barang', async () => {
    const invalid = await barangCollection.POST(makeRequest('http://localhost/api/barang', { NamaBarang: ' ' }));
    expect(invalid.status).toBe(400);
    expect(prismaMock.barang.create).not.toHaveBeenCalled();

    prismaMock.barang.findUnique.mockResolvedValue(null);
    prismaMock.barang.create.mockResolvedValue({ IdBarang: 4, NamaBarang: 'Proyektor' });
    const response = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: '2',
      KodeInventaris: ' INV-01 ',
      NamaBarang: ' Proyektor ',
    }));

    expect(response.status).toBe(201);
    expect(prismaMock.barang.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        IdKategori: 2,
        KodeInventaris: 'INV-01',
        NamaBarang: 'Proyektor',
        Kondisi: 'Baik',
        Status: 'Tersedia',
      },
    }));
  });

  it('rejects duplicate inventory codes', async () => {
    prismaMock.barang.findUnique.mockResolvedValue({ IdBarang: 1 });

    const response = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 2, KodeInventaris: 'INV-01', NamaBarang: 'Proyektor',
    }));

    expect(response.status).toBe(409);
    expect(prismaMock.barang.create).not.toHaveBeenCalled();
  });

  it('retrieves, updates and deletes a barang', async () => {
    prismaMock.barang.findUnique.mockResolvedValue({ IdBarang: 7 });
    expect((await barangItem.GET(makeRequest('http://localhost/api/barang/7'), itemParams())).status).toBe(200);
    expect(prismaMock.barang.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { IdBarang: 7 } }));

    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.barang.update.mockResolvedValue({ IdBarang: 7, NamaBarang: 'Kamera' });
    const update = await barangItem.PUT(makeRequest('http://localhost/api/barang/7', { NamaBarang: 'Kamera' }), itemParams());
    expect(update.status).toBe(200);
    expect(prismaMock.barang.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { IdBarang: 7 },
      data: { NamaBarang: 'Kamera' },
    }));

    prismaMock.detailPeminjaman.findFirst.mockResolvedValue(null);
    prismaMock.barang.delete.mockResolvedValue({});
    const deletion = await barangItem.DELETE(makeRequest('http://localhost/api/barang/7'), itemParams());
    expect(deletion.status).toBe(200);
    expect(prismaMock.barang.delete).toHaveBeenCalledWith({ where: { IdBarang: 7 } });
  });

  it('blocks deleting barang with an active loan and duplicate-code updates', async () => {
    prismaMock.detailPeminjaman.findFirst.mockResolvedValue({ IdBarang: 7 });
    expect((await barangItem.DELETE(makeRequest('http://localhost/api/barang/7'), itemParams())).status).toBe(400);
    expect(prismaMock.barang.delete).not.toHaveBeenCalled();

    prismaMock.barang.findFirst.mockResolvedValue({ IdBarang: 8 });
    const response = await barangItem.PUT(makeRequest('http://localhost/api/barang/7', { KodeInventaris: 'INV-08' }), itemParams());
    expect(response.status).toBe(409);
    expect(prismaMock.barang.update).not.toHaveBeenCalled();
  });
});
