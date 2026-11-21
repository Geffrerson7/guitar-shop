import { z } from "zod";
import {
  ORDEN_POR_DEFECTO,
  ordenes,
  type FiltrosCatalogo,
  type Orden,
} from "@/lib/catalogo-url";

/*
 * Estado del catálogo en la URL (Fase 9):
 *   /catalogo?q=&categoria=&marca=&precioMin=&precioMax=&orden=&pagina=
 *
 * Cualquier valor desconocido o mal formado se **ignora** (vuelve al valor
 * por defecto) en lugar de provocar un error: una URL manipulada o antigua
 * siempre muestra un catálogo válido. Los precios de la URL van en euros
 * enteros (lo que escribe el visitante); la consulta los pasa a céntimos.
 */

export {
  hayFiltrosActivos,
  hrefCatalogo,
  ORDEN_POR_DEFECTO,
  ordenes,
  TAMANO_PAGINA,
  type FiltrosCatalogo,
  type Orden,
} from "@/lib/catalogo-url";

const valoresOrden = ordenes.map((orden) => orden.valor) as [Orden, ...Orden[]];

/** Un parámetro repetido (`?q=a&q=b`) se queda con el primer valor. */
const primero = (valor: unknown) => (Array.isArray(valor) ? valor[0] : valor);

/** Texto recortado; vacío equivale a ausente. */
const texto = (max: number) =>
  z.preprocess(
    primero,
    z
      .string()
      .trim()
      .max(max)
      .transform((valor) => valor || undefined)
      .optional()
      .catch(undefined),
  );

const euros = z.preprocess(
  primero,
  z.coerce.number().int().min(0).max(10_000_000).optional().catch(undefined),
);

const schema = z.object({
  q: texto(100),
  categoria: z.preprocess(
    primero,
    z
      .string()
      .regex(/^[a-z0-9-]{1,60}$/)
      .optional()
      .catch(undefined),
  ),
  marca: texto(80),
  // `?precioMin=` (formulario enviado sin JavaScript) llega vacío: ausente.
  precioMin: z.preprocess((v) => (primero(v) === "" ? undefined : v), euros),
  precioMax: z.preprocess((v) => (primero(v) === "" ? undefined : v), euros),
  orden: z.preprocess(primero, z.enum(valoresOrden).catch(ORDEN_POR_DEFECTO)),
  pagina: z.preprocess(
    primero,
    z.coerce.number().int().min(1).max(10_000).catch(1),
  ),
});

type ParametrosUrl = Record<string, string | string[] | undefined>;

/** Valida los `searchParams` del catálogo. Nunca lanza. */
export function parseFiltrosCatalogo(
  params: ParametrosUrl | URLSearchParams,
): FiltrosCatalogo {
  const entrada =
    params instanceof URLSearchParams ? Object.fromEntries(params) : params;
  const filtros = schema.parse(entrada);

  // Un rango invertido se interpreta como el rango correcto.
  if (
    filtros.precioMin !== undefined &&
    filtros.precioMax !== undefined &&
    filtros.precioMin > filtros.precioMax
  ) {
    [filtros.precioMin, filtros.precioMax] = [
      filtros.precioMax,
      filtros.precioMin,
    ];
  }

  return filtros;
}
