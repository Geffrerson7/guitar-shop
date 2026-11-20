/*
 * Identidad y URL pública del sitio. Las URLs absolutas (canonical, Open
 * Graph, sitemap, robots, JSON-LD) se construyen a partir de `siteUrl`.
 *
 * Orden de resolución, sin depender de un hosting concreto:
 *   1. SITE_URL — la URL pública definitiva (p. ej. https://voltioymadera.es).
 *   2. VERCEL_PROJECT_PRODUCTION_URL — dominio de producción si se despliega
 *      en Vercel y aún no se ha definido SITE_URL.
 *   3. http://localhost:3000 — desarrollo local.
 * El formato de SITE_URL se valida al arrancar en env.ts (Fase 8).
 */

export function resolveSiteUrl(
  env: Record<string, string | undefined> = process.env,
): URL {
  const explicit = env.SITE_URL;
  if (explicit) return new URL(explicit);

  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}

export const siteUrl = resolveSiteUrl();

export const siteConfig = {
  name: "Voltio & Madera",
  tagline: "Luthiería de autor en Madrid",
  description:
    "Luthiería de autor en Madrid desde 1994: guitarras, bajos y amplificadores de boutique elegidos uno a uno y ajustados a mano en nuestro taller.",
  locale: "es_ES",
  themeColor: "#f5efe4",
} as const;

/** URL absoluta de una ruta del sitio. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
