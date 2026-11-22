import "server-only";
import { prisma } from "@/lib/prisma";
import type { ProductoCarrito } from "@/features/carrito/calculo";
import { MAX_LINEAS } from "@/features/carrito/reducer";

/*
 * Resolución del carrito en el servidor (Fase 10). El navegador solo conoce
 * ids y cantidades; nombre, precio, imagen y stock salen de aquí, de la base
 * de datos y sin caché (el stock tiene que ser el de ahora).
 */

/**
 * `?ids=3,1,12` → `[1, 3, 12]`. Ausente o vacío → `[]`. Cualquier valor que no
 * sea un id válido, o más de `MAX_LINEAS` ids, → `null` (petición inválida).
 */
export function parseIdsCarrito(valor: string | null): number[] | null {
  if (valor === null || valor.trim() === "") return [];

  const partes = valor.split(",");
  if (partes.length > MAX_LINEAS) return null;

  const ids = new Set<number>();
  for (const parte of partes) {
    if (!/^[1-9]\d{0,15}$/.test(parte)) return null;
    const id = Number(parte);
    if (!Number.isSafeInteger(id)) return null;
    ids.add(id);
  }
  return [...ids].sort((a, b) => a - b);
}

/**
 * Productos **publicados** de entre los pedidos. Los que falten en la
 * respuesta (inactivos, eliminados o inexistentes) son los que el carrito
 * marca como no disponibles.
 */
export async function getProductosCarrito(
  ids: readonly number[],
): Promise<ProductoCarrito[]> {
  if (ids.length === 0) return [];

  return prisma.producto.findMany({
    where: { id: { in: [...ids] }, activo: true },
    orderBy: { id: "asc" },
    select: {
      id: true,
      nombre: true,
      marca: true,
      precioCentimos: true,
      imagen: true,
      stock: true,
    },
  });
}
