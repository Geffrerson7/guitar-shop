import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/*
 * Módulos que solo existen dentro del runtime de Next.js:
 * - `server-only` lanza un error si se importa fuera de un Server Component.
 * - `unstable_cache` necesita la Data Cache de Next.js; en las pruebas se
 *   ejecuta la función sin cachear.
 */
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

afterEach(() => {
  cleanup();
});
