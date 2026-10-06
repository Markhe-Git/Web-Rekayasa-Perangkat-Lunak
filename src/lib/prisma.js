import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const val = rest.join('=').replace(/^["']|["']$/g, '').trim();
          if (key.trim() === 'DATABASE_URL' && !process.env.DATABASE_URL) {
            process.env.DATABASE_URL = val;
          }
        }
      }
    }
  } catch {}
}

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    process.env.DATABASE_URL
      ? {
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
