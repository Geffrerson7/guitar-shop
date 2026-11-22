import {
  CARRITO_VACIO,
  esIdProducto,
  MAX_LINEAS,
  MAX_POR_LINEA,
  type Carrito,
  type LineaCarrito,
} from "./reducer";

/*
 * Formato del carrito en `localStorage` (Fase 10).
 *
 * La versión va en la clave y dentro del contenido: un cambio de formato usa
 * una clave nueva (el carrito antiguo se ignora en lugar de malinterpretarse)
 * y un contenido con otra versión bajo esta clave también se descarta.
 *
 * Todo lo que se lee se considera no fiable: lo puede haber escrito otra
 * versión del sitio, una extensión o el propio visitante desde las
 * herramientas de desarrollo. El saneado nunca lanza.
 */

export const VERSION_CARRITO = 1;
export const CLAVE_CARRITO = `voltio-madera:carrito:v${VERSION_CARRITO}`;

interface CarritoGuardado {
  v: typeof VERSION_CARRITO;
  lineas: LineaCarrito[];
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/**
 * Reconstruye un carrito válido a partir de cualquier valor:
 * - otra versión o forma desconocida → carrito vacío;
 * - líneas con id o cantidad inválidos → se descartan;
 * - ids repetidos → se suman (con el tope por línea);
 * - campos extra (un `precio` inyectado, por ejemplo) → se ignoran: solo
 *   sobreviven `productoId` y `cantidad`.
 */
export function sanearCarrito(valor: unknown): Carrito {
  if (!esObjeto(valor) || valor.v !== VERSION_CARRITO) return CARRITO_VACIO;
  if (!Array.isArray(valor.lineas)) return CARRITO_VACIO;

  const cantidades = new Map<number, number>();
  for (const linea of valor.lineas) {
    if (!esObjeto(linea)) continue;
    const { productoId, cantidad } = linea;
    if (!esIdProducto(productoId)) continue;
    if (!Number.isSafeInteger(cantidad) || (cantidad as number) < 1) continue;

    const previa = cantidades.get(productoId);
    if (previa === undefined && cantidades.size >= MAX_LINEAS) continue;
    cantidades.set(
      productoId,
      Math.min((previa ?? 0) + (cantidad as number), MAX_POR_LINEA),
    );
  }

  if (cantidades.size === 0) return CARRITO_VACIO;
  return [...cantidades].map(([productoId, cantidad]) => ({
    productoId,
    cantidad,
  }));
}

/** Texto guardado → carrito. JSON corrupto o ausente → carrito vacío. */
export function leerCarrito(texto: string | null): Carrito {
  if (texto === null) return CARRITO_VACIO;
  try {
    return sanearCarrito(JSON.parse(texto));
  } catch {
    return CARRITO_VACIO;
  }
}

/** Carrito → texto a guardar; `null` si está vacío (se borra la clave). */
export function serializarCarrito(carrito: Carrito): string | null {
  if (carrito.length === 0) return null;
  const guardado: CarritoGuardado = {
    v: VERSION_CARRITO,
    lineas: carrito.map(({ productoId, cantidad }) => ({
      productoId,
      cantidad,
    })),
  };
  return JSON.stringify(guardado);
}
