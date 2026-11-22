import type { ProblemaLinea } from "@/features/checkout/tipos";

/*
 * Cálculo de un pedido (Fase 11), puro y sin dependencias: decide si las
 * líneas pedidas se pueden servir con los productos **tal como están en la
 * base de datos** y calcula el total. Ningún importe sale del cliente.
 *
 * Lo usa la transacción de lib/pedidos.ts después de bloquear las filas de
 * los productos, así que el stock que recibe es el definitivo.
 */

/** Producto leído (y bloqueado) dentro de la transacción. */
export interface ProductoPedido {
  id: number;
  nombre: string;
  marca: string;
  precioCentimos: number;
  stock: number;
  activo: boolean;
}

export interface LineaPedida {
  productoId: number;
  cantidad: number;
}

/** Línea lista para guardar, con nombre, marca y precio copiados. */
export interface ItemPedido {
  productoId: number;
  nombre: string;
  marca: string;
  precioUnitarioCentimos: number;
  cantidad: number;
}

export type CalculoPedido =
  | { ok: true; items: ItemPedido[]; totalCentimos: number }
  | { ok: false; problemas: ProblemaLinea[] };

export function calcularPedido(
  lineas: readonly LineaPedida[],
  productos: readonly ProductoPedido[],
): CalculoPedido {
  const porId = new Map(productos.map((p) => [p.id, p]));
  const items: ItemPedido[] = [];
  const problemas: ProblemaLinea[] = [];
  let totalCentimos = 0;

  for (const { productoId, cantidad } of lineas) {
    const producto = porId.get(productoId);

    if (!producto || !producto.activo) {
      problemas.push({
        productoId,
        nombre: producto?.nombre ?? null,
        motivo: "no-disponible",
        disponibles: 0,
      });
      continue;
    }
    if (producto.stock < cantidad) {
      const disponibles = Math.max(0, producto.stock);
      problemas.push({
        productoId,
        nombre: producto.nombre,
        motivo: disponibles === 0 ? "agotado" : "stock-insuficiente",
        disponibles,
      });
      continue;
    }

    items.push({
      productoId,
      nombre: producto.nombre,
      marca: producto.marca,
      precioUnitarioCentimos: producto.precioCentimos,
      cantidad,
    });
    totalCentimos += producto.precioCentimos * cantidad;
  }

  if (problemas.length > 0) return { ok: false, problemas };
  return { ok: true, items, totalCentimos };
}

/*
 * Código público del pedido: «VM-» y 16 caracteres del alfabeto de Crockford
 * (sin I, L, O ni U, que se confunden al dictarlo) en grupos de cuatro.
 * 80 bits aleatorios: no es secuencial ni se puede adivinar, y es lo único que
 * da acceso a la página de confirmación.
 */
const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const PATRON_CODIGO = /^VM-[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/;

export function generarCodigoPedido(
  aleatorio: (bytes: Uint8Array) => Uint8Array = (bytes) =>
    crypto.getRandomValues(bytes),
): string {
  // 16 caracteres × 5 bits = 80 bits; un byte por carácter, usando sus 5 bits
  // bajos (256 es múltiplo de 32: sin sesgo).
  const bytes = aleatorio(new Uint8Array(16));
  let texto = "";
  for (const byte of bytes) texto += ALFABETO[byte & 31];
  return `VM-${texto.slice(0, 4)}-${texto.slice(4, 8)}-${texto.slice(8, 12)}-${texto.slice(12, 16)}`;
}

export function esCodigoPedido(valor: string): boolean {
  return PATRON_CODIGO.test(valor);
}

/** «ana.lopez@example.com» → «an•••@example.com» (confirmación de pedido). */
export function enmascararEmail(email: string): string {
  const arroba = email.lastIndexOf("@");
  if (arroba < 1) return "•••";
  return `${email.slice(0, Math.min(2, arroba))}•••${email.slice(arroba)}`;
}
