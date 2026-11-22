import type { Carrito } from "./reducer";

/*
 * Cálculo de líneas y totales del carrito (Fase 10), puro y sin dependencias.
 *
 * Recibe las cantidades del navegador y los productos **tal como los devuelve
 * el servidor** (`GET /api/carrito`); los precios salen siempre de ahí. El
 * checkout de la Fase 11 vuelve a calcularlo todo en el servidor antes de
 * crear el pedido: esto solo es lo que se enseña.
 */

/** Producto resuelto en el servidor para el carrito. */
export interface ProductoCarrito {
  id: number;
  nombre: string;
  marca: string;
  precioCentimos: number;
  imagen: string;
  /** Unidades disponibles ahora mismo. */
  stock: number;
}

export type EstadoLinea =
  /** Aún no ha llegado la respuesta del servidor para este producto. */
  | "cargando"
  | "disponible"
  /** Se pidieron más unidades de las que quedan: se cuentan las que hay. */
  | "stock-insuficiente"
  | "agotado"
  /** Inactivo, eliminado o un id que nunca existió. */
  | "no-disponible";

export interface LineaResuelta {
  productoId: number;
  /** Lo que hay guardado en el navegador. */
  cantidad: number;
  estado: EstadoLinea;
  producto: ProductoCarrito | null;
  /** Unidades que entran en el total (0 si la línea no se puede comprar). */
  cantidadFacturable: number;
  subtotalCentimos: number;
}

export interface CarritoResuelto {
  lineas: LineaResuelta[];
  /** Unidades que entran en el total. */
  unidades: number;
  totalCentimos: number;
  /** Alguna línea pendiente de respuesta del servidor. */
  cargando: boolean;
}

/**
 * `productos`: id → producto, `null` si el servidor respondió que no está a
 * la venta, ausente si todavía no se le ha preguntado.
 */
export function calcularCarrito(
  carrito: Carrito,
  productos: ReadonlyMap<number, ProductoCarrito | null>,
): CarritoResuelto {
  let unidades = 0;
  let totalCentimos = 0;
  let cargando = false;

  const lineas = carrito.map(({ productoId, cantidad }): LineaResuelta => {
    const producto = productos.get(productoId);

    if (producto === undefined) {
      cargando = true;
      return linea(productoId, cantidad, "cargando", null, 0);
    }
    if (producto === null) {
      return linea(productoId, cantidad, "no-disponible", null, 0);
    }

    const stock = Math.max(0, Math.floor(producto.stock));
    if (stock === 0) {
      return linea(productoId, cantidad, "agotado", producto, 0);
    }

    const facturable = Math.min(cantidad, stock);
    unidades += facturable;
    totalCentimos += facturable * producto.precioCentimos;
    return linea(
      productoId,
      cantidad,
      facturable < cantidad ? "stock-insuficiente" : "disponible",
      producto,
      facturable,
    );
  });

  return { lineas, unidades, totalCentimos, cargando };
}

function linea(
  productoId: number,
  cantidad: number,
  estado: EstadoLinea,
  producto: ProductoCarrito | null,
  cantidadFacturable: number,
): LineaResuelta {
  return {
    productoId,
    cantidad,
    estado,
    producto,
    cantidadFacturable,
    subtotalCentimos: producto
      ? cantidadFacturable * producto.precioCentimos
      : 0,
  };
}
