import prisma from '@/lib/prisma';

export async function GET() {
  const repos = await prisma.repositories.findMany({
    include: {
      Commits: {
        orderBy: { CommittedAt: 'desc' },
      },
    },
  });
  return Response.json(repos);
}

export async function POST(request) {
  const body = await request.json();
  const { RepositoryId, Name, Url, Commits: incomingCommits } = body;

  if (!RepositoryId) {
    return Response.json({ Error: 'RepositoryId wajib diisi.' }, { status: 400 });
  }

  const repo = await prisma.repositories.upsert({
    where: { RepositoryId: Number(RepositoryId) },
    update: {
      Name: Name ?? undefined,
      Url: Url ?? undefined,
      LastSyncedAt: new Date(),
    },
    create: {
      RepositoryId: Number(RepositoryId),
      Name: Name ?? 'himtika/pintika-web',
      Url: Url ?? 'https://github.com/himtika/pintika-web',
      LastSyncedAt: new Date(),
    },
  });

  if (Array.isArray(incomingCommits) && incomingCommits.length > 0) {
    const existing = await prisma.commits.findMany({
      where: { RepositoryId: Number(RepositoryId) },
      select: { Sha: true },
    });
    const existingShas = new Set(existing.map((c) => c.Sha));

    const newCommits = incomingCommits
      .filter((c) => c.Sha && !existingShas.has(c.Sha))
      .map((c) => ({
        RepositoryId: Number(RepositoryId),
        Sha: c.Sha,
        Message: c.Message ?? '',
        Author: c.Author ?? 'Unknown',
        CommittedAt: c.CommittedAt ? new Date(c.CommittedAt) : new Date(),
      }));

    if (newCommits.length > 0) {
      await prisma.commits.createMany({
        data: newCommits,
        skipDuplicates: true,
      });
    }
  }

  await prisma.repositories.update({
    where: { RepositoryId: Number(RepositoryId) },
    data: { LastSyncedAt: new Date() },
  });

  const updatedRepo = await prisma.repositories.findUnique({
    where: { RepositoryId: Number(RepositoryId) },
    include: { Commits: { orderBy: { CommittedAt: 'desc' } } },
  });

  return Response.json(updatedRepo);
}
