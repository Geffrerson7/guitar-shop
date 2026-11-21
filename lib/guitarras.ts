import "server-only";
import { unstable_cache } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import {
  construirOrden,
  construirWhere,
  escaparLike,
  paginar,
  terminosBusqueda,
} from "@/lib/catalogo-consulta";
import { prisma } from "@/lib/prisma";
import { TAMANO_PAGINA, type FiltrosCatalogo } from "@/lib/catalogo-url";
import type { Categoria, Guitarra } from "@/types/guitarra";

/*
 * Capa de acceso a datos (ARQ-01), sobre Prisma + PostgreSQL desde la Fase 8.
 * Es el único módulo que consulta productos; las páginas no saben de dónde
 * vienen los datos.
 *
 * Caché: cada lectura se guarda en la Data Cache de Next.js con etiquetas, sin
 * caducidad por tiempo. Las páginas se prerenderizan en el build y se
 * regeneran cuando el CRUD del panel (Fase 13) llama a
 * `revalidateTag(etiqueta, "max")` con la etiqueta de lo que cambió:
 *   - `productos`        → listados (catálogo, búsquedas, marcas, home,
 *                          sitemap) y todo detalle.
 *   - `producto:<id>`    → solo el detalle de ese producto.
 *   - `categorias`       → lista de categorías.
 */

export const cacheTags = {
  productos: "productos",
  producto: (id: number) => `producto:${id}`,
  categorias: "categorias",
} as const;

const seleccion = {
  id: true,
  slug: true,
  nombre: true,
  marca: true,
  precioCentimos: true,
  badge: true,
  imagen: true,
  descripcion: true,
  specs: true,
  categoria: { select: { nombre: true } },
} satisfies Prisma.ProductoSelect;

type FilaProducto = Prisma.ProductoGetPayload<{ select: typeof seleccion }>;

function toGuitarra({ categoria, ...fila }: FilaProducto): Guitarra {
  return { ...fila, categoria: categoria.nombre };
}

/** Productos publicados (`activo`), en el orden editorial del catálogo. */
export const getGuitarras = unstable_cache(
  async (): Promise<Guitarra[]> => {
    const filas = await prisma.producto.findMany({
      where: { activo: true },
      orderBy: { id: "asc" },
      select: seleccion,
    });
    return filas.map(toGuitarra);
  },
  ["guitarras:lista"],
  { tags: [cacheTags.productos] },
);

/** Un producto publicado, o `null` si no existe o está inactivo. */
export async function getGuitarraById(id: number): Promise<Guitarra | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null;

  return unstable_cache(
    async (): Promise<Guitarra | null> => {
      const fila = await prisma.producto.findFirst({
        where: { id, activo: true },
        select: seleccion,
      });
      return fila ? toGuitarra(fila) : null;
    },
    ["guitarras:detalle", String(id)],
    { tags: [cacheTags.productos, cacheTags.producto(id)] },
  )();
}

/** Categorías con al menos un producto publicado, por nombre. */
export const getCategorias = unstable_cache(
  async (): Promise<Categoria[]> => {
    return prisma.categoria.findMany({
      where: { productos: { some: { activo: true } } },
      orderBy: { nombre: "asc" },
      select: { nombre: true, slug: true },
    });
  },
  ["categorias:lista"],
  { tags: [cacheTags.categorias, cacheTags.productos] },
);

/** Marcas con algún producto publicado, para el filtro del catálogo. */
export const getMarcas = unstable_cache(
  async (): Promise<string[]> => {
    const filas = await prisma.producto.findMany({
      where: { activo: true },
      distinct: ["marca"],
      orderBy: { marca: "asc" },
      select: { marca: true },
    });
    return filas.map((fila) => fila.marca);
  },
  ["marcas:lista"],
  { tags: [cacheTags.productos] },
);

export interface ResultadoBusqueda {
  guitarras: Guitarra[];
  /** Productos que cumplen los filtros (todas las páginas). */
  total: number;
  /** Página mostrada: la pedida, acotada a las que existen. */
  pagina: number;
  totalPaginas: number;
}

/**
 * Ids de productos activos cuyo nombre o marca contienen **todas** las
 * palabras buscadas, sin distinguir mayúsculas ni acentos («gíbson» encuentra
 * «Gibson»). Se resuelve en SQL con la extensión `unaccent`; Prisma no tiene
 * un filtro equivalente.
 */
async function idsQueCoinciden(q: string): Promise<number[]> {
  const condiciones = terminosBusqueda(q).map(
    (termino) =>
      Prisma.sql`unaccent("nombre" || ' ' || "marca") ILIKE unaccent(${`%${escaparLike(termino)}%`})`,
  );
  if (condiciones.length === 0) return [];

  const filas = await prisma.$queryRaw<{ id: number }[]>`
    SELECT "id" FROM "Producto"
    WHERE "activo" AND ${Prisma.join(condiciones, " AND ")}`;
  return filas.map((fila) => fila.id);
}

/**
 * Búsqueda, filtros, orden y paginación del catálogo, todo en servidor.
 * Cada combinación de filtros se cachea con la etiqueta `productos`.
 */
export async function buscarGuitarras(
  filtros: FiltrosCatalogo,
): Promise<ResultadoBusqueda> {
  return unstable_cache(
    async (): Promise<ResultadoBusqueda> => {
      const ids = filtros.q ? await idsQueCoinciden(filtros.q) : undefined;
      const where = construirWhere(filtros, ids);

      const total = await prisma.producto.count({ where });
      const { pagina, totalPaginas, skip } = paginar(
        filtros.pagina,
        total,
        TAMANO_PAGINA,
      );

      const filas = await prisma.producto.findMany({
        where,
        orderBy: construirOrden(filtros.orden),
        skip,
        take: TAMANO_PAGINA,
        select: seleccion,
      });

      return { guitarras: filas.map(toGuitarra), total, pagina, totalPaginas };
    },
    ["guitarras:busqueda", JSON.stringify(filtros)],
    { tags: [cacheTags.productos] },
  )();
}
