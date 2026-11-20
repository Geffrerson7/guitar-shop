import type { Metadata } from "next";
import ogImage from "@/assets/og/voltio-y-madera.jpg";
import { siteConfig } from "./site";

/**
 * Imagen para compartir (1200×630). Se importa en lugar de usar el archivo de
 * convención `opengraph-image`: cuando una página declara su propio
 * `openGraph`, Next.js sustituye el objeto entero y la imagen del archivo se
 * pierde. Pasándola aquí, todas las páginas la llevan.
 */
export const shareImage = {
  url: ogImage.src,
  width: ogImage.width,
  height: ogImage.height,
  alt: "Voltio & Madera — El alma del sonido. Luthiería de autor en Madrid desde 1994.",
};

type PageMetadataInput = {
  /** Título de la página; el layout le añade « — Voltio & Madera». */
  title?: string;
  description: string;
  /** Ruta canónica relativa (se resuelve con `metadataBase`). */
  path: string;
};

/**
 * Metadatos de una página pública: título, descripción, canonical y las
 * versiones Open Graph y Twitter coherentes con ellos, con la imagen para
 * compartir.
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const fullTitle = title
    ? `${title} — ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      url: path,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [shareImage],
    },
  };
}
