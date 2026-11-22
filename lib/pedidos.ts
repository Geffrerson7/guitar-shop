import "server-only";
import { Prisma, type EstadoPedido } from "@/generated/prisma/client";
import type { ProblemaLinea } from "@/features/checkout/tipos";
import {
  calcularPedido,
  esCodigoPedido,
  generarCodigoPedido,
  type ProductoPedido,
} from "@/lib/pedidos-calculo";
import { prisma } from "@/lib/prisma";
import type { DatosCheckout } from "@/lib/validaciones/checkout";

/*
 * Registro de pedidos (Fase 11). Único módulo que escribe pedidos y descuenta
 * stock.
 *
 * Creación en **una transacción**:
 *   1. `SELECT … FOR UPDATE` de los productos, en orden de id. Bloquea sus
 *      filas hasta el final: dos pedidos sobre la última unidad se ejecutan
 *      uno detrás de otro y el segundo ya ve el stock a 0. El orden fijo evita
 *      interbloqueos entre pedidos con varios productos.
 *   2. `calcularPedido` decide con esos datos: precios y stock de la base de
 *      datos, nunca del cliente.
 *   3. Descuento de stock y creación del pedido con sus líneas (nombre, marca
 *      y precio copiados).
 * Si algo falla, no queda nada: ni pedido ni stock descontado.
 *
 * Idempotencia: el formulario manda una clave única por intento. Un reenvío
 * con la misma clave devuelve el pedido existente; si dos envíos llegan a la
 * vez, el índice único de la clave hace fallar al segundo, cuya transacción
 * se deshace entera, y este devuelve el del primero.
 */

export type ResultadoPedido =
  | {
      ok: true;
      codigo: string;
      /** Productos cuyo stock cambió (para invalidar su caché). */
      productoIds: number[];
      /** `true` si la clave ya se había usado: no se ha creado nada nuevo. */
      repetido: boolean;
    }
  | { ok: false; problemas: ProblemaLinea[] };

/** Error interno para deshacer la transacción con el detalle de las líneas. */
class LineasNoDisponibles extends Error {
  constructor(readonly problemas: ProblemaLinea[]) {
    super("Líneas no disponibles");
  }
}

/**
 * Estado con el que nace un pedido. Con el pago simulado no hay nada que
 * esperar: se confirma al crearse. `pendiente` queda para un pago que se
 * confirma después (Fase 11B).
 */
const ESTADO_INICIAL: EstadoPedido = "confirmado";

async function pedidoPorClave(clave: string) {
  return prisma.pedido.findUnique({
    where: { claveIdempotencia: clave },
    select: { codigo: true, lineas: { select: { productoId: true } } },
  });
}

function esViolacionDeUnicidad(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function crearPedido(
  datos: DatosCheckout,
  ahora: Date = new Date(),
): Promise<ResultadoPedido> {
  const existente = await pedidoPorClave(datos.claveIdempotencia);
  if (existente) {
    return {
      ok: true,
      codigo: existente.codigo,
      productoIds: existente.lineas.map((l) => l.productoId),
      repetido: true,
    };
  }

  const ids = [...new Set(datos.lineas.map((l) => l.productoId))].sort(
    (a, b) => a - b,
  );

  try {
    const codigo = await prisma.$transaction(async (tx) => {
      const productos = await tx.$queryRaw<ProductoPedido[]>`
        SELECT "id", "nombre", "marca", "precioCentimos", "stock", "activo"
        FROM "Producto"
        WHERE "id" IN (${Prisma.join(ids)})
        ORDER BY "id"
        FOR UPDATE`;

      const calculo = calcularPedido(datos.lineas, productos);
      if (!calculo.ok) throw new LineasNoDisponibles(calculo.problemas);

      for (const item of calculo.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
          select: { id: true },
        });
      }

      const pedido = await tx.pedido.create({
        data: {
          codigo: generarCodigoPedido(),
          claveIdempotencia: datos.claveIdempotencia,
          estado: ESTADO_INICIAL,
          ...datos.contacto,
          telefono: datos.contacto.telefono ?? null,
          totalCentimos: calculo.totalCentimos,
          consentimientoEn: ahora,
          lineas: { create: calculo.items },
        },
        select: { codigo: true },
      });
      return pedido.codigo;
    });

    return { ok: true, codigo, productoIds: ids, repetido: false };
  } catch (error) {
    if (error instanceof LineasNoDisponibles) {
      return { ok: false, problemas: error.problemas };
    }
    if (esViolacionDeUnicidad(error)) {
      // Otro envío con la misma clave ganó la carrera.
      const ganador = await pedidoPorClave(datos.claveIdempotencia);
      if (ganador) {
        return {
          ok: true,
          codigo: ganador.codigo,
          productoIds: ganador.lineas.map((l) => l.productoId),
          repetido: true,
        };
      }
    }
    throw error;
  }
}

/** Resumen de un pedido para la página de confirmación. */
export interface ResumenPedido {
  codigo: string;
  estado: EstadoPedido;
  nombre: string;
  email: string;
  localidad: string;
  provincia: string;
  totalCentimos: number;
  creadoEn: Date;
  lineas: {
    productoId: number;
    nombre: string;
    marca: string;
    precioUnitarioCentimos: number;
    cantidad: number;
  }[];
}

/** Pedido por su código público, o `null` si no existe o no tiene formato. */
export async function getPedidoPorCodigo(
  codigo: string,
): Promise<ResumenPedido | null> {
  if (!esCodigoPedido(codigo)) return null;

  return prisma.pedido.findUnique({
    where: { codigo },
    select: {
      codigo: true,
      estado: true,
      nombre: true,
      email: true,
      localidad: true,
      provincia: true,
      totalCentimos: true,
      creadoEn: true,
      lineas: {
        orderBy: { id: "asc" },
        select: {
          productoId: true,
          nombre: true,
          marca: true,
          precioUnitarioCentimos: true,
          cantidad: true,
        },
      },
    },
  });
}
