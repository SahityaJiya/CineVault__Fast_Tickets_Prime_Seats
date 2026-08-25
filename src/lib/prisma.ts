import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const rawUrl =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_aFjmE4g1NBqH@ep-polished-tree-axl1tj4x.c-4.us-east-2.aws.neon.tech/neondb?sslmode=verify-full';

// Normalize sslmode query param to verify-full to prevent node-pg deprecation warning
const connectionString = rawUrl.replace('sslmode=require', 'sslmode=verify-full');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 10,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}