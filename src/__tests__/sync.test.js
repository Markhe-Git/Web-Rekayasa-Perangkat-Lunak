import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as syncRoute from '@/app/api/sync/route';

const prismaMock = vi.hoisted(() => ({
  repositories: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  commits: {
    findMany: vi.fn(),
    createMany: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const makeRequest = (body) => ({
  json: vi.fn().mockResolvedValue(body),
});

const responseBody = (response) => response.json();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Sync Repositories & Commits API Suite (15 Tests)', () => {
  it('1. GET returns all repositories with commits ordered by CommittedAt desc', async () => {
    prismaMock.repositories.findMany.mockResolvedValue([
      { RepositoryId: 101, Name: 'pintika-web', Commits: [{ Sha: 'abc123' }] },
    ]);
    const res = await syncRoute.GET();
    expect(res.status).toBe(200);
    const body = await responseBody(res);
    expect(body.length).toBe(1);
    expect(prismaMock.repositories.findMany).toHaveBeenCalledWith({
      include: { Commits: { orderBy: { CommittedAt: 'desc' } } },
    });
  });

  it('2. GET returns empty array when no repositories exist', async () => {
    prismaMock.repositories.findMany.mockResolvedValue([]);
    const res = await syncRoute.GET();
    const body = await responseBody(res);
    expect(body).toEqual([]);
  });

  it('3. POST returns 400 when RepositoryId is missing', async () => {
    const res = await syncRoute.POST(makeRequest({ Name: 'pintika' }));
    expect(res.status).toBe(400);
    const body = await responseBody(res);
    expect(body.Error).toMatch(/RepositoryId wajib diisi/i);
  });

  it('4. POST returns 400 when RepositoryId is null or empty', async () => {
    const res = await syncRoute.POST(makeRequest({ RepositoryId: null }));
    expect(res.status).toBe(400);
  });

  it('5. POST creates repository with defaults when repo does not exist', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101, Name: 'himtika/pintika-web' });

    const res = await syncRoute.POST(makeRequest({ RepositoryId: 101 }));
    expect(res.status).toBe(200);
    expect(prismaMock.repositories.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { RepositoryId: 101 },
      create: expect.objectContaining({ RepositoryId: 101, Name: 'himtika/pintika-web' }),
    }));
  });

  it('6. POST uses custom Name and Url when provided', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 102 });
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 102, Name: 'custom/repo' });

    await syncRoute.POST(makeRequest({
      RepositoryId: 102, Name: 'custom/repo', Url: 'https://github.com/custom/repo',
    }));
    expect(prismaMock.repositories.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ Name: 'custom/repo', Url: 'https://github.com/custom/repo' }),
    }));
  });

  it('7. POST updates existing repository Name and Url on upsert', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101 });

    await syncRoute.POST(makeRequest({
      RepositoryId: 101, Name: 'updated-name', Url: 'https://github.com/updated-url',
    }));
    expect(prismaMock.repositories.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({ Name: 'updated-name', Url: 'https://github.com/updated-url' }),
    }));
  });

  it('8. POST updates LastSyncedAt date on upsert', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101 });

    await syncRoute.POST(makeRequest({ RepositoryId: 101 }));
    expect(prismaMock.repositories.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ LastSyncedAt: expect.any(Date) }),
    }));
  });

  it('9. POST adds new commits when Commits array has new SHAs', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.commits.findMany.mockResolvedValue([]);
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101 });

    await syncRoute.POST(makeRequest({
      RepositoryId: 101,
      Commits: [{ Sha: 'sha1', Message: 'commit 1', Author: 'Dev' }],
    }));

    expect(prismaMock.commits.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ Sha: 'sha1', Message: 'commit 1', Author: 'Dev' })],
      skipDuplicates: true,
    });
  });

  it('10. POST skips commits with existing SHAs to prevent duplication', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.commits.findMany.mockResolvedValue([{ Sha: 'sha1' }]);
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101 });

    await syncRoute.POST(makeRequest({
      RepositoryId: 101,
      Commits: [{ Sha: 'sha1', Message: 'existing' }, { Sha: 'sha2', Message: 'new' }],
    }));

    expect(prismaMock.commits.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ Sha: 'sha2' })],
      skipDuplicates: true,
    });
  });

  it('11. POST ignores items in Commits array without a valid Sha', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.commits.findMany.mockResolvedValue([]);
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101 });

    await syncRoute.POST(makeRequest({
      RepositoryId: 101,
      Commits: [{ Sha: '', Message: 'no sha' }, { Message: 'undefined sha' }],
    }));

    expect(prismaMock.commits.createMany).not.toHaveBeenCalled();
  });

  it('12. POST sets default Author to Unknown when author is omitted', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.commits.findMany.mockResolvedValue([]);
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101 });

    await syncRoute.POST(makeRequest({
      RepositoryId: 101,
      Commits: [{ Sha: 'sha_no_author', Message: 'test' }],
    }));

    expect(prismaMock.commits.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ Author: 'Unknown' })],
      skipDuplicates: true,
    });
  });

  it('13. POST parses committed date string to Date instance when provided', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.commits.findMany.mockResolvedValue([]);
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101 });

    await syncRoute.POST(makeRequest({
      RepositoryId: 101,
      Commits: [{ Sha: 'sha_date', CommittedAt: '2026-11-01T10:00:00Z' }],
    }));

    expect(prismaMock.commits.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ CommittedAt: expect.any(Date) })],
      skipDuplicates: true,
    });
  });

  it('14. POST returns full updated repository with included commits', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.repositories.findUnique.mockResolvedValue({
      RepositoryId: 101, Name: 'pintika', Commits: [{ Sha: 'sha1' }],
    });

    const res = await syncRoute.POST(makeRequest({ RepositoryId: 101 }));
    const body = await responseBody(res);
    expect(body.RepositoryId).toBe(101);
    expect(body.Commits.length).toBe(1);
  });

  it('15. POST handles empty Commits array without throwing error', async () => {
    prismaMock.repositories.upsert.mockResolvedValue({ RepositoryId: 101 });
    prismaMock.repositories.findUnique.mockResolvedValue({ RepositoryId: 101 });

    const res = await syncRoute.POST(makeRequest({ RepositoryId: 101, Commits: [] }));
    expect(res.status).toBe(200);
    expect(prismaMock.commits.createMany).not.toHaveBeenCalled();
  });
});
