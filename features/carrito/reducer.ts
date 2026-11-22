/*
 * Estado del carrito (Fase 10) como función pura. Sin dependencias: lo usan el
 * almacén de cliente (store.ts) y las pruebas.
 *
 * El carrito solo guarda **qué** producto y **cuántas** unidades. Nombre,
 * precio, imagen y stock se resuelven siempre en el servidor (lib/carrito.ts):
 * nada de lo que viva en el navegador se da por bueno al calcular importes.
 */

export interface LineaCarrito {
  productoId: number;
  cantidad: number;
}

export type Carrito = readonly LineaCarrito[];

/** Unidades máximas por línea, con independencia del stock. */
export const MAX_POR_LINEA = 99;

/** Productos distintos como máximo; acota también lo que se pide al servidor. */
export const MAX_LINEAS = 50;

export const CARRITO_VACIO: Carrito = Object.freeze([]);

export type AccionCarrito =
  | {
      tipo: "agregar";
      productoId: number;
      /** Unidades a sumar (1 por defecto). */
      cantidad?: number;
      /** Tope de la línea: el stock conocido en el momento de añadir. */
      maximo?: number;
    }
  | {
      tipo: "cambiarCantidad";
      productoId: number;
      cantidad: number;
      maximo?: number;
    }
  | { tipo: "quitar"; productoId: number }
  | { tipo: "vaciar" };

/** Id de producto aceptable: entero seguro positivo. */
export function esIdProducto(valor: unknown): valor is number {
  return Number.isSafeInteger(valor) && (valor as number) > 0;
}

function tope(maximo: number | undefined): number {
  if (maximo === undefined || !Number.isFinite(maximo)) return MAX_POR_LINEA;
  return Math.min(Math.floor(maximo), MAX_POR_LINEA);
}

/**
 * Aplica una acción. Devuelve **el mismo array** si la acción no cambia nada
 * (id inválido, cantidad no entera, stock agotado…), para que el almacén no
 * escriba ni notifique en vano.
 */
export function reducirCarrito(
  carrito: Carrito,
  accion: AccionCarrito,
): Carrito {
  switch (accion.tipo) {
    case "agregar": {
      const sumar = accion.cantidad ?? 1;
      if (!esIdProducto(accion.productoId)) return carrito;
      if (!Number.isInteger(sumar) || sumar < 1) return carrito;

      const maximo = tope(accion.maximo);
      const indice = carrito.findIndex(
        (linea) => linea.productoId === accion.productoId,
      );

      if (indice === -1) {
        if (maximo < 1 || carrito.length >= MAX_LINEAS) return carrito;
        return [
          ...carrito,
          { productoId: accion.productoId, cantidad: Math.min(sumar, maximo) },
        ];
      }

      const actual = carrito[indice]!.cantidad;
      const cantidad = Math.min(actual + sumar, maximo);
      if (cantidad <= actual) return carrito;
      return carrito.map((linea, i) =>
        i === indice ? { ...linea, cantidad } : linea,
      );
    }

    case "cambiarCantidad": {
      if (!Number.isInteger(accion.cantidad)) return carrito;
      const indice = carrito.findIndex(
        (linea) => linea.productoId === accion.productoId,
      );
      if (indice === -1) return carrito;

      // Bajar a 0 no borra la línea: quitar es una acción explícita.
      const cantidad = Math.max(
        1,
        Math.min(accion.cantidad, tope(accion.maximo)),
      );
      if (cantidad === carrito[indice]!.cantidad) return carrito;
      return carrito.map((linea, i) =>
        i === indice ? { ...linea, cantidad } : linea,
      );
    }

    case "quitar": {
      const restantes = carrito.filter(
        (linea) => linea.productoId !== accion.productoId,
      );
      return restantes.length === carrito.length ? carrito : restantes;
    }

    case "vaciar":
      return carrito.length === 0 ? carrito : CARRITO_VACIO;
  }
}

/** Unidades totales (lo que muestra el contador del header). */
export function contarUnidades(carrito: Carrito): number {
  return carrito.reduce((total, linea) => total + linea.cantidad, 0);
}
