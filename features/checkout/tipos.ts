/*
 * Contrato entre el formulario de checkout (cliente) y su Server Action
 * (Fase 11). Sin dependencias: el validador con Zod vive en el servidor
 * (lib/validaciones/checkout.ts) y no llega al navegador.
 */

/** Campos del formulario, en el orden en que se muestran. */
export const CAMPOS_CHECKOUT = [
  "nombre",
  "email",
  "telefono",
  "direccion",
  "codigoPostal",
  "localidad",
  "provincia",
  "consentimiento",
] as const;

export type CampoCheckout = (typeof CAMPOS_CHECKOUT)[number];

export type ErroresCheckout = Partial<Record<CampoCheckout, string>>;

/** Una línea del carrito que impide crear el pedido. */
export interface ProblemaLinea {
  productoId: number;
  /** `null` si el producto no existe. */
  nombre: string | null;
  motivo: "no-disponible" | "agotado" | "stock-insuficiente";
  /** Unidades que quedan ahora mismo (0 si no está a la venta). */
  disponibles: number;
}

export type EstadoCheckout =
  | { estado: "inicial" }
  | { estado: "error-campos"; errores: ErroresCheckout }
  | { estado: "error-stock"; problemas: ProblemaLinea[] }
  | { estado: "error"; mensaje: string }
  | { estado: "ok"; codigo: string };

export const ESTADO_INICIAL: EstadoCheckout = { estado: "inicial" };
