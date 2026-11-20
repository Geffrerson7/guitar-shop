import Image from "next/image";
import type { ImagenProducto } from "@/types/guitarra";

/*
 * `sizes` por composición, calculados sobre el contenedor (max 88rem, padding
 * 20/32/48 px) y la retícula de 12 columnas. Le dicen al navegador qué ancho
 * del `srcset` necesita en cada viewport.
 */
export const imageSizes = {
  /** Tarjeta de 7 columnas del catálogo (gap 40 px). */
  cardWide:
    "(min-width: 1408px) 749px, (min-width: 1024px) calc(58.33vw - 73px), (min-width: 768px) calc(50vw - 52px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)",
  /** Tarjeta de 5 columnas del catálogo (gap 40 px). */
  cardNarrow:
    "(min-width: 1408px) 524px, (min-width: 1024px) calc(41.67vw - 64px), (min-width: 768px) calc(50vw - 52px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)",
  /** Tarjeta de la selección de Home (3 columnas desde md). */
  cardThird:
    "(min-width: 1408px) 411px, (min-width: 1024px) calc(33.33vw - 59px), (min-width: 768px) calc(33.33vw - 48px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)",
  /** Hero de Home: a sangre en móvil y tableta, 5 columnas en escritorio. */
  hero: "(min-width: 1408px) 524px, (min-width: 1024px) calc(41.67vw - 64px), 100vw",
  /** Detalle de producto: a sangre en móvil y tableta, 7 columnas (gap 56 px) en escritorio. */
  detail:
    "(min-width: 1408px) 742px, (min-width: 1024px) calc(58.33vw - 79px), 100vw",
  /** Imagen al ancho completo del contenedor. */
  container:
    "(min-width: 1408px) 1312px, (min-width: 1024px) calc(100vw - 96px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)",
} as const;

type ProductImageProps = {
  src: ImagenProducto;
  alt: string;
  sizes: string;
  /**
   * Imagen LCP de la ruta: carga inmediata y prioridad alta. Solo una por
   * página; el resto se difiere (`loading="lazy"`, valor por defecto).
   */
  lcp?: boolean;
  className?: string;
};

/**
 * Imagen de producto que rellena su contenedor (el padre debe tener
 * `position: relative` y una proporción fija para no provocar CLS).
 */
export default function ProductImage({
  src,
  alt,
  sizes,
  lcp = false,
  className = "",
}: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-cover ${className}`}
      {...(lcp ? { loading: "eager", fetchPriority: "high" } : {})}
    />
  );
}
