"use server";

import { headers } from "next/headers";
import { updateTag } from "next/cache";
import type { EstadoCheckout } from "@/features/checkout/tipos";
import { cacheTags } from "@/lib/guitarras";
import { crearLimitador } from "@/lib/limite-frecuencia";
import { crearPedido } from "@/lib/pedidos";
import { validarCheckout } from "@/lib/validaciones/checkout";

/*
 * Server Action del checkout (Fase 11).
 *
 * Todo lo que llega del navegador se vuelve a validar; de las líneas solo se
 * usan id y cantidad, y el total lo calcula la transacción de lib/pedidos.ts
 * con los precios de la base de datos. Next.js comprueba el origen de la
 * petición (protección CSRF de las Server Actions).
 */

/** Pedidos por cliente y ventana. Solo cuentan los envíos válidos. */
const limitador = crearLimitador({ maximo: 5, ventanaMs: 10 * 60_000 });

/** IP del cliente según el proxy (Vercel fija `x-forwarded-for`). */
async function ipCliente(): Promise<string> {
  const cabeceras = await headers();
  const reenviada = cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim();
  return reenviada || cabeceras.get("x-real-ip") || "desconocida";
}

export async function confirmarPedido(
  _previo: EstadoCheckout,
  formulario: FormData,
): Promise<EstadoCheckout> {
  const validacion = validarCheckout(formulario);
  if (!validacion.ok) {
    return "errores" in validacion
      ? { estado: "error-campos", errores: validacion.errores }
      : { estado: "error", mensaje: validacion.mensaje };
  }

  if (!limitador.intentar(await ipCliente())) {
    return {
      estado: "error",
      mensaje:
        "Has hecho varios pedidos seguidos. Espera unos minutos antes de intentarlo de nuevo.",
    };
  }

  try {
    const resultado = await crearPedido(validacion.datos);
    if (!resultado.ok) {
      return { estado: "error-stock", problemas: resultado.problemas };
    }

    // El detalle lee el stock de la caché: que la próxima visita ya vea el
    // nuevo (lectura de las propias escrituras, solo en Server Actions).
    if (!resultado.repetido) {
      for (const id of resultado.productoIds) {
        updateTag(cacheTags.producto(id));
      }
    }
    return { estado: "ok", codigo: resultado.codigo };
  } catch (error) {
    // Sin datos personales en el registro: solo el tipo de error.
    console.error(
      "checkout: no se pudo crear el pedido",
      error instanceof Error ? error.name : typeof error,
    );
    return {
      estado: "error",
      mensaje:
        "No hemos podido registrar el pedido. No se ha guardado nada; inténtalo de nuevo en unos minutos.",
    };
  }
}
