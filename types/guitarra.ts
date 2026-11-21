import type { StaticImageData } from "next/image";

/** Categoría del catálogo (tabla `Categoria`). */
export interface Categoria {
  nombre: string;
  slug: string;
}

/**
 * Imagen de producto: una ruta pública (`/guitarras/…`, lo que guarda hoy la
 * base de datos), una URL remota (Cloudinary, Fase 13) o un import estático.
 * `ProductImage` acepta las tres.
 */
export type ImagenProducto = StaticImageData | string;

/**
 * Producto tal como lo consume la interfaz. Es una proyección del modelo
 * `Producto` de Prisma: solo datos serializables, sin fechas ni campos
 * internos (`stock`, `activo`), para que pueda cruzar a componentes de cliente.
 */
export interface Guitarra {
  id: number;
  slug: string;
  nombre: string;
  marca: string;
  /** Precio en céntimos de euro (entero). */
  precioCentimos: number;
  /** Nombre visible de la categoría ("Eléctricas"). */
  categoria: string;
  badge: string | null;
  imagen: ImagenProducto;
  descripcion: string;
  specs: string[];
}
