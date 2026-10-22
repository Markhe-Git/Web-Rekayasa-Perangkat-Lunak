import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as kategoriCollection from '@/app/api/kategori/route';
import * as kategoriItem from '@/app/api/kategori/[id]/route';

const prismaMock = vi.hoisted(() => ({
  kategoriBarang: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  barang: {
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

describe('Kategori API database operations', () => {
  it('lists and creates kategori', async () => {
    prismaMock.kategoriBarang.findMany.mockResolvedValue([{ IdKategori: 1 }]);
    expect(await responseBody(await kategoriCollection.GET())).toEqual([{ IdKategori: 1 }]);

    const invalid = await kategoriCollection.POST(makeRequest('http://localhost/api/kategori', { NamaKategori: ' ' }));
    expect(invalid.status).toBe(400);

    prismaMock.kategoriBarang.create.mockResolvedValue({ IdKategori: 2, NamaKategori: 'Elektronik' });
    const response = await kategoriCollection.POST(makeRequest('http://localhost/api/kategori', { NamaKategori: ' Elektronik ' }));
    expect(response.status).toBe(201);
    expect(prismaMock.kategoriBarang.create).toHaveBeenCalledWith({ data: { NamaKategori: 'Elektronik' } });
  });

  it('updates kategori and prevents deleting a kategori that has barang', async () => {
    const invalid = await kategoriItem.PUT(makeRequest('http://localhost/api/kategori/3', { NamaKategori: ' ' }), itemParams('3'));
    expect(invalid.status).toBe(400);

    prismaMock.kategoriBarang.update.mockResolvedValue({ IdKategori: 3, NamaKategori: 'Audio' });
    const update = await kategoriItem.PUT(makeRequest('http://localhost/api/kategori/3', { NamaKategori: ' Audio ' }), itemParams('3'));
    expect(update.status).toBe(200);
    expect(prismaMock.kategoriBarang.update).toHaveBeenCalledWith({
      where: { IdKategori: 3 },
      data: { NamaKategori: 'Audio' },
    });

    prismaMock.barang.findFirst.mockResolvedValue({ IdBarang: 10 });
    const deletion = await kategoriItem.DELETE(makeRequest('http://localhost/api/kategori/3'), itemParams('3'));
    expect(deletion.status).toBe(400);
    expect(prismaMock.kategoriBarang.delete).not.toHaveBeenCalled();
  });

  it('deletes kategori when it has no barang', async () => {
    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.kategoriBarang.delete.mockResolvedValue({});

    const response = await kategoriItem.DELETE(makeRequest('http://localhost/api/kategori/3'), itemParams('3'));

    expect(response.status).toBe(200);
    expect(prismaMock.kategoriBarang.delete).toHaveBeenCalledWith({ where: { IdKategori: 3 } });
  });
});
