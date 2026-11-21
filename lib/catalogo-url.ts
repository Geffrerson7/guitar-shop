/*
 * Tipos y URLs del catálogo (Fase 9), sin dependencias: lo importan tanto el
 * servidor como los componentes de cliente de los filtros. La validación con
 * Zod vive aparte (lib/validaciones/catalogo.ts) para no llevar Zod al
 * JavaScript del navegador.
 */

export const TAMANO_PAGINA = 8;

export const ordenes = [
  { valor: "destacados", etiqueta: "Destacados" },
  { valor: "precio-asc", etiqueta: "Precio: de menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: de mayor a menor" },
  { valor: "nombre", etiqueta: "Nombre (A–Z)" },
  { valor: "novedad", etiqueta: "Novedades" },
] as const;

export type Orden = (typeof ordenes)[number]["valor"];

export const ORDEN_POR_DEFECTO: Orden = "destacados";

export interface FiltrosCatalogo {
  q?: string;
  categoria?: string;
  marca?: string;
  /** Euros enteros. */
  precioMin?: number;
  /** Euros enteros. */
  precioMax?: number;
  orden: Orden;
  pagina: number;
}

/** Parámetros de la URL, en el orden en que se escriben. */
const claves = [
  "q",
  "categoria",
  "marca",
  "precioMin",
  "precioMax",
  "orden",
  "pagina",
] as const;

/** ¿Hay algún criterio que reduzca los resultados? (el orden no cuenta). */
export function hayFiltrosActivos(filtros: FiltrosCatalogo): boolean {
  return (
    filtros.q !== undefined ||
    filtros.categoria !== undefined ||
    filtros.marca !== undefined ||
    filtros.precioMin !== undefined ||
    filtros.precioMax !== undefined
  );
}

/**
 * URL del catálogo para unos filtros, sin los valores por defecto (orden
 * destacado, página 1) ni los vacíos, para que las URLs sean cortas y
 * estables.
 */
export function hrefCatalogo(
  filtros: Partial<FiltrosCatalogo>,
  cambios: Partial<FiltrosCatalogo> = {},
): string {
  const f: Partial<FiltrosCatalogo> = { ...filtros, ...cambios };
  const params = new URLSearchParams();

  for (const clave of claves) {
    const valor = f[clave];
    if (valor === undefined || valor === "") continue;
    if (clave === "orden" && valor === ORDEN_POR_DEFECTO) continue;
    if (clave === "pagina" && Number(valor) <= 1) continue;
    params.set(clave, String(valor));
  }

  const query = params.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

/**
 * URL a partir de los campos de un formulario de filtros. No valida: el
 * servidor descarta lo que no sea válido. Siempre vuelve a la página 1.
 */
export function hrefDesdeFormulario(
  datos: Iterable<[string, unknown]>,
): string {
  const params = new URLSearchParams();

  for (const [clave, valor] of datos) {
    if (typeof valor !== "string") continue;
    const limpio = valor.trim();
    if (!limpio || clave === "pagina") continue;
    if (clave === "orden" && limpio === ORDEN_POR_DEFECTO) continue;
    params.set(clave, limpio);
  }

  const query = params.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}
