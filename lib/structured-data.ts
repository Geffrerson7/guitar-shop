import type { Guitarra, ImagenProducto } from "@/types/guitarra";
import { absoluteUrl, siteConfig } from "./site";

/** URL absoluta de una imagen de producto, sea import estático o remota. */
export function imagenUrl(imagen: ImagenProducto): string {
  return absoluteUrl(typeof imagen === "string" ? imagen : imagen.src);
}

/**
 * Datos estructurados schema.org `Product` para el detalle.
 * Desde la Fase 11 la compra se completa online: con el stock conocido, la
 * disponibilidad es `InStock` u `OutOfStock`. Sin stock (un listado que no lo
 * carga), se mantiene `InStoreOnly`.
 */
export function productJsonLd(guitarra: Guitarra & { stock?: number }) {
  const availability =
    guitarra.stock === undefined
      ? "https://schema.org/InStoreOnly"
      : guitarra.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";

  const url = absoluteUrl(`/producto/${guitarra.id}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#producto`,
    name: guitarra.nombre,
    description: guitarra.descripcion,
    image: [imagenUrl(guitarra.imagen)],
    sku: String(guitarra.id),
    category: guitarra.categoria,
    brand: { "@type": "Brand", name: guitarra.marca },
    url,
    offers: {
      "@type": "Offer",
      url,
      price: (guitarra.precioCentimos / 100).toFixed(2),
      priceCurrency: "EUR",
      availability,
      seller: { "@type": "Organization", name: siteConfig.name },
    },
  };
}

/**
 * Serializa JSON-LD para un `<script type="application/ld+json">`, escapando
 * `<` para que un texto con `</script>` no pueda cerrar la etiqueta.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
