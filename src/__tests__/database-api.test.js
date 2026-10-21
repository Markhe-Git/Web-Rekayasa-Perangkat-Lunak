import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as barangCollection from '@/app/api/barang/route';
import * as barangItem from '@/app/api/barang/[id]/route';
import * as kategoriCollection from '@/app/api/kategori/route';
import * as kategoriItem from '@/app/api/kategori/[id]/route';
import * as usersCollection from '@/app/api/users/route';
import * as userItem from '@/app/api/users/[id]/route';
import * as peminjamanCollection from '@/app/api/peminjaman/route';
import * as peminjamanItem from '@/app/api/peminjaman/[id]/route';
import * as dashboardRoute from '@/app/api/dashboard/route';

const prisma = vi.hoisted(() => ({
  users: {
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  barang: {
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    groupBy: vi.fn(),
  },
  kategoriBarang: {
    count: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  peminjaman: {
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    groupBy: vi.fn(),
  },
  detailPeminjaman: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ default: prisma }));

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
  // Memastikan pencarian dan filter kategori/status diteruskan ke query daftar barang.
  it('lists barang using supplied search filters', async () => {
    prisma.barang.findMany.mockResolvedValue([{ IdBarang: 2 }]);

    const response = await barangCollection.GET(
      makeRequest('http://localhost/api/barang?search=proyektor&kategori=3&status=Tersedia'),
    );

    expect(response.status).toBe(200);
    expect(await responseBody(response)).toEqual([{ IdBarang: 2 }]);
    expect(prisma.barang.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        OR: [{ NamaBarang: { contains: 'proyektor' } }, { KodeInventaris: { contains: 'proyektor' } }],
        IdKategori: 3,
        Status: 'Tersedia',
      },
    }));
  });

  // Memastikan data barang yang tidak valid ditolak dan data valid disimpan dengan nilai bawaan.
  it('rejects invalid barang creation and creates valid barang', async () => {
    const invalid = await barangCollection.POST(makeRequest('http://localhost/api/barang', { NamaBarang: ' ' }));
    expect(invalid.status).toBe(400);
    expect(prisma.barang.create).not.toHaveBeenCalled();

    prisma.barang.findUnique.mockResolvedValue(null);
    prisma.barang.create.mockResolvedValue({ IdBarang: 4, NamaBarang: 'Proyektor' });
    const response = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: '2',
      KodeInventaris: ' INV-01 ',
      NamaBarang: ' Proyektor ',
    }));

    expect(response.status).toBe(201);
    expect(prisma.barang.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        IdKategori: 2,
        KodeInventaris: 'INV-01',
        NamaBarang: 'Proyektor',
        Kondisi: 'Baik',
        Status: 'Tersedia',
      },
    }));
  });

  // Memastikan kode inventaris yang sudah digunakan tidak membuat barang baru.
  it('rejects duplicate inventory codes', async () => {
    prisma.barang.findUnique.mockResolvedValue({ IdBarang: 1 });

    const response = await barangCollection.POST(makeRequest('http://localhost/api/barang', {
      IdKategori: 2, KodeInventaris: 'INV-01', NamaBarang: 'Proyektor',
    }));

    expect(response.status).toBe(409);
    expect(prisma.barang.create).not.toHaveBeenCalled();
  });

  // Memastikan barang dapat dibaca, diperbarui, dan dihapus ketika tidak terkait peminjaman aktif.
  it('retrieves, updates and deletes a barang', async () => {
    prisma.barang.findUnique.mockResolvedValue({ IdBarang: 7 });
    expect((await barangItem.GET(makeRequest('http://localhost/api/barang/7'), itemParams())).status).toBe(200);
    expect(prisma.barang.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { IdBarang: 7 } }));

    prisma.barang.findFirst.mockResolvedValue(null);
    prisma.barang.update.mockResolvedValue({ IdBarang: 7, NamaBarang: 'Kamera' });
    const update = await barangItem.PUT(makeRequest('http://localhost/api/barang/7', { NamaBarang: 'Kamera' }), itemParams());
    expect(update.status).toBe(200);
    expect(prisma.barang.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { IdBarang: 7 },
      data: { NamaBarang: 'Kamera' },
    }));

    prisma.detailPeminjaman.findFirst.mockResolvedValue(null);
    prisma.barang.delete.mockResolvedValue({});
    const deletion = await barangItem.DELETE(makeRequest('http://localhost/api/barang/7'), itemParams());
    expect(deletion.status).toBe(200);
    expect(prisma.barang.delete).toHaveBeenCalledWith({ where: { IdBarang: 7 } });
  });

  // Memastikan barang aktif tidak dapat dihapus dan kode inventaris duplikat tidak dapat dipakai saat pembaruan.
  it('blocks deleting barang with an active loan and duplicate-code updates', async () => {
    prisma.detailPeminjaman.findFirst.mockResolvedValue({ IdBarang: 7 });
    expect((await barangItem.DELETE(makeRequest('http://localhost/api/barang/7'), itemParams())).status).toBe(400);
    expect(prisma.barang.delete).not.toHaveBeenCalled();

    prisma.barang.findFirst.mockResolvedValue({ IdBarang: 8 });
    const response = await barangItem.PUT(makeRequest('http://localhost/api/barang/7', { KodeInventaris: 'INV-08' }), itemParams());
    expect(response.status).toBe(409);
    expect(prisma.barang.update).not.toHaveBeenCalled();
  });
});

describe('Kategori API database operations', () => {
  // Memastikan daftar kategori dapat dibaca, input kosong ditolak, dan kategori valid disimpan.
  it('lists and creates kategori', async () => {
    prisma.kategoriBarang.findMany.mockResolvedValue([{ IdKategori: 1 }]);
    expect(await responseBody(await kategoriCollection.GET())).toEqual([{ IdKategori: 1 }]);

    const invalid = await kategoriCollection.POST(makeRequest('http://localhost/api/kategori', { NamaKategori: ' ' }));
    expect(invalid.status).toBe(400);

    prisma.kategoriBarang.create.mockResolvedValue({ IdKategori: 2, NamaKategori: 'Elektronik' });
    const response = await kategoriCollection.POST(makeRequest('http://localhost/api/kategori', { NamaKategori: ' Elektronik ' }));
    expect(response.status).toBe(201);
    expect(prisma.kategoriBarang.create).toHaveBeenCalledWith({ data: { NamaKategori: 'Elektronik' } });
  });

  // Memastikan kategori dapat diperbarui, tetapi penghapusan ditolak jika masih memiliki barang.
  it('updates kategori and prevents deleting a kategori that has barang', async () => {
    const invalid = await kategoriItem.PUT(makeRequest('http://localhost/api/kategori/3', { NamaKategori: ' ' }), itemParams('3'));
    expect(invalid.status).toBe(400);

    prisma.kategoriBarang.update.mockResolvedValue({ IdKategori: 3, NamaKategori: 'Audio' });
    const update = await kategoriItem.PUT(makeRequest('http://localhost/api/kategori/3', { NamaKategori: ' Audio ' }), itemParams('3'));
    expect(update.status).toBe(200);
    expect(prisma.kategoriBarang.update).toHaveBeenCalledWith({
      where: { IdKategori: 3 },
      data: { NamaKategori: 'Audio' },
    });

    prisma.barang.findFirst.mockResolvedValue({ IdBarang: 10 });
    const deletion = await kategoriItem.DELETE(makeRequest('http://localhost/api/kategori/3'), itemParams('3'));
    expect(deletion.status).toBe(400);
    expect(prisma.kategoriBarang.delete).not.toHaveBeenCalled();
  });

  // Memastikan kategori tanpa barang dapat dihapus dari database.
  it('deletes kategori when it has no barang', async () => {
    prisma.barang.findFirst.mockResolvedValue(null);
    prisma.kategoriBarang.delete.mockResolvedValue({});

    const response = await kategoriItem.DELETE(makeRequest('http://localhost/api/kategori/3'), itemParams('3'));

    expect(response.status).toBe(200);
    expect(prisma.kategoriBarang.delete).toHaveBeenCalledWith({ where: { IdKategori: 3 } });
  });
});

describe('Users API database operations', () => {
  // Memastikan pencarian pengguna bekerja, input wajib divalidasi, dan pengguna valid dapat dibuat.
  it('lists users with search and creates a user', async () => {
    prisma.users.findMany.mockResolvedValue([{ IdUser: 1 }]);
    const list = await usersCollection.GET(makeRequest('http://localhost/api/users?search=andi'));
    expect(await responseBody(list)).toEqual([{ IdUser: 1 }]);
    expect(prisma.users.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { OR: [{ Nama: { contains: 'andi' } }, { Nim: { contains: 'andi' } }, { Email: { contains: 'andi' } }] },
    }));

    const invalid = await usersCollection.POST(makeRequest('http://localhost/api/users', { Nim: '1' }));
    expect(invalid.status).toBe(400);

    prisma.users.findFirst.mockResolvedValue(null);
    prisma.users.create.mockResolvedValue({ IdUser: 2, Role: 'Anggota' });
    const create = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'secret',
    }));
    expect(create.status).toBe(201);
    expect(prisma.users.create).toHaveBeenCalledWith({
      data: { Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'secret', Role: 'Anggota' },
    });
  });

  // Memastikan duplikasi ditolak, pengguna dapat dibaca, dan pembaruan tidak mengubah password yang tidak dikirim.
  it('rejects duplicate users and retrieves/updates a user without replacing an omitted password', async () => {
    prisma.users.findFirst.mockResolvedValue({ IdUser: 1 });
    const duplicate = await usersCollection.POST(makeRequest('http://localhost/api/users', {
      Nim: '123', Nama: 'Andi', Email: 'andi@example.com', Password: 'secret',
    }));
    expect(duplicate.status).toBe(409);

    prisma.users.findUnique.mockResolvedValue({ IdUser: 7, Nama: 'Andi' });
    const get = await userItem.GET(makeRequest('http://localhost/api/users/7'), itemParams());
    expect(get.status).toBe(200);
    expect(prisma.users.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { IdUser: 7 } }));

    prisma.users.findFirst.mockResolvedValue(null);
    prisma.users.update.mockResolvedValue({ IdUser: 7, Nama: 'Andi Baru' });
    const update = await userItem.PUT(makeRequest('http://localhost/api/users/7', {
      Nim: '123', Nama: 'Andi Baru', Email: 'andi@example.com', Role: 'Admin',
    }), itemParams());
    expect(update.status).toBe(200);
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { IdUser: 7 },
      data: { Nim: '123', Nama: 'Andi Baru', Email: 'andi@example.com', Role: 'Admin' },
    });
  });

  // Memastikan pengguna yang memiliki peminjaman tidak dapat dihapus, sedangkan pengguna tanpa peminjaman dapat dihapus.
  it('blocks deleting a user with loan data and deletes an unused user', async () => {
    prisma.peminjaman.findFirst.mockResolvedValue({ IdPeminjaman: 1 });
    expect((await userItem.DELETE(makeRequest('http://localhost/api/users/7'), itemParams())).status).toBe(400);
    expect(prisma.users.delete).not.toHaveBeenCalled();

    prisma.peminjaman.findFirst.mockResolvedValue(null);
    prisma.users.delete.mockResolvedValue({});
    const response = await userItem.DELETE(makeRequest('http://localhost/api/users/7'), itemParams());
    expect(response.status).toBe(200);
    expect(prisma.users.delete).toHaveBeenCalledWith({ where: { IdUser: 7 } });
  });

  // Memastikan API mengembalikan status tidak ditemukan ketika pengguna tidak ada.
  it('returns not found for a missing user', async () => {
    prisma.users.findUnique.mockResolvedValue(null);

    const response = await userItem.GET(makeRequest('http://localhost/api/users/7'), itemParams());

    expect(response.status).toBe(404);
  });
});

describe('Peminjaman API database operations', () => {
  // Memastikan daftar peminjaman difilter berdasarkan status dan ID pengguna.
  it('lists peminjaman using status and user filters', async () => {
    prisma.peminjaman.findMany.mockResolvedValue([{ IdPeminjaman: 5 }]);

    const response = await peminjamanCollection.GET(
      makeRequest('http://localhost/api/peminjaman?status=Pending&userId=4'),
    );

    expect(await responseBody(response)).toEqual([{ IdPeminjaman: 5 }]);
    expect(prisma.peminjaman.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { StatusPeminjaman: 'Pending', IdUser: 4 },
    }));
  });

  // Memastikan input peminjaman divalidasi, barang tidak tersedia ditolak, dan peminjaman valid dibuat berstatus Pending.
  it('validates loan creation, refuses unavailable barang, and creates a pending loan', async () => {
    const invalid = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', { Items: [] }));
    expect(invalid.status).toBe(400);

    prisma.barang.findMany.mockResolvedValue([{ NamaBarang: 'Kamera' }]);
    const unavailable = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: '2', TglPinjam: '2025-01-01', TglRencanaKembali: '2025-01-02', TujuanPinjam: 'Acara', Items: ['8'],
    }));
    expect(unavailable.status).toBe(409);
    expect(prisma.peminjaman.create).not.toHaveBeenCalled();

    prisma.barang.findMany.mockResolvedValue([]);
    prisma.peminjaman.create.mockResolvedValue({ IdPeminjaman: 9, StatusPeminjaman: 'Pending' });
    const create = await peminjamanCollection.POST(makeRequest('http://localhost/api/peminjaman', {
      IdUser: '2', TglPinjam: '2025-01-01', TglRencanaKembali: '2025-01-02', TujuanPinjam: 'Acara', Items: ['8'],
    }));
    expect(create.status).toBe(201);
    expect(prisma.peminjaman.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        IdUser: 2,
        StatusPeminjaman: 'Pending',
        DetailPeminjaman: { createMany: { data: [{ IdBarang: 8 }] } },
      }),
    }));
  });

  // Memastikan detail peminjaman dapat dibaca dan status tidak ditemukan diberikan jika datanya tidak ada.
  it('retrieves a loan and reports when it is missing', async () => {
    prisma.peminjaman.findUnique.mockResolvedValueOnce({ IdPeminjaman: 7 }).mockResolvedValueOnce(null);

    expect((await peminjamanItem.GET(makeRequest('http://localhost/api/peminjaman/7'), itemParams())).status).toBe(200);
    expect((await peminjamanItem.GET(makeRequest('http://localhost/api/peminjaman/7'), itemParams())).status).toBe(404);
  });

  // Memastikan persetujuan memperbarui status barang secara transaksional dan penolakan memperbarui status peminjaman.
  it('approves pending loans transactionally and rejects pending loans', async () => {
    const pending = { StatusPeminjaman: 'Pending', DetailPeminjaman: [{ IdBarang: 8 }] };
    prisma.peminjaman.findUnique.mockResolvedValueOnce(pending).mockResolvedValueOnce({ IdPeminjaman: 7, StatusPeminjaman: 'Approved' });
    prisma.$transaction.mockImplementation(async operations => Promise.all(operations));
    const approve = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', {
      Action: 'Approve', IdAdminApproval: '3', CatatanAdmin: 'OK',
    }), itemParams());
    expect(approve.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.peminjaman.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { IdPeminjaman: 7 },
      data: { StatusPeminjaman: 'Approved', IdAdminApproval: 3, CatatanAdmin: 'OK' },
    }));
    expect(prisma.barang.update).toHaveBeenCalledWith({
      where: { IdBarang: 8 },
      data: { Status: 'Dipinjam' },
    });

    prisma.peminjaman.findUnique.mockResolvedValueOnce(pending).mockResolvedValueOnce({ IdPeminjaman: 7, StatusPeminjaman: 'Rejected' });
    const reject = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', {
      Action: 'Reject', IdAdminApproval: '3', CatatanAdmin: 'Tidak tersedia',
    }), itemParams());
    expect(reject.status).toBe(200);
    expect(prisma.peminjaman.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { StatusPeminjaman: 'Rejected', IdAdminApproval: 3, CatatanAdmin: 'Tidak tersedia' },
    }));
  });

  // Memastikan penyelesaian peminjaman mengembalikan barang menjadi tersedia dan menyimpan catatan kondisi.
  it('completes an approved loan and returns barang to available status', async () => {
    const approved = { StatusPeminjaman: 'Approved', DetailPeminjaman: [{ IdBarang: 8 }] };
    prisma.peminjaman.findUnique.mockResolvedValueOnce(approved).mockResolvedValueOnce({ IdPeminjaman: 7, StatusPeminjaman: 'Completed' });
    prisma.$transaction.mockImplementation(async operations => Promise.all(operations));
    prisma.detailPeminjaman.update.mockResolvedValue({});

    const response = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', {
      Action: 'Complete',
      CatatanKondisiKembali: { 12: 'Baik' },
    }), itemParams());

    expect(response.status).toBe(200);
    expect(prisma.barang.update).toHaveBeenCalledWith({
      where: { IdBarang: 8 },
      data: { Status: 'Tersedia' },
    });
    expect(prisma.detailPeminjaman.update).toHaveBeenCalledWith({
      where: { IdDetail: 12 },
      data: { CatatanKondisiKembali: 'Baik' },
    });
  });

  // Memastikan peminjaman Pending dapat dibatalkan dan aksi yang tidak dikenal ditolak.
  it('cancels a pending loan and rejects invalid loan actions', async () => {
    prisma.peminjaman.findUnique.mockResolvedValueOnce({
      StatusPeminjaman: 'Pending', DetailPeminjaman: [],
    }).mockResolvedValueOnce({ IdPeminjaman: 7, StatusPeminjaman: 'Cancelled' });
    const cancel = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', { Action: 'Cancel' }), itemParams());
    expect(cancel.status).toBe(200);
    expect(prisma.peminjaman.update).toHaveBeenCalledWith({
      where: { IdPeminjaman: 7 },
      data: { StatusPeminjaman: 'Cancelled' },
    });

    prisma.peminjaman.findUnique.mockResolvedValueOnce({ StatusPeminjaman: 'Pending', DetailPeminjaman: [] });
    const invalid = await peminjamanItem.PUT(makeRequest('http://localhost/api/peminjaman/7', { Action: 'Archive' }), itemParams());
    expect(invalid.status).toBe(400);
  });

  // Memastikan hanya peminjaman Pending yang dapat dihapus serta menangani data yang tidak ditemukan.
  it('deletes only pending loans', async () => {
    prisma.peminjaman.findUnique.mockResolvedValueOnce(null);
    expect((await peminjamanItem.DELETE(makeRequest('http://localhost/api/peminjaman/7'), itemParams())).status).toBe(404);

    prisma.peminjaman.findUnique.mockResolvedValueOnce({ StatusPeminjaman: 'Approved' });
    expect((await peminjamanItem.DELETE(makeRequest('http://localhost/api/peminjaman/7'), itemParams())).status).toBe(400);

    prisma.peminjaman.findUnique.mockResolvedValueOnce({ StatusPeminjaman: 'Pending' });
    prisma.peminjaman.delete.mockResolvedValue({});
    const deletion = await peminjamanItem.DELETE(makeRequest('http://localhost/api/peminjaman/7'), itemParams());
    expect(deletion.status).toBe(200);
    expect(prisma.peminjaman.delete).toHaveBeenCalledWith({ where: { IdPeminjaman: 7 } });
  });
});

describe('Dashboard database operations', () => {
  // Memastikan ringkasan dashboard menggabungkan hitungan, rekap status, dan peminjaman terbaru.
  it('aggregates database counts and recent loan records', async () => {
    prisma.users.count.mockResolvedValue(4);
    prisma.barang.count.mockResolvedValue(8);
    prisma.kategoriBarang.count.mockResolvedValue(2);
    prisma.peminjaman.groupBy.mockResolvedValue([{ StatusPeminjaman: 'Pending', _count: { StatusPeminjaman: 3 } }]);
    prisma.barang.groupBy.mockResolvedValue([{ Status: 'Tersedia', _count: { Status: 5 } }]);
    prisma.peminjaman.findMany.mockResolvedValue([{ IdPeminjaman: 1 }]);

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

  // Memastikan kegagalan query database menghasilkan respons error dan dicatat ke console.
  it('returns an error response when a dashboard query fails', async () => {
    const error = new Error('Database tidak tersedia');
    prisma.users.count.mockRejectedValue(error);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await dashboardRoute.GET();

    expect(response.status).toBe(500);
    expect(await responseBody(response)).toMatchObject({ Error: 'Database tidak tersedia' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
