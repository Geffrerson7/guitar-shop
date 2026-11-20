import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/env";

/*
 * Cliente único de Prisma. En desarrollo, el HMR de Next.js reevalúa los
 * módulos en cada cambio; sin guardarlo en `globalThis` se abriría un pool de
 * conexiones nuevo cada vez hasta agotar las de PostgreSQL.
 * `server-only` hace fallar el build si un componente de cliente lo importa.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
