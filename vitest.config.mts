import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Carga `.env` (DATABASE_URL) para las pruebas de integración de la capa de
// datos. En CI las variables llegan del entorno del workflow.
try {
  process.loadEnvFile();
} catch {
  // Sin .env: las pruebas que necesitan PostgreSQL se omiten.
}

/*
 * Pruebas unitarias: utilidades, capa de datos y componentes síncronos.
 * Los Server Components asíncronos (las páginas) se prueban de extremo a
 * extremo con Playwright (e2e/), porque Vitest no los soporta.
 */
const ignorados = ["node_modules/**", ".next/**", "e2e/**"];

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mismo alias que tsconfig.json: `@/` apunta a la raíz del proyecto.
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL("./", import.meta.url)),
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
    unstubEnvs: true,
    // Las pruebas contra PostgreSQL (`*.db.test.ts`) comparten la base de
    // datos y crean filas temporales (productos activos, pedidos): un archivo
    // contaría las del otro. Van en su propio proyecto, de una en una.
    projects: [
      {
        test: {
          name: "unit",
          include: ["**/*.test.{ts,tsx}"],
          exclude: [...ignorados, "**/*.db.test.ts"],
        },
      },
      {
        test: {
          name: "db",
          include: ["**/*.db.test.ts"],
          exclude: ignorados,
          fileParallelism: false,
        },
      },
    ],
  },
});
