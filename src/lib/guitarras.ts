import { guitarras } from "@/data/guitarras";
import type { Categoria, Guitarra } from "@/types/guitarra";

/*
 * Capa de acceso a datos (ARQ-01).
 * Es el único módulo que importa `@/data/guitarras`. Las funciones son
 * asíncronas desde el primer día: en la Fase 8 cambian su implementación
 * (Prisma + PostgreSQL) y las páginas no se tocan.
 */

export async function getGuitarras(): Promise<Guitarra[]> {
  return guitarras;
}

export async function getGuitarraById(id: number): Promise<Guitarra | null> {
  return guitarras.find((guitarra) => guitarra.id === id) ?? null;
}

export async function getCategorias(): Promise<Categoria[]> {
  return [...new Set(guitarras.map((guitarra) => guitarra.categoria))];
}
