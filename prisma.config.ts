import { defineConfig } from "prisma/config";

/*
 * Configuración del CLI de Prisma (migrate, db seed, studio, generate).
 * El CLI no carga `.env` solo; se usa el cargador nativo de Node. En CI y en
 * Vercel no hay `.env`: las variables llegan del entorno.
 */
try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan las variables del entorno.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Las migraciones usan la conexión directa (Neon no admite DDL a través
    // del pooler en modo transacción); en local basta con DATABASE_URL.
    // `generate` no se conecta, por eso puede faltar en `pnpm install`.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
