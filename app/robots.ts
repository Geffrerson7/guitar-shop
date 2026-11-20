import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/*
 * Las áreas privadas o transaccionales se excluyen desde ahora, aunque todavía
 * no existan: panel de administración (Fase 12), carrito (Fase 10), checkout y
 * confirmación de pedido (Fase 11).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/carrito", "/checkout", "/pedido"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
