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

const makeRequest = (body) => ({
  json: vi.fn().mockResolvedValue(body),
});

const responseBody = (response) => response.json();
const itemParams = (id = '3') => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Kategori API Management Suite (20 Tests)', () => {
  it('1. GET lists all categories ordered by IdKategori asc', async () => {
    prismaMock.kategoriBarang.findMany.mockResolvedValue([
      { IdKategori: 1, NamaKategori: 'Elektronik' },
      { IdKategori: 2, NamaKategori: 'Perlengkapan' },
    ]);
    const res = await kategoriCollection.GET();
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.length).toBe(2);
    expect(prismaMock.kategoriBarang.findMany).toHaveBeenCalledWith({
      orderBy: { IdKategori: 'asc' },
      include: { _count: { select: { Barang: true } } },
    });
  });

  it('2. GET includes _count of associated Barang', async () => {
    prismaMock.kategoriBarang.findMany.mockResolvedValue([
      { IdKategori: 1, NamaKategori: 'Elektronik', _count: { Barang: 5 } },
    ]);
    const res = await kategoriCollection.GET();
    const body = await responseBody(res);
    expect(body[0]._count.Barang).toBe(5);
  });

  it('3. GET returns empty array when no categories exist', async () => {
    prismaMock.kategoriBarang.findMany.mockResolvedValue([]);
    const res = await kategoriCollection.GET();
    const body = await responseBody(res);
    expect(body).toEqual([]);
  });

  it('4. POST returns 400 when NamaKategori is missing', async () => {
    const res = await kategoriCollection.POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/wajib diisi/i);
  });

  it('5. POST returns 400 when NamaKategori is empty string', async () => {
    const res = await kategoriCollection.POST(makeRequest({ NamaKategori: '' }));
    expect(res.status).toBe(400);
  });

  it('6. POST returns 400 when NamaKategori contains only spaces', async () => {
    const res = await kategoriCollection.POST(makeRequest({ NamaKategori: '     ' }));
    expect(res.status).toBe(400);
  });

  it('7. POST creates category successfully and returns 201', async () => {
    prismaMock.kategoriBarang.create.mockResolvedValue({ IdKategori: 5, NamaKategori: 'Multimedia' });
    const res = await kategoriCollection.POST(makeRequest({ NamaKategori: 'Multimedia' }));
    expect(res.status).toBe(201);
    const body = await responseBody(res);
    expect(body.IdKategori).toBe(5);
    expect(body.NamaKategori).toBe('Multimedia');
  });

  it('8. POST trims whitespace from NamaKategori before inserting', async () => {
    prismaMock.kategoriBarang.create.mockResolvedValue({ IdKategori: 6, NamaKategori: 'Audio Visual' });
    await kategoriCollection.POST(makeRequest({ NamaKategori: '   Audio Visual   ' }));
    expect(prismaMock.kategoriBarang.create).toHaveBeenCalledWith({
      data: { NamaKategori: 'Audio Visual' },
    });
  });

  it('9. POST handles special characters in NamaKategori', async () => {
    prismaMock.kategoriBarang.create.mockResolvedValue({ IdKategori: 7, NamaKategori: 'Cables & Adapters (VGA/HDMI)' });
    const res = await kategoriCollection.POST(makeRequest({ NamaKategori: 'Cables & Adapters (VGA/HDMI)' }));
    expect(res.status).toBe(201);
  });

  it('10. PUT returns 400 when NamaKategori is missing on update', async () => {
    const res = await kategoriItem.PUT(makeRequest({}), itemParams('3'));
    expect(res.status).toBe(400);
  });

  it('11. PUT returns 400 when NamaKategori is empty string on update', async () => {
    const res = await kategoriItem.PUT(makeRequest({ NamaKategori: '' }), itemParams('3'));
    expect(res.status).toBe(400);
  });

  it('12. PUT returns 400 when NamaKategori has only whitespace on update', async () => {
    const res = await kategoriItem.PUT(makeRequest({ NamaKategori: '   ' }), itemParams('3'));
    expect(res.status).toBe(400);
  });

  it('13. PUT updates category successfully and returns 200', async () => {
    prismaMock.kategoriBarang.update.mockResolvedValue({ IdKategori: 3, NamaKategori: 'Hardware & IT' });
    const res = await kategoriItem.PUT(makeRequest({ NamaKategori: 'Hardware & IT' }), itemParams('3'));
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.NamaKategori).toBe('Hardware & IT');
  });

  it('14. PUT trims whitespace on update', async () => {
    prismaMock.kategoriBarang.update.mockResolvedValue({ IdKategori: 3, NamaKategori: 'Robotics' });
    await kategoriItem.PUT(makeRequest({ NamaKategori: '   Robotics   ' }), itemParams('3'));
    expect(prismaMock.kategoriBarang.update).toHaveBeenCalledWith({
      where: { IdKategori: 3 },
      data: { NamaKategori: 'Robotics' },
    });
  });

  it('15. PUT targets the correct IdKategori from route params', async () => {
    prismaMock.kategoriBarang.update.mockResolvedValue({ IdKategori: 9 });
    await kategoriItem.PUT(makeRequest({ NamaKategori: 'Network' }), itemParams('9'));
    expect(prismaMock.kategoriBarang.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { IdKategori: 9 },
    }));
  });

  it('16. DELETE returns 400 when category still has associated barang', async () => {
    prismaMock.barang.findFirst.mockResolvedValue({ IdBarang: 1, IdKategori: 3 });
    const res = await kategoriItem.DELETE(makeRequest({}), itemParams('3'));
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/masih memiliki barang/i);
  });

  it('17. DELETE blocks deletion and does not call prisma delete when barang exists', async () => {
    prismaMock.barang.findFirst.mockResolvedValue({ IdBarang: 1, IdKategori: 3 });
    await kategoriItem.DELETE(makeRequest({}), itemParams('3'));
    expect(prismaMock.kategoriBarang.delete).not.toHaveBeenCalled();
  });

  it('18. DELETE removes category successfully when no barang are linked', async () => {
    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.kategoriBarang.delete.mockResolvedValue({ IdKategori: 3 });
    const res = await kategoriItem.DELETE(makeRequest({}), itemParams('3'));
    expect(res.status).toBe(200);
    expect(prismaMock.kategoriBarang.delete).toHaveBeenCalledWith({ where: { IdKategori: 3 } });
  });

  it('19. DELETE targets the correct IdKategori from route params', async () => {
    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.kategoriBarang.delete.mockResolvedValue({ IdKategori: 12 });
    await kategoriItem.DELETE(makeRequest({}), itemParams('12'));
    expect(prismaMock.kategoriBarang.delete).toHaveBeenCalledWith({ where: { IdKategori: 12 } });
  });

  it('20. DELETE returns 200 with success confirmation message', async () => {
    prismaMock.barang.findFirst.mockResolvedValue(null);
    prismaMock.kategoriBarang.delete.mockResolvedValue({ IdKategori: 3 });
    const res = await kategoriItem.DELETE(makeRequest({}), itemParams('3'));
    const body = await responseBody(res);
    expect(body.Message).toMatch(/berhasil dihapus/i);
  });
});
