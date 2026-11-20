import type { StaticImageData } from "next/image";

export type Categoria = "Eléctricas" | "Acústicas" | "Bajos" | "Accesorios";

/**
 * Imagen de producto: un import estático (hoy, archivos de `assets/`) o una
 * URL remota (Cloudinary, a partir de la Fase 13). `ProductImage` acepta ambas.
 */
export type ImagenProducto = StaticImageData | string;

export interface Guitarra {
  id: number;
  nombre: string;
  marca: string;
  /** Precio en euros (entero). Pasa a céntimos en la Fase 8. */
  precio: number;
  categoria: Categoria;
  badge: string | null;
  imagen: ImagenProducto;
  descripcion: string;
  specs: string[];
}
