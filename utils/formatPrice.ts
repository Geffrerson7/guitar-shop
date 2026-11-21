const euroFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Formatea un precio en **céntimos** como euros, con un único criterio
 * (es-ES). Evita que catálogo y detalle muestren importes distintos.
 * Se muestra sin decimales: el catálogo tiene precios en euros redondos.
 */
export function formatPrice(centimos: number): string {
  return euroFormatter.format(centimos / 100);
}
