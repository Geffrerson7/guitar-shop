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
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
    unstubEnvs: true,
  },
});
