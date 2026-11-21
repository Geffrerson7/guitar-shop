import type { Prisma } from "@/generated/prisma/client";
import type { FiltrosCatalogo, Orden } from "@/lib/catalogo-url";

/*
 * Traducción pura de los filtros del catálogo a argumentos de Prisma
 * (Fase 9). Sin acceso a la base de datos, para poder probarla aislada; la
 * ejecuta `buscarGuitarras` en lib/guitarras.ts.
 */

/** Términos de búsqueda: hasta 5 palabras, sin vacíos. */
export function terminosBusqueda(q: string): string[] {
  return q.split(/\s+/).filter(Boolean).slice(0, 5);
}

/**
 * Escapa los comodines de LIKE (`%`, `_` y la barra invertida) para que el
 * texto del visitante se busque literalmente.
 */
export function escaparLike(termino: string): string {
  return termino.replace(/[\\%_]/g, "\\$&");
}

/**
 * Condiciones de la consulta. `idsBusqueda` son los productos que coinciden
 * con el texto buscado (la búsqueda sin acentos se resuelve en SQL con
 * `unaccent`, que Prisma no expresa); si se pasa, restringe el resultado.
 */
export function construirWhere(
  filtros: FiltrosCatalogo,
  idsBusqueda?: number[],
): Prisma.ProductoWhereInput {
  const where: Prisma.ProductoWhereInput = { activo: true };

  if (idsBusqueda !== undefined) where.id = { in: idsBusqueda };
  if (filtros.categoria) where.categoria = { slug: filtros.categoria };
  if (filtros.marca) where.marca = filtros.marca;

  if (filtros.precioMin !== undefined || filtros.precioMax !== undefined) {
    where.precioCentimos = {
      ...(filtros.precioMin !== undefined
        ? { gte: filtros.precioMin * 100 }
        : {}),
      ...(filtros.precioMax !== undefined
        ? { lte: filtros.precioMax * 100 }
        : {}),
    };
  }

  return where;
}

/**
 * Orden de los resultados. Siempre termina en `id` para que la paginación
 * sea determinista aunque dos productos empaten (mismo precio, por ejemplo).
 */
export function construirOrden(
  orden: Orden,
): Prisma.ProductoOrderByWithRelationInput[] {
  const desempate = { id: "asc" } as const;

  switch (orden) {
    case "precio-asc":
      return [{ precioCentimos: "asc" }, desempate];
    case "precio-desc":
      return [{ precioCentimos: "desc" }, desempate];
    case "nombre":
      return [{ nombre: "asc" }, desempate];
    case "novedad":
      return [{ creadoEn: "desc" }, { id: "desc" }];
    case "destacados":
      return [desempate];
  }
}

/** Página efectiva (acotada a las que existen) y desplazamiento. */
export function paginar(
  paginaPedida: number,
  total: number,
  tamano: number,
): { pagina: number; totalPaginas: number; skip: number } {
  const totalPaginas = Math.max(1, Math.ceil(total / tamano));
  const pagina = Math.min(Math.max(1, paginaPedida), totalPaginas);
  return { pagina, totalPaginas, skip: (pagina - 1) * tamano };
}
