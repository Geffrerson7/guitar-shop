import type { MetadataRoute } from "next";
import { getGuitarras } from "@/lib/guitarras";
import { absoluteUrl } from "@/lib/site";

const paginas = ["/", "/catalogo", "/acerca", "/contacto", "/privacidad"];

/**
 * Se genera desde la capa de datos: cuando el catálogo pase a PostgreSQL
 * (Fase 8), los productos nuevos aparecen aquí sin tocar este archivo.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guitarras = await getGuitarras();

  return [
    ...paginas.map((path) => ({ url: absoluteUrl(path) })),
    ...guitarras.map((guitarra) => ({
      url: absoluteUrl(`/producto/${guitarra.id}`),
    })),
  ];
}
