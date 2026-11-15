const euroFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Formatea un precio en euros con un único criterio (es-ES).
 * Evita que catálogo y detalle muestren importes distintos.
 */
export function formatPrice(value) {
  return euroFormatter.format(value);
}
