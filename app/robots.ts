import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/*
 * Las áreas privadas o transaccionales se excluyen, también las que todavía
 * no existen: panel de administración (Fase 12), carrito (Fase 10), checkout
 * y confirmación de pedido (Fase 11; las tres además con `noindex`) y la API
 * interna.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/carrito", "/checkout", "/pedido", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
