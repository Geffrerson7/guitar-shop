import type { Guitarra, ImagenProducto } from "@/types/guitarra";
import { absoluteUrl, siteConfig } from "./site";

/** URL absoluta de una imagen de producto, sea import estático o remota. */
export function imagenUrl(imagen: ImagenProducto): string {
  return absoluteUrl(typeof imagen === "string" ? imagen : imagen.src);
}

/**
 * Datos estructurados schema.org `Product` para el detalle.
 * La disponibilidad sigue siendo `InStoreOnly`: desde la Fase 10 hay carrito,
 * pero la compra online no se puede completar hasta el checkout (Fase 11).
 */
export function productJsonLd(guitarra: Guitarra) {
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
      availability: "https://schema.org/InStoreOnly",
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
