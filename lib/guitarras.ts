import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
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
 *   - `productos`        → listados (catálogo, home, sitemap) y todo detalle.
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
