"use client";

import { useEffect, useState } from "react";
import type { ProductoCarrito } from "./calculo";

/*
 * Productos del carrito resueltos en el servidor (`GET /api/carrito`), pidiendo
 * solo los que faltan (Fase 10). Lo comparten /carrito y /checkout: cambiar
 * una cantidad o quitar una línea no vuelve a la red; un producto nuevo
 * (añadido desde otra pestaña, por ejemplo) sí.
 */

export type ProductosConocidos = ReadonlyMap<number, ProductoCarrito | null>;

export function useProductosCarrito(ids: readonly number[], activo: boolean) {
  const [conocidos, setConocidos] = useState<ProductosConocidos>(
    () => new Map(),
  );
  const [fallo, setFallo] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  const pendientes = ids.filter((id) => !conocidos.has(id)).join(",");

  useEffect(() => {
    if (!activo || pendientes === "") return;
    const controlador = new AbortController();

    fetch(`/api/carrito?ids=${pendientes}`, {
      signal: controlador.signal,
      cache: "no-store",
    })
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return (await respuesta.json()) as { productos: ProductoCarrito[] };
      })
      .then(({ productos }) => {
        setConocidos((previos) => {
          const siguientes = new Map(previos);
          // Lo pedido que no vuelve no está a la venta.
          for (const id of pendientes.split(",")) siguientes.set(+id, null);
          for (const producto of productos) {
            siguientes.set(producto.id, producto);
          }
          return siguientes;
        });
        setFallo(null);
      })
      .catch(() => {
        if (!controlador.signal.aborted) setFallo(pendientes);
      });

    return () => controlador.abort();
  }, [pendientes, activo, intento]);

  return {
    conocidos,
    error: fallo !== null && fallo === pendientes,
    reintentar: () => setIntento((n) => n + 1),
  };
}
